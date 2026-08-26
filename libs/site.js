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

const parse = value => {
  try {
    return new URL(value);
  } catch (err) {
    return new URL(FALLBACK);
  }
};

const url = parse(process.env.NEXT_PUBLIC_HOST || FALLBACK);

// No trailing slash: every consumer concatenates a path onto it.
export const SITE_URL = url.origin;

// The two hosts this origin actually serves. A link to any other subdomain is
// somewhere else, and `internalPath` returns a bare path, so calling one of them
// internal would silently move the reader to the apex.
export const SITE_HOSTS = [url.hostname, url.hostname.replace(/^www\./, '')];
