// The site's own origin, in one place.
//
// This expression was written three times — in the head, in the sitemap and in
// the link resolver — and the three drifted the moment one of them was fixed:
// `??` only falls back on null and undefined, so a Vercel variable created and
// left blank reaches the consumer as an empty string. One copy got `||`, the
// other two did not.
//
// `||` so a blank falls back, and the parse is guarded because this is imported
// at module scope by every page that renders CMS prose: a value without a scheme
// would otherwise throw at import and take the site down rather than produce one
// bad canonical.
const FALLBACK = 'https://www.ouaknine-avocats.com';

const parse = (value: string): URL => {
  try {
    const url = new URL(value);

    // Parseable is not enough. A non-special scheme parses perfectly well and
    // yields the literal string "null" as its origin and an empty hostname, so
    // the guard would pass and every canonical would read `null/contact`. Worse,
    // an empty host is what every non-special scheme parses to, so a `javascript:`
    // link would start resolving as a same-site path and walk straight past the
    // external allowlist.
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url
      : new URL(FALLBACK);
  } catch {
    return new URL(FALLBACK);
  }
};

const url = parse(process.env.NEXT_PUBLIC_HOST || FALLBACK);

// No trailing slash: every consumer concatenates a path onto it.
export const SITE_URL = url.origin;

// The two spellings of this origin. Built from the apex rather than from
// whichever form the env var happens to use, so the pair is the same either way:
// deriving it as [hostname, hostname-without-www] gave two identical entries
// when the var was already the apex, and quietly made every www URL external.
//
// Only these two. A link to any other subdomain is somewhere else, and
// `internalPath` returns a bare path, so calling one internal would move the
// reader to the apex without saying so.
const apex = url.hostname.replace(/^www\./, '');

export const SITE_HOSTS: readonly string[] = [apex, `www.${apex}`];
