/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
  images: {
    minimumCacheTTL: 2629800,
    // `domains` is deprecated: a bare hostname allows any path on it.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  reactStrictMode: true,

  // The React Compiler memoizes components and hooks on its own, which is what
  // lets biome.json ban useMemo/useCallback/memo and forwardRef. It runs through
  // Babel on the files an SWC pre-pass says need it; on a site this size that
  // costs nothing measurable. `experimental.turbopackRustReactCompiler` would
  // skip Babel entirely, and is worth revisiting once it leaves experimental.
  reactCompiler: true,

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
