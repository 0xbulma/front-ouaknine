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

  // The articles section was removed with the redesign. Sixteen of its URLs
  // were still earning search traffic, so they are sent on rather than left to
  // 404: the two list pages to the practice areas that replaced them, every
  // article to the home page. Locale prefixes are matched by Next itself.
  async redirects() {
    return [
      { source: '/articles', destination: '/expertise', permanent: true },
      { source: '/articles/:id', destination: '/', permanent: true },
    ];
  },

  // The sitemap is generated, so it lives under /api. Crawlers and tooling
  // look for it at the root.
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap' }];
  },
};

module.exports = nextConfig;
