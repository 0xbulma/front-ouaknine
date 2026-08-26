// The ISR policy every page route shares.
//
// `revalidate` on the miss too: without it Next caches the not-found entry with
// no expiry, so one unreachable-CMS regeneration pins the page to a 404 until
// the next deploy. A thrown fetch is rethrown rather than turned into a 404 —
// on a background revalidation Next keeps serving the last good page and
// retries, and at build time it fails the deploy, which is what should happen.
//
// `build` shapes the props for routes that need more than the document (the two
// expertise routes derive a slug and their own SEO); returning null from it
// means the document exists but this page does not. Omitted, the props are just
// the document, which is what the four simple pages want.
//
// Pure: the fetcher is injected, so this is testable without the Sanity client.
export const staticPageProps = (fetcher, page, build) => async ctx => {
  try {
    const data = await fetcher(ctx?.locale);
    if (!data) return { notFound: true, revalidate: 10 };

    const props = build ? build(data, ctx) : { data };
    if (!props) return { notFound: true, revalidate: 10 };

    return { props, revalidate: 10 };
  } catch (err) {
    console.error('getStaticProps failed', { page: pageName(page, ctx), locale: ctx?.locale }, err);
    throw err;
  }
};

const pageName = (page, ctx) => (typeof page === 'function' ? page(ctx) : page);
