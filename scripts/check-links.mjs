// Link check over the built site: every internal link resolves in dist,
// every outside link answers, and every mailto goes to the public address.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';

const isFileIn = (dir) => (rel) => {
  try {
    return statSync(join(dir, rel)).isFile();
  } catch {
    return false;
  }
};
import { join, relative, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const MAILTO_PREFIX = 'mailto:erik@erikhernal.com?subject=';
const SUBJECT_RE = /^[A-Za-z0-9%._-]+$/;
const BOT_WALL = new Set([999, 429]);

export function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function extractHrefs(html) {
  const out = [];
  const re = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m;
  while ((m = re.exec(html))) out.push(decodeEntities(m[1] ?? m[2] ?? m[3] ?? ''));
  return out;
}

// src attributes of img, script and source tags (link tags carry href, read above).
export function extractSrcs(html) {
  const out = [];
  for (const tag of html.match(/<(?:img|script|source)\b[^>]*>/gi) ?? []) {
    const m = tag.match(/\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (m) out.push(decodeEntities(m[1] ?? m[2] ?? m[3] ?? ''));
  }
  return out;
}

export function extractIds(html) {
  const ids = new Set();
  const re = /\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m;
  while ((m = re.exec(html))) ids.add(m[1] ?? m[2] ?? m[3]);
  return ids;
}

// Pure classifier: which kind of href this is.
export function classifyHref(href) {
  if (/^mailto:/i.test(href)) return 'mailto';
  if (/^https?:\/\//i.test(href)) return 'external';
  if (/^(tel|javascript|data):/i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href)) return 'other';
  return 'internal';
}

// Pure mailto rule: right address, a subject, and only safe characters in it.
export function checkMailto(href) {
  if (!href.startsWith(MAILTO_PREFIX)) {
    return { ok: false, reason: `must start with ${MAILTO_PREFIX}` };
  }
  const subject = href.slice(MAILTO_PREFIX.length);
  if (!SUBJECT_RE.test(subject)) return { ok: false, reason: 'subject has characters outside A-Z a-z 0-9 % . _ -' };
  return { ok: true };
}

// Pure status rule for an outside link.
export function judgeStatus(url, status) {
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'fail';
  }
  const isLinkedIn = host === 'linkedin.com' || host.endsWith('.linkedin.com');
  if (isLinkedIn && BOT_WALL.has(status)) return 'skipped';
  if (status >= 200 && status < 400) return 'ok';
  return 'fail';
}

// Pure resolver: maps an internal href, seen on a page, to a dist file and fragment.
export function resolveInternal(href, pagePath) {
  const [beforeHash, fragment = ''] = href.split('#');
  const pathPart = beforeHash.split('?')[0];
  const pageDir = posix.dirname(pagePath);
  let target;
  if (pathPart === '') target = pagePath;
  else if (pathPart.startsWith('/')) target = pathPart;
  else target = posix.normalize(posix.join(pageDir, pathPart));
  if (target.endsWith('/')) target += 'index.html';
  return { file: target.replace(/^\//, ''), fragment: decodeURIComponent(fragment) };
}

// Pure: the dist files an internal path may resolve to, in order.
export function candidates(file) {
  if (file === '' || file.endsWith('/index.html')) return [file || 'index.html'];
  return [file, `${file}/index.html`, `${file}.html`];
}

// Pure, given an isFile test: the first candidate that is a real file, or null.
// A folder with no index.html never counts as a target.
export function findTarget(file, isFile) {
  return candidates(file).find((c) => isFile(c)) ?? null;
}

function walkHtml(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walkHtml(full));
    else if (name.endsWith('.html')) files.push(full);
  }
  return files;
}

async function fetchStatus(url) {
  const opts = { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (link check)' } };
  const attempt = async (method) => {
    const res = await fetch(url, { ...opts, method, signal: AbortSignal.timeout(15000) });
    try {
      await res.body?.cancel();
    } catch {}
    return res.status;
  };
  let status = await attempt('HEAD');
  if (status === 403 || status === 405) status = await attempt('GET');
  return status;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

async function main() {
  if (!existsSync(DIST)) {
    console.log('dist/ not found, run the build first');
    process.exit(1);
  }
  const pages = walkHtml(DIST);
  const idCache = new Map();
  const idsFor = (file) => {
    if (!idCache.has(file)) idCache.set(file, extractIds(readFileSync(join(DIST, file), 'utf8')));
    return idCache.get(file);
  };

  const lines = [];
  let failures = 0;
  const external = new Map();

  for (const page of pages) {
    const pagePath = '/' + relative(DIST, page).split('\\').join('/');
    const html = readFileSync(page, 'utf8');
    for (const href of [...extractHrefs(html), ...extractSrcs(html)]) {
      const kind = classifyHref(href);
      if (kind === 'mailto') {
        const r = checkMailto(href);
        if (!r.ok) failures += 1;
        lines.push(`${r.ok ? 'ok  ' : 'FAIL'}  ${pagePath}  ${href}${r.ok ? '' : `  (${r.reason})`}`);
      } else if (kind === 'internal') {
        const { file, fragment } = resolveInternal(href, pagePath);
        const target = findTarget(file, isFileIn(DIST));
        let reason = '';
        if (!target) reason = 'no such file in dist';
        else if (fragment && target.endsWith('.html') && !idsFor(target).has(fragment)) reason = `no id "${fragment}"`;
        if (reason) failures += 1;
        lines.push(`${reason ? 'FAIL' : 'ok  '}  ${pagePath}  ${href}${reason ? `  (${reason})` : ''}`);
      } else if (kind === 'external') {
        if (!external.has(href)) external.set(href, []);
        external.get(href).push(pagePath);
      } else {
        failures += 1;
        lines.push(`FAIL  ${pagePath}  ${href}  (unsupported scheme)`);
      }
    }
  }

  const urls = [...external.keys()];
  const results = await pool(urls, 8, async (url) => {
    try {
      const status = await fetchStatus(url);
      return { url, status, verdict: judgeStatus(url, status) };
    } catch (err) {
      return { url, status: 0, verdict: 'fail', error: err?.cause?.code || err?.name || 'error' };
    }
  });
  for (const r of results) {
    const where = external.get(r.url).length;
    if (r.verdict === 'fail') failures += 1;
    const tag = r.verdict === 'ok' ? 'ok  ' : r.verdict === 'skipped' ? 'skip' : 'FAIL';
    const note =
      r.verdict === 'skipped' ? `${r.status}, skipped, bot wall` : r.error ? r.error : String(r.status);
    lines.push(`${tag}  ${r.url}  (${note}, on ${where} page${where === 1 ? '' : 's'})`);
  }

  for (const line of lines) console.log(line);
  console.log(`${lines.length} hrefs checked across ${pages.length} pages, ${failures} failed`);
  process.exit(failures ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
