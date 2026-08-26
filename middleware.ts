import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { varyWithAccept } from './libs/accept';
import { route } from './libs/middleware-route';
import type { RewriteDecision, Vary } from './libs/middleware-route';

// One URL, two representations: HTML for browsers, markdown for agents.
// https://acceptmarkdown.com/recipes/nextjs
//
// The decision is in libs/middleware-route.ts, where it is testable. This file
// only turns the returned tag into a NextResponse.

const applyVary = (res: NextResponse, vary: Vary | undefined): NextResponse => {
  if (!vary) return res;
  res.headers.set(
    'Vary',
    vary === true ? varyWithAccept(res.headers.get('Vary')) : vary
  );
  return res;
};

// The API routes are not localised, so the destination is the origin plus the
// constant route path rather than `nextUrl.clone()`, which carries the locale
// and would serialise to `/en/api/markdown`. Nothing from the incoming URL
// reaches the route except the parameters set here.
const apiRewrite = (req: NextRequest, { route: to, path }: RewriteDecision) => {
  const url = new URL(to, req.nextUrl.origin);
  url.searchParams.set('locale', req.nextUrl.locale);
  if (path !== undefined) url.searchParams.set('path', path);
  return NextResponse.rewrite(url);
};

export function middleware(req: NextRequest) {
  const { pathname, search, locale } = req.nextUrl;

  const decision = route({
    pathname,
    search,
    locale,
    accept: req.headers.get('accept'),
    isData: Boolean(req.headers.get('x-nextjs-data')),
  });

  if (decision.kind === 'redirect') {
    const url = new URL(decision.to, req.nextUrl.origin);
    return applyVary(NextResponse.redirect(url, 308), decision.vary);
  }

  if (decision.kind === 'rewrite') {
    return applyVary(apiRewrite(req, decision), decision.vary);
  }

  const res = applyVary(NextResponse.next(), decision.vary);
  if (decision.link) res.headers.set('Link', decision.link);
  return res;
}

export const config = {
  // Narrow rather than a bare prefix denylist: every file in public/ would
  // otherwise pay an edge invocation just to be turned away. Matched here are
  // extensionless page paths, `.md` siblings, and the one generated file that
  // has a locale. `_next/data/` cannot be excluded at this level — Next hoists
  // it ahead of the lookahead and rewrites it to the page route — so the
  // handler drops those on the `x-nextjs-data` header, after the branches that
  // answer an explicit `.md` URL and /llms.txt.
  //
  // `/` needs its own entry: the catch-all does not match the bare root.
  matcher: [
    '/',
    '/llms.txt',
    '/((?!api/|_next/|_vercel/)[^.]*)',
    '/((?!api/|_next/|_vercel/).*\\.md)',
  ],
};
