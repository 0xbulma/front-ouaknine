// How this site spells its own URLs. One definition, because a canonical, an
// hreflang, a sitemap entry and the markdown representation of a page all have
// to agree.

import { SITE_URL } from './site.js';

export const LOCALES = ['fr', 'en'];

const DEFAULT_LOCALE = 'fr';

// The origin comes from libs/site.js, which guards a blank or unparseable env
// var and strips the trailing slash — this module used to carry its own
// expression, and that is exactly the drift site.js exists to end.
export const HOST = SITE_URL;

// A locale arriving from a query string is untrusted, and every renderer
// indexes content by it.
export const resolveLocale = value =>
  LOCALES.includes(value) ? value : DEFAULT_LOCALE;

// The public path a route has in a given language. French is the default
// locale and carries no prefix, so its path is the bare route; the home page is
// `/` in French and `/en` in English.
export const withLocale = (locale, path) =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path === '/' ? '' : path}`;

// The same, absolute.
export const pageUrl = (locale, path) => `${HOST}${withLocale(locale, path)}`;

// The markdown sibling of a public path. A locale root has no filename to hang
// `.md` on, so it spells its sibling `/index.md`. Derived from LOCALES rather
// than from `/en` literals, so a third language does not silently produce
// `/de.md`, a URL the markdown route resolves back to `/de` and answers 404.
export const markdownSibling = publicPath => {
  const path = publicPath || '/';
  const isRoot = path === '/' || LOCALES.some(locale => path === `/${locale}`);
  const stem = isRoot ? `${path === '/' ? '' : path}/index` : path;
  return `${stem}.md`;
};

export const markdownUrl = (locale, path) =>
  `${HOST}${markdownSibling(withLocale(locale, path))}`;

// The inverse, for the markdown route: the locale-stripped path a request is
// asking for.
//
// `/index` is not folded to the root here. That spelling only exists because
// `markdownSibling` gives a locale root a filename, so only the `.md` branch
// may undo it — folding it here would make `/index` a second negotiable URL
// for the home page, answering 200 in markdown and 404 in HTML.
export const routePath = value => {
  // `req.query.path` is an array when the parameter repeats, and undefined when
  // it is absent. Neither is a bad URL worth a 503; both are the root.
  const path = typeof value === 'string' ? value : '';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};
