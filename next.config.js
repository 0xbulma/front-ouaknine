/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
  images: {
    minimumCacheTTL: 2629800,
    loader: 'default',
    domains: ['cdn.sanity.io'],
    // dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: true,
  swcMinify: true,

  // The articles section is now /publications. Its list pages redirect here;
  // an individual article is resolved by pages/articles/[id].jsx, which looks
  // the post up and sends it to its own slug. Locale prefixes are matched by
  // Next itself.
  async redirects() {
    return [
      { source: '/articles', destination: '/publications', permanent: true },
    ];
  },

  // The sitemap is generated, so it lives under /api. Crawlers and tooling
  // look for it at the root.
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap' }];
  },
};

module.exports = nextConfig;
