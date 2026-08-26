import assert from 'node:assert/strict';
import test from 'node:test';

import { staticPageProps } from './static-page-props.mjs';

const silence = fn => {
  const previous = console.error;
  console.error = () => {};
  return Promise.resolve(fn()).finally(() => {
    console.error = previous;
  });
};

test('a fetched document becomes props, revalidating', async () => {
  const props = staticPageProps(async () => ({ title: 'T' }), '/');

  assert.deepEqual(await props({ locale: 'fr' }), {
    props: { data: { title: 'T' } },
    revalidate: 10,
  });
});

test('the fetcher receives the locale, defaulting to undefined off a bare call', async () => {
  const seen = [];
  const props = staticPageProps(async locale => {
    seen.push(locale);
    return { title: 'T' };
  }, '/');

  await props({ locale: 'en' });
  await props();

  assert.deepEqual(seen, ['en', undefined]);
});

test('a missing document is a 404 that expires', async () => {
  // Without `revalidate` Next caches the not-found entry with no expiry, so the
  // page stays a 404 until the next deploy. The key must be present.
  const props = staticPageProps(async () => null, '/contact');
  const result = await props({ locale: 'fr' });

  assert.equal(result.notFound, true);
  assert.equal(result.revalidate, 10);
});

test('an unreachable CMS rejects rather than publishing a 404', async () => {
  // A rejection is not "this page does not exist": rethrowing keeps the last
  // good page on a background revalidation and fails the build on a cold one.
  const boom = new Error('sanity is down');
  const props = staticPageProps(async () => {
    throw boom;
  }, '/legal');

  await silence(() =>
    assert.rejects(() => props({ locale: 'fr' }), err => err === boom)
  );
});

test('a props builder shapes the props and can reject the page', async () => {
  // The two expertise routes derive a slug and their own SEO, and a slug that
  // matches no field is a 404 even though the document loaded.
  const doc = { expertiseList: [{ title: 'Droit pénal général' }] };

  const found = staticPageProps(async () => doc, '/expertise', (data, ctx) => ({
    data,
    slug: ctx.params.slug,
  }));
  assert.deepEqual(await found({ locale: 'fr', params: { slug: 'a' } }), {
    props: { data: doc, slug: 'a' },
    revalidate: 10,
  });

  const missing = staticPageProps(async () => doc, '/expertise', () => null);
  const result = await missing({ locale: 'fr', params: { slug: 'nope' } });
  assert.equal(result.notFound, true);
  assert.equal(result.revalidate, 10);
});

test('the page label may be derived from the context, for a dynamic route', async () => {
  const errors = [];
  const previous = console.error;
  console.error = (...args) => errors.push(args);

  const props = staticPageProps(
    async () => {
      throw new Error('down');
    },
    ctx => `/expertise/${ctx?.params?.slug}`
  );

  try {
    await assert.rejects(() => props({ locale: 'fr', params: { slug: 'cyber' } }));
  } finally {
    console.error = previous;
  }

  assert.equal(errors[0][1].page, '/expertise/cyber');
});
