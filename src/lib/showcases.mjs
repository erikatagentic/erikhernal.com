// The showcase list on /built: every public repo on github.com/erikatagentic
// tagged `showcase`, read from GitHub when the site builds. When GitHub refuses
// the call (its unsigned limit is 60 an hour per address) or the network is
// down, the page uses the saved copy in src/data/showcases.json instead.
// `node scripts/refresh-showcases.mjs` rewrites that saved copy.
//
// Vercel's build runs none of the site's CI checks, so every live name and
// description goes through the same copy and privacy checks here. Any hit, and
// the page uses the saved copy, which PR CI already checked.
import { lintText } from '../../scripts/lint-copy.mjs';
import { scanText } from '../../scripts/check-private.mjs';
import banned from '../../scripts/banned-words.json' with { type: 'json' };

// Same list lint-copy's loadWords reads, imported so the bundled build finds it.
export const BANNED = [...(banned.words ?? []), ...(banned.phrases ?? [])];
export const OWNER = 'erikatagentic';
export const TOPIC = 'showcase';
export const API_URL = `https://api.github.com/users/${OWNER}/repos?type=owner&per_page=100`;
const REPO_PREFIX = `https://github.com/${OWNER}/`;

export function pickShowcases(repos) {
  return repos
    .filter(
      (r) =>
        r &&
        !r.private &&
        !r.fork &&
        !r.archived &&
        Array.isArray(r.topics) &&
        r.topics.includes(TOPIC) &&
        typeof r.html_url === 'string' &&
        r.html_url.startsWith(REPO_PREFIX),
    )
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
      language: r.language ?? null,
      created_at: r.created_at,
    }))
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}

// Returns one line per problem in the repos' visible text; empty means clean.
export function vetShowcases(repos, words) {
  const problems = [];
  for (const r of repos) {
    const text = `${r.name}\n${r.description}`;
    for (const i of lintText(text, words)) problems.push(`${r.name}: ${i.rule} "${i.match}"`);
    for (const h of scanText(text)) problems.push(`${r.name}: ${h.rule} "${h.match}"`);
  }
  return problems;
}

export async function loadShowcases({
  fetchImpl = fetch,
  fallback = [],
  env = process.env,
  log = console,
  words,
} = {}) {
  const saved = (why) => {
    log.warn(`[showcases] using the saved copy: ${why}`);
    return { source: 'saved', repos: fallback };
  };
  if (env.SHOWCASES_OFFLINE === '1') return { source: 'saved', repos: fallback };
  let body;
  try {
    const res = await fetchImpl(API_URL, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'erikhernal.com-build' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return saved(`GitHub answered ${res.status}`);
    body = await res.json();
  } catch (err) {
    return saved(`GitHub call failed (${err?.message ?? err})`);
  }
  if (!Array.isArray(body)) return saved('GitHub answered with something other than a repo list');
  const repos = pickShowcases(body);
  const problems = vetShowcases(repos, words ?? BANNED);
  if (problems.length) return saved(`live text failed the site's checks: ${problems.join('; ')}`);
  return { source: 'live', repos };
}
