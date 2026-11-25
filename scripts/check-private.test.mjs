import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { scanText, shouldScan, pdfText, pdfInfo, pdfCustom, pdfLinks, pdfLinkText, pdfScanText } from './check-private.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require_latin1 = (file) => readFileSync(file, 'latin1');

// A one-page PDF with no text, plus an optional link annotation.
function writePdf(name, annot = '', info = '') {
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200]${annot ? ' /Annots [4 0 R]' : ''} >>`,
  ];
  if (annot) objs.push(`<< /Type /Annot /Subtype /Link /Rect [0 0 50 50] /A << /S /URI /URI (${annot}) >> >>`);
  if (info) objs.push(`<< ${info} >>`);
  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  const infoRef = info ? ` /Info ${objs.length} 0 R` : '';
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R${infoRef} >>\nstartxref\n${xref}\n%%EOF\n`;
  const file = join(mkdtempSync(join(tmpdir(), 'check-private-')), name);
  writeFileSync(file, out, 'latin1');
  return file;
}

const rules = (hits) => hits.map((h) => h.rule);
const one = (text, rule) => assert.deepEqual(rules(scanText(text)), [rule], text);

test('public copy with the public address passes', () => {
  assert.deepEqual(
    scanText('Write to erik@erikhernal.com or see https://linkedin.com/in/erikhernal/ on 2026-08-24.'),
    [],
  );
});

test('fails on a US phone number in common formats', () => {
  for (const p of ['555-867-5309', '555.867.5309', '555 867 5309', '(555) 867-5309', '+1 555 867 5309', '1-555-867-5309', '5558675309']) {
    one(`call ${p} today`, 'phone number');
  }
});

test('fails on a phone number split by dashes or middle dots', () => {
  one('call 860\u2013555\u20131234', 'phone number');
  one('call 860\u2014555\u20141234', 'phone number');
  one('call 860\u2010555\u20111234', 'phone number');
  one('call 860 \u00b7 555 \u00b7 1234', 'phone number');
});

test('fails on a phone number split by minus signs, bullets or runs of spaces', () => {
  one('call 860\u2212555\u22121234', 'phone number');
  one('call 860 \u2022 555 \u2022 1234', 'phone number');
  one('call 860\u2022555\u20221234', 'phone number');
  one('call 860  555  1234', 'phone number');
});

test('dates, times, long ids and figures are not phone numbers', () => {
  for (const ok of [
    '2026-08-30',
    '2026-08-30T16:26:00',
    '2026-08-30T15:51:29  queued  example.com',
    'probed 2026-09-09T18:20:25Z',
    'lead 1725900025000 and batch 4155551234567',
    '58 positive replies from 15,026 people',
    '15,132 company records and 38,208 credits',
    'out of office July 28 - Aug 21',
    'v10.29.1 of the tool',
  ]) {
    assert.deepEqual(scanText(ok), [], ok);
  }
});

test('fails on career-ops', () => {
  assert.ok(rules(scanText('see career-ops/notes')).includes('career-ops'));
});

test('fails on an onrender.com host', () => {
  assert.deepEqual(rules(scanText('api at my-app.onrender.com')).sort(), ['onrender', 'onrender.com host']);
});

test('fails on a fly.dev host', () => {
  one('runs on probe-worker.fly.dev', 'fly.dev host');
});

test('fails on a URL containing webhook or /hook/', () => {
  one('POST https://example.net/webhook/abc', 'hook URL');
  one('POST https://example.net/api/hook/abc', 'hook URL');
});

test('fails on Make and Zapier hook hosts and any /hooks/ path', () => {
  one('send to hook.us1.make.com/abc123', 'Make hook');
  one('send to hook.eu1.make.com/abc123', 'Make hook');
  assert.ok(rules(scanText('POST https://hooks.zapier.com/hooks/catch/1/x/')).includes('Zapier hook'));
  one('POST https://example.net/api/hooks/abc', 'hook URL');
});

test('the word webhook in prose is not a URL and passes', () => {
  assert.deepEqual(scanText('A workflow wrote every update through one webhook.'), []);
});

test('fails on a Slack incoming hook host', () => {
  one('send to hooks.slack.com/services/T0/B0/x', 'Slack hook');
});

test('fails on n8n.cloud', () => {
  one('runs at acme.app.n8n.cloud', 'n8n.cloud');
});

test('fails on a self-hosted n8n host', () => {
  one('see n8n.example.org/workflow/12', 'n8n host');
});

test('n8n in prose passes', () => {
  assert.deepEqual(scanText('Meetings a month after signal-based routing in n8n, one client'), []);
});

