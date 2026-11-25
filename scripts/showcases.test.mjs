import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickShowcases, loadShowcases } from '../src/lib/showcases.mjs';

const repo = (over = {}) => ({
  name: 'list-gate',
  description: 'A check that refuses to ship a bad lead list.',
  html_url: 'https://github.com/erikatagentic/list-gate',
  homepage: '',
  language: 'JavaScript',
  topics: ['showcase', 'data-quality'],
  private: false,
  fork: false,
  archived: false,
  created_at: '2026-11-26T10:00:00Z',
  ...over,
});

test('keeps only public, unarchived, non-fork repos tagged showcase', () => {
  const got = pickShowcases([
    repo(),
    repo({ name: 'untagged', topics: ['data-quality'] }),
    repo({ name: 'no-topics', topics: undefined }),
    repo({ name: 'secret', private: true }),
    repo({ name: 'forked', fork: true }),
    repo({ name: 'old', archived: true }),
  ]);
  assert.deepEqual(
    got.map((r) => r.name),
    ['list-gate'],
  );
});

test('maps to the fields the page shows, oldest repo first', () => {
  const got = pickShowcases([
    repo({ name: 'scrape-ladder', created_at: '2026-11-27T10:00:00Z', description: null }),
    repo(),
  ]);
  assert.deepEqual(got, [
    {
      name: 'list-gate',
      description: 'A check that refuses to ship a bad lead list.',
      url: 'https://github.com/erikatagentic/list-gate',
      language: 'JavaScript',
      created_at: '2026-11-26T10:00:00Z',
    },
    {
      name: 'scrape-ladder',
      description: '',
      url: 'https://github.com/erikatagentic/list-gate',
      language: 'JavaScript',
      created_at: '2026-11-27T10:00:00Z',
    },
  ]);
});

test('drops a repo whose link is not on github.com/erikatagentic', () => {
  const got = pickShowcases([repo({ html_url: 'https://evil.example/list-gate' })]);
  assert.deepEqual(got, []);
});

const fallback = [{ name: 'saved', description: '', url: 'https://github.com/erikatagentic/saved', language: null, created_at: '2026-11-01T00:00:00Z' }];

test('uses the live list when GitHub answers', async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => [repo()] });
  const got = await loadShowcases({ fetchImpl, fallback });
  assert.equal(got.source, 'live');
  assert.deepEqual(got.repos.map((r) => r.name), ['list-gate']);
});

test('falls back to the saved copy on a refused call, a network error or a bad shape', async () => {
  const cases = [
    async () => ({ ok: false, status: 403, json: async () => ({ message: 'rate limit' }) }),
    async () => {
      throw new Error('offline');
    },
    async () => ({ ok: true, json: async () => ({ message: 'not a list' }) }),
  ];
  for (const fetchImpl of cases) {
    const got = await loadShowcases({ fetchImpl, fallback });
    assert.equal(got.source, 'saved');
    assert.deepEqual(got.repos, fallback);
  }
});

test('SHOWCASES_OFFLINE=1 skips the call', async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    return { ok: true, json: async () => [repo()] };
  };
  const got = await loadShowcases({ fetchImpl, fallback, env: { SHOWCASES_OFFLINE: '1' } });
  assert.equal(called, false);
  assert.equal(got.source, 'saved');
});

const quiet = { warn: () => {} };

test('falls back to the saved copy when a live description fails the copy check', async () => {
  for (const description of ['Fast — and cheap.', 'It works!', 'A robust list check.']) {
    const fetchImpl = async () => ({ ok: true, json: async () => [repo({ description })] });
    const got = await loadShowcases({ fetchImpl, fallback, log: quiet, words: ['robust'] });
    assert.equal(got.source, 'saved', description);
    assert.deepEqual(got.repos, fallback);
  }
});

test('falls back to the saved copy when a live description fails the privacy check', async () => {
  for (const description of [`Mail ops${'@'}example.com for access.`, `Set api${'_'}key=abc123def456 first.`]) {
    const fetchImpl = async () => ({ ok: true, json: async () => [repo({ description })] });
    const got = await loadShowcases({ fetchImpl, fallback, log: quiet, words: [] });
    assert.equal(got.source, 'saved', description);
  }
});

test('says why on every fallback', async () => {
  const lines = [];
  const log = { warn: (m) => lines.push(m) };
  await loadShowcases({ fetchImpl: async () => ({ ok: false, status: 403 }), fallback, log, words: [] });
  await loadShowcases({ fetchImpl: async () => { throw new Error('offline'); }, fallback, log, words: [] });
  await loadShowcases({
    fetchImpl: async () => ({ ok: true, json: async () => [repo({ description: 'It works!' })] }),
    fallback,
    log,
    words: [],
  });
  assert.equal(lines.length, 3);
  assert.match(lines[0], /403/);
  assert.match(lines[1], /offline/);
  assert.match(lines[2], /list-gate.*exclamation mark/);
});
