// Fails if anything private could ship: phone numbers, internal hosts, hook
// URLs, key names and secrets, private IPs, workspace links, or any email but
// the public one. Scans every file git knows about (tracked, plus new files not
// ignored), the built site in dist/, and every PDF's text, links and metadata.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_EMAIL = 'erik@erikhernal.com';
const SKIP_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot']);
const SKIP_NAMES = new Set(['pnpm-lock.yaml']);
const SELF = new Set(['scripts/check-private.mjs', 'scripts/check-private.test.mjs']);

// Separators between digit groups: a run of spaces, or a dot, hyphen, any
// Unicode dash (U+2010 to U+2015), minus sign, middle dot or bullet, with
// optional spaces around it.
const SEP = '(?:\\s{0,3}[.\\-\\u2010-\\u2015\\u2212\\u00B7\\u2022]\\s{0,3}|\\s{1,4})?';
const PHONE = new RegExp(
  `(?<![\\w+.])(?:\\+?1${SEP})?\\(?\\d{3}\\)?${SEP}\\d{3}${SEP}\\d{4}\\b(?![.:]?\\d)`,
);
const URL_RE = /https?:\/\/[^\s"'<>`)]+/gi;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const PATTERNS = [
  ['career-ops', /career-ops/i],
  ['onrender', /onrender/i],
  ['onrender.com host', /[\w-]+\.onrender\.com\b/i],
  ['fly.dev host', /[\w-]+\.fly\.dev\b/i],
  ['Slack hook', /hooks\.slack\.com/i],
  ['Make hook', /\bhook\.[a-z0-9-]+\.make\.com\b/i],
  ['Zapier hook', /hooks\.zapier\.com/i],
  ['n8n.cloud', /n8n\.cloud\b/i],
  ['n8n host', /\b(?:[\w-]+\.)*[\w-]*n8n[\w-]*\.(?!cloud\b)[a-z][\w-]*(?:\.[a-z][\w-]*)*\b/i],
  ['secret key', /\bsk-(?:[a-z]+[_-])?[A-Za-z0-9_-]{16,}/],
  ['key name', /\b[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*_(?:KEY|TOKEN|SECRET)\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['GitHub token', /\b(?:gh[po]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['AWS key id', /\bAKIA[0-9A-Z]{16}\b/],
  // a key name assigned a value; the value must look like a credential (a digit
  // in it, or 20+ characters) so "the secret: consistency" in prose passes
  [
    'key assignment',
    /\b(?:api[_-]?key|secret|token)\s*[:=]\s*["']?(?:(?=[\w./+=-]*\d)[\w./+=-]{8,}|[\w./+=-]{20,})/i,
  ],
  ['tel link', /\btel:\s*\+?[\d(]/i],
  ['private IP', /\b(?:10\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3})\.\d{1,3}\b(?!\.\d)/],
  ['localhost with port', /\b127\.0\.0\.1:\d+/],
  ['app.clay.com/workspaces', /app\.clay\.com\/workspaces/i],
  ['obfuscated email', /[\w.+-]+\s*[[(]\s*at\s*[\])]\s*[\w-]+(?:\s*(?:\.|[[(]\s*dot\s*[\])])\s*[\w-]+)+/i],
];

// Pure scan: returns [{ line, rule, match }] for one block of text.
export function scanText(text) {
  const hits = [];
  text.split('\n').forEach((lineText, i) => {
    const line = i + 1;
    const phone = lineText.match(PHONE);
    if (phone) hits.push({ line, rule: 'phone number', match: phone[0] });
    for (const [rule, re] of PATTERNS) {
      const m = lineText.match(re);
      if (m) hits.push({ line, rule, match: m[0] });
    }
    for (const url of lineText.match(URL_RE) ?? []) {
      if (/webhook|\/hooks?\//i.test(url)) hits.push({ line, rule: 'hook URL', match: url });
    }
    for (const email of lineText.match(EMAIL_RE) ?? []) {
      if (email.toLowerCase() !== PUBLIC_EMAIL) hits.push({ line, rule: 'email address', match: email });
    }
  });
  return hits;
}

// Pure filter: should this repo-relative path be scanned at all?
export function shouldScan(path) {
  const rel = path.split('\\').join('/');
  if (SELF.has(rel)) return false;
  if (SKIP_NAMES.has(basename(rel))) return false;
  return !SKIP_EXT.has(extname(rel).toLowerCase());
}

const failClosed = (file, why) => new Error(`Can't read ${file}: ${why}. Failing closed.`);

function runPoppler(tool, args, file, after = []) {
  try {
    return execFileSync(tool, [...args, file, ...after], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const why = err.code === 'ENOENT' ? `${tool} is not installed (install poppler-utils)` : `${tool} failed: ${err.message}`;
    throw failClosed(file, why);
  }
}

// Text of a PDF via pdftotext. Throws if the tool is missing, errors, or reads
// no text at all, so the check fails closed instead of passing an unread file.
export function pdfText(file) {
  const text = runPoppler('pdftotext', ['-q'], file, ['-']);
  if (!text.trim()) throw new Error(`Can't read text from ${file}. Failing closed.`);
  return text;
}

// Document metadata via pdfinfo: the info dictionary and the XMP metadata stream.
export function pdfInfo(file) {
  return runPoppler('pdfinfo', [], file);
}

export function pdfMeta(file) {
  return runPoppler('pdfinfo', ['-meta'], file);
}

// Every info dictionary entry, including non-standard keys like /Phone.
export function pdfCustom(file) {
  return runPoppler('pdfinfo', ['-custom'], file);
}

// Every link target poppler resolves, including links stored inside compressed
// object streams, which a scan of the raw bytes can't see.
export function pdfUrls(file) {
  return runPoppler('pdfinfo', ['-url'], file);
}

const unescapePdfString = (s) =>
  s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (m, c) => {
    if (/^[0-7]+$/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' }[c] ?? c;
  });

// Pure: link targets and tel:/mailto: strings in raw PDF bytes, one per line.
// Text extraction never sees these, so a phone link hidden behind a word or a
// different address in a mailto would otherwise ship unnoticed.
export function pdfLinks(bytes) {
  const raw = Buffer.isBuffer(bytes) ? bytes.toString('latin1') : String(bytes);
  const found = [];
  for (const m of raw.matchAll(/\/URI\s*\(((?:\\.|[^\\)])*)\)/g)) found.push(unescapePdfString(m[1]));
  for (const m of raw.matchAll(/\/URI\s*<([0-9a-fA-F\s]*)>/g)) {
    found.push(Buffer.from(m[1].replace(/\s+/g, ''), 'hex').toString('latin1'));
  }
  for (const m of raw.matchAll(/(?:tel|mailto):[^\s()<>"'\]\\]+/gi)) found.push(m[0]);
  return [...new Set(found)];
}

// Link targets from pdfinfo -url plus a raw-byte scan for tel: and mailto:.
// pdfinfo is required, so any pdfinfo -url failure fails closed: a raw scan
// alone misses links kept in compressed object streams.
export function pdfLinkText(file) {
  return `${pdfUrls(file)}\n${pdfLinks(readFileSync(file)).join('\n')}`;
}

// Everything in a PDF worth scanning: its text, its link targets, its metadata.
export function pdfScanText(file) {
  return [pdfText(file), pdfLinkText(file), pdfInfo(file), pdfCustom(file), pdfMeta(file)].join('\n');
}

function gitFiles(root) {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

function walk(dir) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

export function filesToScan(root = ROOT) {
  const rels = new Set(gitFiles(root));
  const dist = join(root, 'dist');
  if (existsSync(dist)) for (const f of walk(dist)) rels.add(relative(root, f).split('\\').join('/'));
  return [...rels].filter((rel) => shouldScan(rel) && existsSync(join(root, rel))).sort();
}

function main() {
  let files;
  try {
    files = filesToScan();
  } catch (err) {
    console.log(`Can't list files with git ls-files: ${err.message}`);
    process.exit(1);
  }
  let count = 0;
  for (const rel of files) {
    const full = join(ROOT, rel);
    let text;
    try {
      text = extname(rel).toLowerCase() === '.pdf' ? pdfScanText(full) : readFileSync(full, 'utf8');
    } catch (err) {
      console.log(err.message);
      process.exit(1);
    }
    for (const hit of scanText(text)) {
      count += 1;
      console.log(`${rel}:${hit.line}  ${hit.rule}: ${hit.match}`);
    }
  }
  console.log(`${files.length} files scanned, ${count} private hits`);
  process.exit(count ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
