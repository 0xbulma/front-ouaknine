import EXPERTISE_PAIRS from './expertisePairs';
import { slugify } from './slug';

const SIDE = { fr: 0, en: 1 };

const FIELD_ROUTE = '/expertise/[slug]';

// A field of expertise is a different slug in each language, so its counterpart
// is looked up rather than derived. Every other route is the same path in both.
const counterpartSlug = (router, target) =>
  EXPERTISE_PAIRS.find(slugs => slugs[SIDE[router.locale]] === router.query.slug)?.[
    SIDE[target]
  ];

// Where the language switch should go from the page currently on screen.
//
// A pair that falls out of date — a field renamed in the studio, which changes
// its slug — sends the switch to the index rather than to a URL that does not
// exist.
const localePath = (router, target, availableLocales) => {
  const { pathname, query } = router;

  // A page that only exists in some languages says so through the locales
  // context. Switching to one it does not have goes to that section's index
  // rather than to a URL that 404s: every press cutting is French only, and the
  // editorial brief plans most new pieces the same way.
  if (availableLocales && !availableLocales.includes(target)) {
    return pathname.replace(/\/\[[^\]]+\]$/, '') || '/';
  }

  if (pathname !== FIELD_ROUTE) return { pathname, query };

  const counterpart = counterpartSlug(router, target);
  return counterpart ? `/expertise/${counterpart}` : '/expertise';
};

// The public path a route has in a given language. French is the default
// locale and carries no prefix, so its path is the bare route; the home page is
// `/` in French and `/en` in English.
export const withLocale = (locale, path) =>
  locale === 'fr' ? path : `/${locale}${path === '/' ? '' : path}`;

// A publication references one field of expertise, and the two languages are
// separate Sanity documents with unrelated slugs. Resolve that reference to the
// field's slug in the language being read; null when the pair has no counterpart,
// so the caller can drop the link rather than publish one that 404s.
export const expertiseSlugIn = (title, locale) => {
  const slug = slugify(title);
  if (!slug) return null;

  const pair = EXPERTISE_PAIRS.find(slugs => slugs.includes(slug));
  return pair?.[SIDE[locale]] ?? null;
};

// Both public paths for a field of expertise, from either side's slug. The
// landing page renders the first field and needs to present itself as that
// field, which the router alone cannot tell it.
export const fieldAlternates = slug => {
  const pair = EXPERTISE_PAIRS.find(slugs => slugs.includes(slug));
  if (!pair) return null;

  const [fr, en] = pair;
  return {
    fr: withLocale('fr', `/expertise/${fr}`),
    en: withLocale('en', `/expertise/${en}`),
  };
};

// The same destination as a concrete public path, for a canonical or an
// hreflang.
//
// Returns null when the page has no counterpart in the target language, so the
// caller can leave the annotation out rather than publish a link to a 404,
// which is what an unpaired field of expertise would otherwise get.
export const localeHref = (router, target) => {
  const translated =
    router.pathname === FIELD_ROUTE && target !== router.locale;

  const counterpart = translated ? counterpartSlug(router, target) : null;

  const path = translated
    ? counterpart && `/expertise/${counterpart}`
    : router.asPath.split(/[?#]/)[0];

  return path ? withLocale(target, path) : null;
};

export default localePath;
