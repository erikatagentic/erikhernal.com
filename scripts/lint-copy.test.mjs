import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintText, lintHtml, visibleText, decodeEntities } from './lint-copy.mjs';

const WORDS = ['leverage', 'cutting-edge', 'deep dive'];
const rules = (issues) => issues.map((i) => i.rule);

// A built page as Astro writes it: a conditional block that only renders on some
// pages, text that came from a data field, and a quoted file excerpt.
const page = (inner) => `<!doctype html><html lang="en"><head><title>Erik Hernal</title>
<style>a::after{content:"!"}</style><script>if (!x) { y = "—"; }</script></head>
<body><!-- a note! --><main>${inner}</main></body></html>`;

test('clean copy passes', () => {
  assert.deepEqual(lintText("I write the message, then I check it. It's plain.", WORDS), []);
  assert.deepEqual(lintHtml(page('<h1>I check my own numbers.</h1><p>Plain words.</p>'), WORDS), []);
});

test('fails on an em dash', () => {
  assert.deepEqual(rules(lintText('one thing — another', WORDS)), ['em dash']);
});

test('fails on an en dash', () => {
  assert.deepEqual(rules(lintText('2019 – 2026', WORDS)), ['en dash']);
});

test('fails on an exclamation mark', () => {
  assert.deepEqual(rules(lintText('Great news!', WORDS)), ['exclamation mark']);
});

test('fails on a whole-word banned word, any case, and only whole words', () => {
  const issues = lintText('fine\nWe Leverage data', WORDS);
  assert.deepEqual(issues.map((i) => [i.line, i.rule, i.match]), [[2, 'banned word', 'leverage']]);
  assert.deepEqual(lintText('leveraged leverages releverage', WORDS), []);
  assert.deepEqual(rules(lintText('a cutting-edge tool and a deep dive', WORDS)), ['banned word', 'banned word']);
});

test('ignores the doctype, HTML comments, scripts and styles', () => {
  assert.deepEqual(lintText('<!doctype html>\n<!-- note! — -->\n<p>Hi</p>', WORDS), []);
  assert.deepEqual(lintHtml(page('<p>Hi</p>'), WORDS), []);
});

test('catches a dash, an exclamation and a banned word inside a conditional block', () => {
  const html = page(`<section class="next-entry"><p class="next-entry-head">Next — up</p>
<p>Read it now!</p><p>We leverage it</p></section>`);
  assert.deepEqual(rules(lintHtml(html, WORDS)).sort(), ['banned word', 'em dash', 'exclamation mark']);
});

test('catches the same inside text that came from a data field, entities decoded', () => {
  const html = page(`<ul class="quotes"><li><blockquote><p>It was great&#33; Truly &mdash; great.</p></blockquote>
<p class="quote-who">A client, Leverage &amp; Co</p></li></ul>`);
  assert.deepEqual(rules(lintHtml(html, WORDS)).sort(), ['banned word', 'em dash', 'exclamation mark']);
});

test('catches copy in alt text and the meta description', () => {
  const html = `<html><head><meta name="description" content="Wow!"></head><body><img src="/a.jpg" alt="a cutting-edge panel"></body></html>`;
  assert.deepEqual(rules(lintHtml(html, WORDS)).sort(), ['banned word', 'exclamation mark']);
});

test('skips a quoted file excerpt in a taped-lines pre', () => {
  const html = page(`<pre class="taped-lines" data-x="1">ooo  auto-reply — departed!
negative  "we leverage AI"</pre><p>Plain.</p>`);
  assert.deepEqual(lintHtml(html, WORDS), []);
  assert.ok(!visibleText(html).includes('departed'));
});

test('a pre without the taped-lines class is still linted', () => {
  const html = page('<pre class="other">Hi — there</pre>');
  assert.deepEqual(rules(lintHtml(html, WORDS)), ['em dash']);
});

test('decodes numeric and named entities', () => {
  assert.equal(decodeEntities('a &#8212; b &#x2013; c &ndash; d &amp; e'), 'a — b – c – d & e');
});
