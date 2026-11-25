import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSeconds, isTimestamp } from '../src/lib/timestamps.mjs';

test('converts m:ss and mm:ss to seconds', () => {
  assert.equal(toSeconds('3:49'), 229);
  assert.equal(toSeconds('0:05'), 5);
  assert.equal(toSeconds('12:00'), 720);
});

test('rejects anything that is not m:ss', () => {
  for (const bad of ['3:4', '349', '1:02:03', 'a:bc', '', '3:60', ' 3:49']) {
    assert.equal(isTimestamp(bad), false, bad);
    assert.throws(() => toSeconds(bad), /must look like m:ss/, bad);
  }
  assert.throws(() => toSeconds(undefined), /must look like m:ss/);
});
