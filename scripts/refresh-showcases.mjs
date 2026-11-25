// Rewrites src/data/showcases.json, the saved copy /built falls back to,
// from GitHub's live repo list. Refuses to write when GitHub doesn't answer,
// so a refused call never blanks the saved copy.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadShowcases } from '../src/lib/showcases.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/data/showcases.json');
const got = await loadShowcases({ fallback: null, env: {} });
if (got.source !== 'live') {
  console.error('GitHub did not answer; the saved copy is unchanged.');
  process.exit(1);
}
writeFileSync(OUT, JSON.stringify(got.repos, null, 2) + '\n');
console.log(`Saved ${got.repos.length} showcase repo(s): ${got.repos.map((r) => r.name).join(', ') || 'none'}`);
