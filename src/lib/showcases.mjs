// The showcase list on /built: every public repo on github.com/erikatagentic
// tagged `showcase`, read from GitHub when the site builds. When GitHub refuses
// the call (its unsigned limit is 60 an hour per address) or the network is
// down, the page uses the saved copy in src/data/showcases.json instead.
// `node scripts/refresh-showcases.mjs` rewrites that saved copy.
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

export async function loadShowcases({ fetchImpl = fetch, fallback = [], env = process.env } = {}) {
  if (env.SHOWCASES_OFFLINE === '1') return { source: 'saved', repos: fallback };
  try {
    const res = await fetchImpl(API_URL, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'erikhernal.com-build' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { source: 'saved', repos: fallback };
    const body = await res.json();
    if (!Array.isArray(body)) return { source: 'saved', repos: fallback };
    return { source: 'live', repos: pickShowcases(body) };
  } catch {
    return { source: 'saved', repos: fallback };
  }
}
