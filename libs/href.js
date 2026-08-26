// Where a CMS-authored link actually goes.
//
// Link marks and the `source` field are free text an editor fills, so they are
// untrusted input at a rendering boundary. This module is the single place that
// decides, because the same decision written twice drifted: the allowlist landed
// in the rich-text renderer and not on the sibling anchor one file over.

const SITE_HOST = new URL(
  process.env.NEXT_PUBLIC_HOST ?? 'https://www.ouaknine-avocats.com'
).hostname;

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

    return internal ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch (err) {
    return null;
  }
};

// Whether a link that leaves the site is one we are willing to render at all.
// An allowlist: anything unrecognised keeps its text and loses its href, so a
// `javascript:` or `data:` URL can never reach an anchor.
export const isSafeExternal = href =>
  /^(https?|mailto|tel):/i.test((href ?? '').trim());
