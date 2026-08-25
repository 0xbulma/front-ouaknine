const PATHS = [
  '',
  '/en',
  '/contact',
  '/en/contact',
  '/expertise',
  '/en/expertise',
  '/legal',
  '/en/legal',
];

export default async function handler(req, res) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${PATHS.map(
        path => `
            <url>
              <loc>https://www.ouaknine-avocats.com${path}</loc>
            </url>
          `
      ).join('')}
    </urlset>
  `;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml');

  // Instructing the Vercel edge to cache the file
  res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  res.end(sitemap);
}