test('fails on an sk- style secret key', () => {
  one('key sk-proj-abcdefghijklmnop1234', 'secret key');
  one('key sk-ant-api03-abcdefghijklmnopqrst', 'secret key');
});

test('fails on a name ending in _KEY, _TOKEN or _SECRET', () => {
  one('process.env.SOME_API_KEY', 'key name');
  one('set SLACK_BOT_TOKEN first', 'key name');
  one('CLIENT_SECRET is missing', 'key name');
});

test('fails on Slack, GitHub and AWS token shapes', () => {
  one('token xoxb-12345-abcdefghijkl', 'Slack token');
  one('use ghp_abcdefghijklmnopqrstuvwx12', 'GitHub token');
  one('use gho_abcdefghijklmnopqrstuvwx12', 'GitHub token');
  one('use github_pat_11ABCDEFG0abcdefghijkl_mnop', 'GitHub token');
  one('id AKIAABCDEFGHIJKLMNOP here', 'AWS key id');
});

test('fails on a key name assigned a credential-looking value, any case', () => {
  one('api_key=abc12345xyz', 'key assignment');
  one('apikey: "Zx81kq0pLm"', 'key assignment');
  one('Secret = s3cr3tvalue99', 'key assignment');
  one('token: abcdefghijklmnopqrstuvwxyz', 'key assignment');
});

test('the words token and secret in prose pass', () => {
  for (const ok of [
    'A token is just a value the server hands back.',
    'The secret: consistency beats volume.',
    'No secret = no problem, the key never touches this page.',
    'token = 5 tries',
  ]) {
    assert.deepEqual(scanText(ok), [], ok);
  }
});

test('fails on a tel: link', () => {
  assert.ok(rules(scanText('tel:+15558675309')).includes('tel link'));
});

test('fails on private IP ranges', () => {
  one('host 10.0.0.12', 'private IP');
  one('host 192.168.1.20', 'private IP');
  one('host 172.20.3.4', 'private IP');
  assert.deepEqual(scanText('public 172.15.3.4 and 8.8.8.8'), []);
});

test('fails on 127.0.0.1 with a port', () => {
  one('dev server 127.0.0.1:4321', 'localhost with port');
});

test('fails on a Clay workspace link', () => {
  one('open app.clay.com/workspaces/1234', 'app.clay.com/workspaces');
});

test('fails on any email address other than the public one', () => {
  const hits = scanText('reply to someone@example.org');
  assert.deepEqual(rules(hits), ['email address']);
  assert.equal(hits[0].match, 'someone@example.org');
  assert.equal(hits[0].line, 1);
});

test('fails on an email written with [at] or (at)', () => {
  one('write to jane [at] example [dot] com', 'obfuscated email');
  one('write to jane(at)example.com', 'obfuscated email');
});

test('scope skips the lockfile, images, fonts and the check itself, but not PDFs or text', () => {
  for (const skip of ['pnpm-lock.yaml', 'public/images/a.jpg', 'public/favicon.ico', 'dist/_astro/x.woff2', 'scripts/check-private.mjs', 'scripts/check-private.test.mjs']) {
    assert.equal(shouldScan(skip), false, skip);
  }
  for (const scan of ['public/erik-hernal-resume.pdf', 'public/favicon.svg', 'README.md', 'PRODUCT.md', '.github/workflows/ci.yml', 'dist/index.html']) {
    assert.equal(shouldScan(scan), true, scan);
  }
});

test('an unreadable PDF fails closed with a clear message', () => {
  assert.throws(() => pdfText('/nonexistent/file.pdf'), /Failing closed/);
});

