import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HOST,
  markdownSibling,
  markdownUrl,
  pageUrl,
  resolveLocale,
  routePath,
  withLocale,
} from './site-url.mjs';

test('French is unprefixed, English carries /en, the root keeps its slash', () => {
  assert.equal(withLocale('fr', '/'), '/');
  assert.equal(withLocale('en', '/'), '/en');
  assert.equal(withLocale('fr', '/contact'), '/contact');
  assert.equal(withLocale('en', '/contact'), '/en/contact');
  assert.equal(withLocale('en', '/expertise/criminal-law'), '/en/expertise/criminal-law');
});

test('the host is an origin, whatever the environment holds', () => {
  // The value itself comes from libs/site.js, which owns the env parsing; this
  // asserts only the shape every URL here concatenates onto. Pinning a literal
  // would fail the suite for anyone who exports NEXT_PUBLIC_HOST.
  assert.match(HOST, /^https:\/\/[^/]+$/);
  assert.equal(HOST.endsWith('/'), false);
});

test('pageUrl is the same path against the host', () => {
  assert.equal(pageUrl('fr', '/'), `${HOST}/`);
  assert.equal(pageUrl('en', '/'), `${HOST}/en`);
  assert.equal(pageUrl('en', '/about'), `${HOST}/en/about`);
});

test('a locale from a query string is only ever fr or en', () => {
  assert.equal(resolveLocale('fr'), 'fr');
  assert.equal(resolveLocale('en'), 'en');
  assert.equal(resolveLocale('de'), 'fr');
  assert.equal(resolveLocale(undefined), 'fr');
  assert.equal(resolveLocale(['en']), 'fr');
});

test('a locale root spells its markdown sibling /index.md', () => {
  assert.equal(markdownSibling('/'), '/index.md');
  assert.equal(markdownSibling('/en'), '/en/index.md');
  assert.equal(markdownSibling('/contact'), '/contact.md');
  assert.equal(markdownSibling('/en/contact'), '/en/contact.md');
  assert.equal(markdownSibling('/expertise/droit-penal-general'), '/expertise/droit-penal-general.md');
});

test('markdownUrl carries the locale and the host', () => {
  assert.equal(markdownUrl('fr', '/'), `${HOST}/index.md`);
  assert.equal(markdownUrl('en', '/'), `${HOST}/en/index.md`);
  assert.equal(markdownUrl('en', '/contact'), `${HOST}/en/contact.md`);
});

test('routePath survives a query parameter that is not a string', () => {
  // `req.query.path` is an array when the parameter repeats. It used to throw,
  // and the route reported the site as down for a malformed request.
  assert.equal(routePath(['/contact', '/legal']), '/');
  assert.equal(routePath(null), '/');
  assert.equal(routePath(42), '/');
});

test('routePath is the inverse the markdown route reads', () => {
  // `/index` is not folded here: only the `.md` branch may undo the filename a
  // locale root's sibling carries.
  assert.equal(routePath('/index'), '/index');
  assert.equal(routePath('/'), '/');
  assert.equal(routePath(''), '/');
  assert.equal(routePath(undefined), '/');
  assert.equal(routePath('contact'), '/contact');
  assert.equal(routePath('/contact/'), '/contact');
  assert.equal(routePath('/contact///'), '/contact');
  assert.equal(routePath('/expertise/droit-penal-general'), '/expertise/droit-penal-general');
});

test('every public path round-trips through its markdown sibling', () => {
  for (const path of ['/', '/about', '/contact', '/expertise/criminal-law']) {
    for (const locale of ['fr', 'en']) {
      const sibling = markdownSibling(withLocale(locale, path));
      const stem = sibling.slice(0, -'.md'.length).replace(/^\/en/, '');
      assert.equal(routePath(stem === '/index' ? '/' : stem), path);
    }
  }
});
