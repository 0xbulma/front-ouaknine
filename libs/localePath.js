import EXPERTISE_PAIRS from './expertisePairs';

const SIDE = { fr: 0, en: 1 };

const FIELD_ROUTE = '/expertise/[slug]';

// Where the language switch should go from the page currently on screen. Most
// routes are the same path in either language; a field of expertise is not,
// so it is looked up by its counterpart's slug.
const localePath = (router, target) => {
  const { pathname, query, locale } = router;

  if (pathname !== FIELD_ROUTE) return { pathname, query };

  const pair = EXPERTISE_PAIRS.find(
    slugs => slugs[SIDE[locale]] === query.slug
  );
  const counterpart = pair?.[SIDE[target]];

  return counterpart ? `/expertise/${counterpart}` : '/expertise';
};

export default localePath;