test('a PDF with no readable text fails closed', () => {
  const file = writePdf('blank.pdf');
  assert.throws(() => pdfText(file), /Can't read text from .*blank\.pdf/);
});

test('link targets and tel/mailto strings in raw PDF bytes are scanned', () => {
  const raw = '1 0 obj << /A << /S /URI /URI (tel:+1 555 867 5309) >> >> /URI <6d61696c746f3a6a616e65406578616d706c652e6f7267> (mailto:erik@erikhernal.com)';
  const links = pdfLinks(Buffer.from(raw, 'latin1'));
  for (const want of ['tel:+1 555 867 5309', 'mailto:jane@example.org', 'mailto:erik@erikhernal.com']) {
    assert.ok(links.includes(want), `${want} in ${JSON.stringify(links)}`);
  }
  const hits = rules(scanText(links.join('\n')));
  assert.ok(hits.includes('tel link') && hits.includes('phone number') && hits.includes('email address'), hits.join(','));
});

test('a PDF link annotation is caught even when the page has no visible text for it', () => {
  const file = writePdf('linked.pdf', 'mailto:someone@example.org');
  assert.deepEqual(pdfLinks(Buffer.from(require_latin1(file), 'latin1')), ['mailto:someone@example.org']);
});

// A PDF 1.5 file whose link annotation lives inside a Flate-compressed object
// stream, indexed by an xref stream, so its target never appears in the raw bytes.
function writeObjStmPdf(name, uri) {
  const parts = [];
  let out = '%PDF-1.5\n';
  const offsets = {};
  const add = (num, body) => {
    offsets[num] = Buffer.byteLength(out, 'latin1');
    out += `${num} 0 obj\n${body}\nendobj\n`;
  };
  add(1, '<< /Type /Catalog /Pages 2 0 R >>');
  add(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  add(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Annots [5 0 R] >>');
  const annot = `<< /Type /Annot /Subtype /Link /Rect [0 0 50 50] /A << /S /URI /URI (${uri}) >> >>`;
  const header = '5 0 ';
  const packed = deflateSync(Buffer.from(header + annot, 'latin1')).toString('latin1');
  add(4, `<< /Type /ObjStm /N 1 /First ${header.length} /Filter /FlateDecode /Length ${packed.length} >>\nstream\n${packed}\nendstream`);
  const row = (type, a, b) => {
    const buf = Buffer.alloc(7);
    buf.writeUInt8(type, 0);
    buf.writeUInt32BE(a, 1);
    buf.writeUInt16BE(b, 5);
    return buf.toString('latin1');
  };
  const xrefAt = Buffer.byteLength(out, 'latin1');
  const rows = [row(0, 0, 65535), row(1, offsets[1], 0), row(1, offsets[2], 0), row(1, offsets[3], 0), row(1, offsets[4], 0), row(2, 4, 0), row(1, xrefAt, 0)].join('');
  out += `6 0 obj\n<< /Type /XRef /Size 7 /W [1 4 2] /Root 1 0 R /Length ${rows.length} >>\nstream\n${rows}\nendstream\nendobj\n`;
  out += `startxref\n${xrefAt}\n%%EOF\n`;
  parts.push(out);
  const file = join(mkdtempSync(join(tmpdir(), 'check-private-')), name);
  writeFileSync(file, parts.join(''), 'latin1');
  return file;
}

test('a tel: link inside a compressed object stream is caught through pdfinfo -url', () => {
  const file = writeObjStmPdf('objstm.pdf', 'tel:+18605551234');
  const raw = readFileSync(file, 'latin1');
  assert.ok(raw.includes('/ObjStm') && !raw.includes('tel:'), 'the link must be hidden from the raw bytes');
  assert.deepEqual(pdfLinks(Buffer.from(raw, 'latin1')), [], 'a raw byte scan alone misses it');
  const hits = rules(scanText(pdfLinkText(file)));
  assert.ok(hits.includes('tel link') && hits.includes('phone number'), hits.join(','));
});

test('any pdfinfo -url failure fails closed, with or without object streams', () => {
  const withStreams = writeObjStmPdf('objstm-nopdfinfo.pdf', 'https://example.org/');
  const plain = writePdf('plain-nopdfinfo.pdf', 'https://example.org/');
  const saved = process.env.PATH;
  process.env.PATH = '';
  try {
    assert.throws(() => pdfLinkText(withStreams), /pdfinfo is not installed.*Failing closed/);
    assert.throws(() => pdfLinkText(plain), /pdfinfo is not installed.*Failing closed/);
  } finally {
    process.env.PATH = saved;
  }
  assert.throws(() => pdfLinkText('/nonexistent/file.pdf'), /pdfinfo failed[\s\S]*Failing closed/);
});

test('a custom info entry such as /Phone is read through pdfinfo -custom', () => {
  const file = writePdf('custom-info.pdf', '', '/Title (Resume) /Phone (860-555-1234)');
  assert.ok(!pdfInfo(file).includes('860-555-1234'), 'plain pdfinfo skips custom keys');
  const custom = pdfCustom(file);
  assert.match(custom, /Phone:\s+860-555-1234/);
  assert.deepEqual(rules(scanText(custom)), ['phone number']);
});

test('pdfinfo metadata is scanned, and a missing pdfinfo fails closed', () => {
  const resume = join(ROOT, 'public/erik-hernal-resume.pdf');
  assert.match(pdfInfo(resume), /Pages:/);
  const saved = process.env.PATH;
  process.env.PATH = '';
  try {
    assert.throws(() => pdfInfo(resume), /pdfinfo is not installed.*Failing closed/);
  } finally {
    process.env.PATH = saved;
  }
});

test('the current resume passes: text, links and metadata', () => {
  assert.deepEqual(scanText(pdfScanText(join(ROOT, 'public/erik-hernal-resume.pdf'))), []);
});
