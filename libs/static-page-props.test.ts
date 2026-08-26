import { staticPageProps, type PageResult } from './static-page-props';

const silence = <T>(fn: () => Promise<T>): Promise<T> => {
  const previous = console.error;
  console.error = () => {};
  return fn().finally(() => {
    console.error = previous;
  });
};

// `notFound` only exists on the miss branch of the union, which is exactly what
// these assertions are checking for.
const miss = (result: PageResult<unknown>) =>
  'notFound' in result ? result : null;

test('a fetched document becomes props, revalidating', async () => {
  const props = staticPageProps(async () => ({ title: 'T' }), '/');

  expect(await props({ locale: 'fr' })).toStrictEqual({
    props: { data: { title: 'T' } },
    revalidate: 10,
  });
});

test('the fetcher receives the locale, defaulting to undefined off a bare call', async () => {
  const seen: (string | undefined)[] = [];
  const props = staticPageProps(async locale => {
    seen.push(locale);
    return { title: 'T' };
  }, '/');

  await props({ locale: 'en' });
  await props();

  expect(seen).toStrictEqual(['en', undefined]);
});

test('a missing document is a 404 that expires', async () => {
  // Without `revalidate` Next caches the not-found entry with no expiry, so the
  // page stays a 404 until the next deploy. The key must be present.
  const props = staticPageProps(async () => null, '/contact');
  const result = miss(await props({ locale: 'fr' }));

  expect(result?.notFound).toBe(true);
  expect(result?.revalidate).toBe(10);
});

test('an unreachable CMS rejects rather than publishing a 404', async () => {
  // A rejection is not "this page does not exist": rethrowing keeps the last
  // good page on a background revalidation and fails the build on a cold one.
  const boom = new Error('sanity is down');
  const props = staticPageProps(async () => {
    throw boom;
  }, '/legal');

  await silence(() => expect(props({ locale: 'fr' })).rejects.toBe(boom));
});

test('a props builder shapes the props and can reject the page', async () => {
  // The two expertise routes derive a slug and their own SEO, and a slug that
  // matches no field is a 404 even though the document loaded.
  const doc = { expertiseList: [{ title: 'Droit pénal général' }] };

  const found = staticPageProps(
    async () => doc,
    '/expertise',
    (data, ctx) => ({ data, slug: String(ctx.params?.slug ?? '') })
  );
  expect(await found({ locale: 'fr', params: { slug: 'a' } })).toStrictEqual({
    props: { data: doc, slug: 'a' },
    revalidate: 10,
  });

  const missing = staticPageProps(async () => doc, '/expertise', () => null);
  const result = miss(await missing({ locale: 'fr', params: { slug: 'nope' } }));

  expect(result?.notFound).toBe(true);
  expect(result?.revalidate).toBe(10);
});

test('the page label may be derived from the context, for a dynamic route', async () => {
  const errors: unknown[][] = [];
  const previous = console.error;
  console.error = (...args: unknown[]) => errors.push(args);

  const props = staticPageProps(
    async () => {
      throw new Error('down');
    },
    ctx => `/expertise/${ctx?.params?.slug}`
  );

  try {
    await expect(props({ locale: 'fr', params: { slug: 'cyber' } })).rejects.toThrow('down');
  } finally {
    console.error = previous;
  }

  expect(errors[0]?.[1]).toMatchObject({ page: '/expertise/cyber' });
});
