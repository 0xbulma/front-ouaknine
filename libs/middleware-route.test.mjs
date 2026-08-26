import assert from 'node:assert/strict';
import test from 'node:test';

import { HOST } from './site-url.mjs';
import {
  MARKDOWN_ROUTE,
  NOT_ACCEPTABLE_ROUTE,
  route,
} from './middleware-route.mjs';

const CHROME =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';

test('a browser gets the page, plus Vary and the markdown alternate', () => {
  const decision = route({ pathname: '/contact', accept: CHROME });

  assert.equal(decision.kind, 'pass');
  assert.equal(decision.vary, true);
  assert.equal(
    decision.link,
    `<${HOST}/contact.md>; rel="alternate"; type="text/markdown"`
  );
});

test('the alternate carries the locale', () => {
  const decision = route({ pathname: '/contact', locale: 'en', accept: CHROME });

  assert.ok(decision.link.startsWith(`<${HOST}/en/contact.md>`), decision.link);
});

test('an agent asking for markdown is rewritten to the markdown route', () => {
  const decision = route({ pathname: '/contact', accept: 'text/markdown' });

  assert.deepEqual(decision, {
    kind: 'rewrite',
    route: MARKDOWN_ROUTE,
    path: '/contact',
    vary: true,
  });
});

test('an explicit .md URL is markdown whatever the Accept header says', () => {
  for (const accept of [CHROME, undefined, '*/*']) {
    const decision = route({ pathname: '/contact.md', accept });

    assert.equal(decision.kind, 'rewrite');
    assert.equal(decision.route, MARKDOWN_ROUTE);
    assert.equal(decision.path, '/contact');
  }
});

test('an Accept header that rules out both types is a 406', () => {
  const decision = route({ pathname: '/contact', accept: 'application/pdf' });

  assert.equal(decision.kind, 'rewrite');
  assert.equal(decision.route, NOT_ACCEPTABLE_ROUTE);
  assert.equal(decision.vary, true);
});

test('/llms.txt is rewritten to its generator', () => {
  assert.deepEqual(route({ pathname: '/llms.txt', accept: CHROME }), {
    kind: 'rewrite',
    route: '/api/llms',
    path: undefined,
  });
});

test('a non-negotiable path is passed straight through', () => {
  const decision = route({ pathname: '/favicon.ico', accept: CHROME });

  assert.deepEqual(decision, { kind: 'pass' });
});

// --- the ordering cases, each of which shipped as a bug ---

test('a query string on a markdown request collapses onto the bare path', () => {
  for (const pathname of ['/contact.md', '/llms.txt']) {
    const decision = route({ pathname, search: '?bust=1', accept: CHROME });

    assert.equal(decision.kind, 'redirect', pathname);
    assert.equal(decision.to, pathname, pathname);
  }

  const negotiated = route({ pathname: '/', search: '?bust=1', accept: 'text/markdown' });
  assert.equal(negotiated.kind, 'redirect');
  assert.equal(negotiated.to, '/');
});

test('the collapse keeps the locale, and carries Vary', () => {
  // Built from the locale-stripped pathname alone, this 308 permanently
  // redirected every English edition to the French one.
  const decision = route({
    pathname: '/contact.md',
    search: '?bust=1',
    locale: 'en',
    accept: CHROME,
  });

  assert.equal(decision.to, '/en/contact.md');
  assert.equal(decision.vary, true);
});

test('the HTML branch keeps its query, where a campaign parameter is legitimate', () => {
  const decision = route({ pathname: '/contact', search: '?utm_source=x', accept: CHROME });

  assert.equal(decision.kind, 'pass');
});

test('a data prefetch is passed through, naming the header in Vary', () => {
  // The flag comes from a request header a client can send, so a cache keyed on
  // (URL, Accept) alone would hand this variant to the next client asking for
  // markdown.
  const decision = route({ pathname: '/contact', accept: 'text/markdown', isData: true });

  assert.equal(decision.kind, 'pass');
  assert.equal(decision.vary, 'Accept, Accept-Encoding, x-nextjs-data');
});

test('the data flag does not preempt an explicit .md URL or /llms.txt', () => {
  // Placed above those branches, the flag answered both with an empty data
  // document instead of the file that was asked for.
  const md = route({ pathname: '/contact.md', accept: CHROME, isData: true });
  assert.equal(md.kind, 'rewrite');
  assert.equal(md.route, MARKDOWN_ROUTE);

  const llms = route({ pathname: '/llms.txt', accept: CHROME, isData: true });
  assert.equal(llms.kind, 'rewrite');
  assert.equal(llms.route, '/api/llms');
});

test('every branch that answers on the negotiated path sets Vary', () => {
  // Without it a CDN serves whichever variant it cached first to everyone.
  const negotiated = [
    { pathname: '/contact', accept: CHROME },
    { pathname: '/contact', accept: 'text/markdown' },
    { pathname: '/contact', accept: 'application/pdf' },
    { pathname: '/contact.md', accept: CHROME },
    { pathname: '/contact', accept: CHROME, isData: true },
    { pathname: '/contact.md', search: '?x=1', accept: CHROME },
  ];

  for (const input of negotiated) {
    assert.ok(route(input).vary, JSON.stringify(input));
  }
});

test('a .md spelling nothing publishes is not a second URL for the page', () => {
  // `/contact/.md` sliced to `/contact/`, which routePath trimmed back to
  // `/contact`, so every page answered 200 markdown at a URL no annotation
  // names — a duplicate representation and an extra CDN key.
  for (const pathname of ['/contact/.md', '/.md', '/en/.md', '/expertise/.md']) {
    assert.deepEqual(route({ pathname, accept: 'text/markdown' }), { kind: 'pass' }, pathname);
  }

  // The canonical spellings still resolve.
  assert.equal(route({ pathname: '/contact.md', accept: '*/*' }).kind, 'rewrite');
  assert.equal(route({ pathname: '/index.md', accept: '*/*' }).path, '/');
});

test('only the .md branch may spell the root as index', () => {
  // `/index.md` is the sibling `markdownSibling` publishes for a locale root,
  // so it resolves to `/`. `/index` reached by negotiation is not a URL this
  // site has: it answered 200 markdown while its HTML twin answered 404.
  assert.equal(route({ pathname: '/index.md', accept: '*/*' }).path, '/');

  const negotiated = route({ pathname: '/index', accept: 'text/markdown' });
  assert.equal(negotiated.kind, 'rewrite');
  assert.equal(negotiated.path, '/index');
});
