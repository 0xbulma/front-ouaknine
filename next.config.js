/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 12 gives `next dev` and `next build` the same ./.next, so a dev server
  // left running in the workspace overwrites the production build while you are
  // curling `next start` against it. The symptoms look like real bugs: a 500 on
  // /404 with MissingStaticPage, or `jsxDEV is not a function` from a route
  // recompiled in development mode. Set NEXT_DIST_DIR to give a verification
  // build a directory of its own:
  //
  //   NEXT_DIST_DIR=.next-verify yarn build
  //   NEXT_DIST_DIR=.next-verify PORT=3111 yarn start
  //
  // Next 16 does this itself; `next dev` writes to .next/dev.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),

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
