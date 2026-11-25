import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyHref,
  checkMailto,
  judgeStatus,
  resolveInternal,
  extractHrefs,
  extractSrcs,
  findTarget,
} from './check-links.mjs';

test('classifies hrefs', () => {
  assert.equal(classifyHref('/work/reply-rate/'), 'internal');
  assert.equal(classifyHref('#main'), 'internal');
  assert.equal(classifyHref('https://example.com/'), 'external');
  assert.equal(classifyHref('mailto:erik@erikhernal.com?subject=Hi'), 'mailto');
  assert.equal(classifyHref('tel:call-me'), 'other');
});

test('extracts hrefs and decodes entities', () => {
  assert.deepEqual(extractHrefs('<a href="/a/?x=1&amp;y=2">x</a><link href=/b.css>'), [
    '/a/?x=1&y=2',
    '/b.css',
  ]);
});

test('resolves internal hrefs to dist files', () => {
  assert.deepEqual(resolveInternal('/work/reply-rate/', '/index.html'), {
    file: 'work/reply-rate/index.html',
    fragment: '',
  });
  assert.deepEqual(resolveInternal('/#entries', '/work/a/index.html'), {
    file: 'index.html',
    fragment: 'entries',
  });
  assert.deepEqual(resolveInternal('#main', '/built/index.html'), {
    file: 'built/index.html',
    fragment: 'main',
  });
  assert.deepEqual(resolveInternal('/erik-hernal-resume.pdf', '/index.html'), {
    file: 'erik-hernal-resume.pdf',
    fragment: '',
  });
});

test('a good mailto passes', () => {
  assert.deepEqual(checkMailto('mailto:erik@erikhernal.com?subject=Hiring%20a%20GTM%20engineer'), {
    ok: true,
  });
});

test('a mailto to the right address with no subject fails', () => {
  assert.equal(checkMailto('mailto:erik@erikhernal.com').ok, false);
});

test('a mailto to any other address fails', () => {
  assert.equal(checkMailto('mailto:?subject=Hi').ok, false);
  assert.equal(checkMailto('mailto:erik@erikhernal?subject=Hi').ok, false);
});

test('a mailto subject with unencoded characters fails', () => {
  assert.equal(checkMailto('mailto:erik@erikhernal.com?subject=Re: hi').ok, false);
  assert.equal(checkMailto("mailto:erik@erikhernal.com?subject=it's").ok, false);
  assert.equal(checkMailto('mailto:erik@erikhernal.com?subject=').ok, false);
});

test('outside links pass below 400 and fail at 400 and up', () => {
  assert.equal(judgeStatus('https://example.com/', 200), 'ok');
  assert.equal(judgeStatus('https://example.com/', 301), 'ok');
  assert.equal(judgeStatus('https://example.com/', 404), 'fail');
  assert.equal(judgeStatus('https://example.com/', 500), 'fail');
});

test('LinkedIn 999 and 429 are skipped as a bot wall, other hosts are not', () => {
  assert.equal(judgeStatus('https://linkedin.com/in/erikhernal/', 999), 'skipped');
  assert.equal(judgeStatus('https://www.linkedin.com/in/erikhernal/', 429), 'skipped');
  assert.equal(judgeStatus('https://linkedin.com/in/erikhernal/', 404), 'fail');
  assert.equal(judgeStatus('https://example.com/', 999), 'fail');
  assert.equal(judgeStatus('https://notlinkedin.com/', 999), 'fail');
});

test('internal paths resolve only to real files', () => {
  const files = new Set(['index.html', 'work/a/index.html', 'built.html', 'images/x.jpg']);
  const isFile = (f) => files.has(f);
  assert.equal(findTarget('work/a/index.html', isFile), 'work/a/index.html');
  assert.equal(findTarget('work/a', isFile), 'work/a/index.html');
  assert.equal(findTarget('built', isFile), 'built.html');
  assert.equal(findTarget('images/x.jpg', isFile), 'images/x.jpg');
});

test('a folder without an index.html is not a target', () => {
  const isFile = (f) => f === 'images/x.jpg';
  assert.equal(findTarget('images', isFile), null);
  assert.equal(findTarget('images/index.html', isFile), null);
});

test('img and script src attributes are checked, and a missing image fails', () => {
  const html = '<img src="/images/missing.jpg" alt=""><script type="module" src="/_astro/a.js"></script><a href="/">x</a>';
  assert.deepEqual(extractSrcs(html), ['/images/missing.jpg', '/_astro/a.js']);
  const { file } = resolveInternal(extractSrcs(html)[0], '/work/a/index.html');
  assert.equal(findTarget(file, () => false), null);
});
