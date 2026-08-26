import type { NextApiRequest, NextApiResponse } from 'next';

import clientApi from '../../libs/clientApi';
import { expertiseSlug } from '../../libs/expertise';
import EXPERTISE_PAIRS from '../../libs/expertisePairs';
import { fetchPublications } from '../../libs/publications';
import { methodNotAllowed } from '../../libs/query-guard';
import { HOST, LOCALES, withLocale } from '../../libs/site-url';
import type { Locale } from '../../libs/types';

// No '/expertise': it renders the first field and canonicalises onto it, so
// listing it here would ask Google to index a URL the page disowns.
const PAGES = ['/', '/about', '/contact', '/iska', '/legal', '/publications'];

// One URL of the sitemap: the language it is published in and its path.
type Entry = readonly [Locale, string];

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const url = (locale: Locale, path: string) =>
  `${HOST}${escape(withLocale(locale, path))}`;

// Every field of expertise is its own page, so every one of them is listed.
//
// The two languages use different slugs and the two Sanity lists are not in the
// same order, so which French field is which English one is read from
// EXPERTISE_PAIRS. The CMS is asked only which slugs currently exist, so a
// field renamed in the studio drops out of the sitemap instead of publishing a
// pair that half 404s.
const expertisePairs = async (): Promise<Entry[][]> => {
  const docs = await clientApi.fetch<
    { language?: string; titles?: (string | null)[] | null }[] | null
  >(`*[_type == "expertise"]{language, "titles": expertiseList[]->title}`);

  const live = new Map<Locale, Set<string>>(
    LOCALES.map(locale => {
      const titles = (docs ?? []).find(doc => doc.language === locale)?.titles ?? [];
      return [locale, new Set(titles.map(title => expertiseSlug(title)))];
    })
  );

  return EXPERTISE_PAIRS.filter(
    ([fr, en]) => live.get('fr')?.has(fr) && live.get('en')?.has(en)
  ).map(([fr, en]) => [
    ['fr', `/expertise/${fr}`],
    ['en', `/expertise/${en}`],
  ]);
};

// French where there is a French version, and otherwise whatever the set does
// have. Assuming French exists published an unprefixed URL for an
// English-only publication, which is a page the site does not serve.
const defaultHref = (alternates: Entry[]) => {
  const preferred = alternates.find(([l]) => l === 'fr') ?? alternates[0];
  if (!preferred) return '';

  const [locale, path] = preferred;
  return url(locale, path);
};

// One <url> per page per language, each carrying the alternates for the whole
// set. Google wants the annotation to be reciprocal, and a sitemap is the one
// place it can be stated for both languages at once.
const entry = (locale: Locale, path: string, alternates: Entry[], lastmod: string) => `
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
    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref(alternates)}"/>
    <lastmod>${lastmod}</lastmod>
  </url>`;

// No `unexpectedQuery` guard here, unlike the two routes middleware rewrites
// to. `/sitemap.xml` is a next.config.js rewrite, and on Vercel the platform's
// routing layer adds its own parameters to the destination — a strict guard
// answered 404 for the sitemap in preview while passing locally, where
// `next start` performs the rewrite in-process and adds nothing. Losing the
// sitemap is far worse than the `?bust=n` amplification the guard prevented.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (methodNotAllowed(req.method)) {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('');
    return;
  }

  const lastmod = new Date().toISOString().slice(0, 10);

  // Every page but a field of expertise is the same path in both languages.
  let sets: Entry[][] = PAGES.map(path => LOCALES.map(locale => [locale, path] as const));

  try {
    sets = sets.concat(await expertisePairs());
  } catch (err) {
    // The static pages are still worth serving without the CMS, but twenty
    // expertise URLs vanishing quietly is the same failure as below.
    console.error('sitemap expertise', err);
  }

  // A publication shares one slug across both languages, so it is the same path
  // in either and needs no counterpart lookup. Only the languages it was
  // actually written in are listed.
  try {
    const byLocale = await Promise.all(
      LOCALES.map(async locale => [locale, await fetchPublications(locale)] as const)
    );

    const slugs = new Set(byLocale.flatMap(([, posts]) => posts.map(p => p.slug)));

    sets = sets.concat(
      [...slugs].map(slug =>
        byLocale
          .filter(([, posts]) => posts.some(p => p.slug === slug))
          .map(([locale]) => [locale, `/publications/${slug}`] as const)
      )
    );
  } catch (err) {
    // The static pages are still worth serving, but a sitemap that quietly loses
    // every publication is the kind of failure nobody notices for a month.
    console.error('sitemap publications', err);
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
