import clientApi from '../../libs/clientApi';
import { expertiseSlug } from '../../libs/expertise';

const PAGES = ['', '/contact', '/expertise', '/legal'];
const LOCALES = [
  ['fr', ''],
  ['en', '/en'],
];

// Every field of expertise is its own page, so every one of them is listed.
const expertisePaths = async () => {
  const docs = await clientApi.fetch(
    `*[_type == "expertise"]{language, "titles": expertiseList[]->title}`
  );

  return LOCALES.flatMap(([locale, prefix]) =>
    (docs.find(doc => doc.language === locale)?.titles ?? []).map(
      title => `${prefix}/expertise/${expertiseSlug(title)}`
    )
  );
};

export default async function handler(req, res) {
  let paths = LOCALES.flatMap(([, prefix]) =>
    PAGES.map(page => `${prefix}${page}`)
  );

  try {
    paths = paths.concat(await expertisePaths());
  } catch (err) {
    // The static pages are still worth serving without the CMS.
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${paths
        .map(
          path => `
            <url>
              <loc>https://www.ouaknine-avocats.com${path}</loc>
            </url>
          `
        )
        .join('')}
    </urlset>
  `;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml');

  // Instructing the Vercel edge to cache the file
  res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  res.end(sitemap);
}
