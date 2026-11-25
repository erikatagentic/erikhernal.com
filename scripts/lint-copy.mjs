// Copy lint over what a visitor actually reads: the visible text of every built
// page in dist/, plus the markdown content files. Fails on em or en dashes,
// exclamation marks and whole-word banned words. Quoted file excerpts (the
// <pre class="taped-lines"> blocks) are skipped, since they show files verbatim.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const CONTENT = join(ROOT, 'src/content');
export const SKIP_CLASS = 'taped-lines';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const NAMED = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  middot: '·',
  excl: '!',
};

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[code.toLowerCase()] ?? m;
  });
}

// Removes every <pre> whose class list holds SKIP_CLASS, by name.
function dropSkippedPre(html) {
  const re = new RegExp(`<pre\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\b${SKIP_CLASS}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/pre>`, 'gi');
  return html.replace(re, '\n');
}

// Visible text of an HTML page, one text run per line. Attribute text that a
// visitor or screen reader gets (alt, aria-label, title, meta description) is kept.
export function visibleText(html) {
  let text = dropSkippedPre(html);
  text = text.replace(/<!--[\s\S]*?-->/g, '\n');
  text = text.replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, '\n');
  const attrs = [];
  text = text.replace(/<[^>]+>/g, (tag) => {
    const isMetaDescription = /^<meta\b/i.test(tag) && /\b(name|property)\s*=\s*["'](description|og:description|og:title)["']/i.test(tag);
    for (const m of tag.matchAll(/\s(alt|aria-label|title|content)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      if (m[1].toLowerCase() === 'content' && !isMetaDescription) continue;
      attrs.push(m[2] ?? m[3] ?? '');
    }
    return '\n';
  });
  const lines = (decodeEntities(text) + '\n' + decodeEntities(attrs.join('\n')))
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return lines.join('\n');
}

// Pure check: returns [{ line, rule, match, text }] for one block of text.
export function lintText(text, words = []) {
  const cleaned = text.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, '')).replace(/<!doctype\b[^>]*>/gi, '');
  const wordRes = words
    .filter(Boolean)
    .map((w) => ({ word: w, re: new RegExp(`(?<![A-Za-z0-9-])${escapeRe(w)}(?![A-Za-z0-9-])`, 'i') }));
  const issues = [];
  cleaned.split('\n').forEach((lineText, i) => {
    const line = i + 1;
    const text = lineText.trim().slice(0, 100);
    if (lineText.includes('—')) issues.push({ line, rule: 'em dash', match: '—', text });
    if (lineText.includes('–')) issues.push({ line, rule: 'en dash', match: '–', text });
    if (lineText.includes('!')) issues.push({ line, rule: 'exclamation mark', match: '!', text });
    for (const { word, re } of wordRes) {
      if (re.test(lineText)) issues.push({ line, rule: 'banned word', match: word, text });
    }
  });
  return issues;
}

export function lintHtml(html, words) {
  return lintText(visibleText(html), words);
}

function walk(dir, exts) {
  let files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files = files.concat(walk(full, exts));
    else if (exts.has(extname(name))) files.push(full);
  }
  return files;
}

export function loadWords(path = join(ROOT, 'scripts/banned-words.json')) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return [...(data.words ?? []), ...(data.phrases ?? [])];
}

function main() {
  if (!existsSync(DIST)) {
    console.log('dist/ not found, run the build first (pnpm exec astro build)');
    process.exit(1);
  }
  const words = loadWords();
  const pages = walk(DIST, new Set(['.html']));
  const markdown = existsSync(CONTENT) ? walk(CONTENT, new Set(['.md', '.mdx'])) : [];
  let withIssues = 0;
  for (const file of [...pages, ...markdown]) {
    const source = readFileSync(file, 'utf8');
    const issues = file.endsWith('.html') ? lintHtml(source, words) : lintText(source, words);
    if (!issues.length) continue;
    withIssues += 1;
    for (const issue of issues) {
      const where = file.endsWith('.html') ? relative(ROOT, file) : `${relative(ROOT, file)}:${issue.line}`;
      console.log(`${where}  ${issue.rule}: ${issue.match}  "${issue.text}"`);
    }
  }
  console.log(`${pages.length + markdown.length} files checked, ${withIssues} with issues`);
  process.exit(withIssues ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
