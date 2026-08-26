// Where a CMS-authored link actually goes.
//
// Link marks and the `source` field are free text an editor fills, so they are
// untrusted input at a rendering boundary. This module is the single place that
// decides, because the same decision written twice drifted: the allowlist landed
// in the rich-text renderer and not on the sibling anchor one file over.

const FALLBACK_HOST = 'https://www.ouaknine-avocats.com';

// The registrable host, without the www label, so the apex and every subdomain
// both count as the site. Deriving it from the www URL and testing
// `endsWith('.' + host)` matched only `*.www...`, which is nothing, and pushed
// the bare domain an editor gets by copying it onto the external branch.
//
// `||` not `??`: a variable created on Vercel and left blank is an empty string,
// not undefined. And the parse is guarded, because this runs at module scope in
// a module every content page imports: a host without a scheme would otherwise
// throw at import and take the whole site down, where the other readers of the
// same variable only produce a bad canonical.
const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_HOST || FALLBACK_HOST).hostname.replace(
      /^www\./,
      ''
    );
  } catch (err) {
    return new URL(FALLBACK_HOST).hostname.replace(/^www\./, '');
  }
})();

// A same-origin path, or null when the link leaves the site.
//
// Resolved rather than pattern-matched, for two reasons. The CMS authors
// internal links as absolute URLs, so a startsWith('/') test sends the guide's
// own cross-links out to a new tab; and the URL parser strips tabs and treats a
// backslash as a slash, so "/\evil.com" reads as a path and navigates off-site.
export const internalPath = href => {
  const clean = (href ?? '').replace(/[\t\n\r]/g, '');
  if (clean.startsWith('#')) return clean;

  try {
    const url = new URL(clean, 'https://internal.invalid');

    // Compared against the parsed hostname, so userinfo ("https://site@evil.com")
    // and a lookalike suffix ("notouaknine-avocats.com") both fail.
    const internal =
      url.hostname === 'internal.invalid' ||
      url.hostname === SITE_HOST ||
      url.hostname.endsWith(`.${SITE_HOST}`);

    if (!internal) return null;

    // `new URL` resolves `..` before pathname is read, so "/..//evil.com" arrives
    // here as the protocol-relative "//evil.com". Collapsing the leading slashes
    // keeps this function's promise: what it returns is a path on this site.
    return `${url.pathname.replace(/^\/+/, '/')}${url.search}${url.hash}`;
  } catch (err) {
    return null;
  }
};

// Whether a link that leaves the site is one we are willing to render at all.
// An allowlist: anything unrecognised keeps its text and loses its href, so a
// `javascript:` or `data:` URL can never reach an anchor.
export const isSafeExternal = href =>
  /^(https?|mailto|tel):/i.test((href ?? '').trim());
