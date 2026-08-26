import assert from 'node:assert/strict';
import test from 'node:test';

import { isNegotiablePath, preferredType, varyWithAccept } from './accept.mjs';

// The table published at https://acceptmarkdown.com/guides/accept-parsing
const VECTORS = [
  ['text/markdown', 'text/markdown'],
  ['text/markdown, text/html;q=0.8', 'text/markdown'],
  ['text/html', 'text/html'],
  ['text/markdown;q=0, text/html', 'text/html'],
  [null, 'text/html'],
  ['*/*', 'text/html'],
];

test('published test vectors', () => {
  for (const [header, expected] of VECTORS) {
    assert.equal(preferredType(header), expected, `Accept: ${header}`);
  }
});

test('406 only when every representation is ruled out', () => {
  assert.equal(preferredType('application/pdf'), null);
  // A single q=0 is not a reason to 406 when something else still matches.
  assert.equal(preferredType('text/markdown;q=0'), 'text/html');
  assert.equal(preferredType('text/html;q=0'), 'text/markdown');
});

test('a real browser Accept header resolves to HTML', () => {
  const chrome =
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
  assert.equal(preferredType(chrome), 'text/html');
  assert.equal(preferredType('text/html,application/xhtml+xml,*/*;q=0.8'), 'text/html');
});

test('a specific range beats a wildcard regardless of q', () => {
  // RFC 9110 §12.5.1: the explicit refusal wins over the catch-all.
  assert.equal(preferredType('text/html;q=0, */*'), 'text/markdown');
  assert.equal(preferredType('text/markdown;q=0, */*'), 'text/html');
});

test('a wildcard in another type family matches nothing', () => {
  // `text/*` matching by prefix is what keeps `image/*` and `application/*`
  // from resolving to HTML instead of the 406 gate.
  assert.equal(preferredType('image/*'), null);
  assert.equal(preferredType('application/*'), null);
  assert.equal(preferredType('text/*'), 'text/html');
});

test('subtype wildcards and malformed q values', () => {
  assert.equal(preferredType('text/*'), 'text/html');
  assert.equal(preferredType('text/markdown;q=nonsense'), 'text/markdown');
  assert.equal(preferredType('TEXT/MARKDOWN'), 'text/markdown');
  assert.equal(preferredType('  text/markdown ; q=0.9 '), 'text/markdown');
  assert.equal(preferredType(''), 'text/html');
});

test('client order breaks ties at equal q', () => {
  assert.equal(preferredType('text/markdown, text/html'), 'text/markdown');
  assert.equal(preferredType('text/html, text/markdown'), 'text/html');
});

test('only page paths and .md siblings are negotiated', () => {
  assert.equal(isNegotiablePath('/'), true);
  assert.equal(isNegotiablePath('/contact'), true);
  assert.equal(isNegotiablePath('/expertise/droit-penal-general'), true);
  assert.equal(isNegotiablePath('/contact.md'), true);
  assert.equal(isNegotiablePath('/images/paris-map.svg'), false);
  assert.equal(isNegotiablePath('/robots.txt'), false);
  assert.equal(isNegotiablePath('/sitemap.xml'), false);
  assert.equal(isNegotiablePath('/favicon.ico'), false);
  assert.equal(isNegotiablePath('/site.webmanifest'), false);
});

test('Vary keeps whatever was already there', () => {
  assert.equal(varyWithAccept(null), 'Accept, Accept-Encoding');
  assert.equal(varyWithAccept('Accept-Encoding'), 'Accept-Encoding, Accept');
  assert.equal(varyWithAccept('Accept'), 'Accept');
  assert.equal(varyWithAccept('accept, Accept-Encoding'), 'accept, Accept-Encoding');
});

test('specificity outranks client order, not just position', () => {
  // The named test above puts the specific range first, where the tie-break on
  // order alone gives the same answer — so it passed with the specificity rule
  // deleted. These vectors put the wildcard first, where only §12.5.1's
  // "most specific match wins" produces the right answer.
  assert.equal(preferredType('*/*, text/html;q=0'), 'text/markdown');
  assert.equal(preferredType('*/*;q=0.9, text/markdown;q=0.8'), 'text/html');
  assert.equal(preferredType('*/*, text/markdown;q=0'), 'text/html');
  // A subtype wildcard has to rank below a fully specified type too, or an
  // explicit q=0 on that type would not survive.
  assert.equal(preferredType('text/*, text/html;q=0'), 'text/markdown');
});
