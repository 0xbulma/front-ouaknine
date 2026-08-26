import clientApi from '../../libs/clientApi';
import { expertiseSlug } from '../../libs/expertise';
import EXPERTISE_PAIRS from '../../libs/expertisePairs';
import { fetchPublications } from '../../libs/publications';
import { withLocale } from '../../libs/localePath';

const HOST =
  process.env.NEXT_PUBLIC_HOST ?? 'https://www.ouaknine-avocats.com';

const LOCALES = ['fr', 'en'];

// No '/expertise': it renders the first field and canonicalises onto it, so
// listing it here would ask Google to index a URL the page disowns.
const PAGES = ['/', '/contact', '/iska', '/legal', '/publications'];

const escape = value =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const url = (locale, path) => `${HOST}${escape(withLocale(locale, path))}`;

// Every field of expertise is its own page, so every one of them is listed.
//
// The two languages use different slugs and the two Sanity lists are not in the
// same order, so which French field is which English one is read from
// EXPERTISE_PAIRS. The CMS is asked only which slugs currently exist, so a
// field renamed in the studio drops out of the sitemap instead of publishing a
// pair that half 404s.
const expertisePairs = async () => {
  const docs = await clientApi.fetch(
    `*[_type == "expertise"]{language, "titles": expertiseList[]->title}`
  );

  const live = LOCALES.reduce((sets, locale) => {
    const titles = docs.find(doc => doc.language === locale)?.titles ?? [];
    sets[locale] = new Set(titles.map(expertiseSlug));
    return sets;
  }, {});

  return EXPERTISE_PAIRS.filter(
    ([fr, en]) => live.fr?.has(fr) && live.en?.has(en)
  ).map(([fr, en]) => [
    ['fr', `/expertise/${fr}`],
    ['en', `/expertise/${en}`],
  ]);
};

// One <url> per page per language, each carrying the alternates for the whole
// set. Google wants the annotation to be reciprocal, and a sitemap is the one
// place it can be stated for both languages at once.
const entry = (locale, path, alternates, lastmod) => `
  <url>
    <loc>${url(locale, path)}</loc>
    ${alternates
      .map(
        ([hreflang, altPath]) =>
          `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${url(
            hreflang,
            altPath
          )}"/>`
      )
      .join('')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('fr', alternates[0][1])}"/>
    <lastmod>${lastmod}</lastmod>
  </url>`;

export default async function handler(req, res) {
  const lastmod = new Date().toISOString().slice(0, 10);

  // Every page but a field of expertise is the same path in both languages.
  let sets = PAGES.map(path => LOCALES.map(locale => [locale, path]));

  try {
    sets = sets.concat(await expertisePairs());
  } catch (err) {
    // The static pages are still worth serving without the CMS.
  }

  // A publication shares one slug across both languages, so it is the same path
  // in either and needs no counterpart lookup. Only the languages it was
  // actually written in are listed.
  try {
    const byLocale = await Promise.all(
      LOCALES.map(async locale => [locale, await fetchPublications(locale)])
    );

    const slugs = new Set(byLocale.flatMap(([, posts]) => posts.map(p => p.slug)));

    sets = sets.concat(
      [...slugs].map(slug =>
        byLocale
          .filter(([, posts]) => posts.some(p => p.slug === slug))
          .map(([locale]) => [locale, `/publications/${slug}`])
      )
    );
  } catch (err) {
    // As above.
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sets
  .flatMap(set => set.map(([locale, path]) => entry(locale, path, set, lastmod)))
  .join('')}
</urlset>`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  // Instructing the Vercel edge to cache the file
  res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  res.end(sitemap);
}
