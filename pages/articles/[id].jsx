import { fetchPublicationById, otherLocale } from '../../libs/publications';
import { withLocale } from '../../libs/localePath';

// The articles section used to address a post by its Sanity id. Sixteen of those
// URLs were still earning search traffic when the section was removed, and PR
// #16 sent them to the home page for want of anywhere better. Now that the posts
// render again, the id is resolved to the publication it belongs to rather than
// mapped in a table that would go stale the first time a title changes.
export default function LegacyArticle() {
  return null;
}

// A Sanity document id. Anything else is not a legacy URL, and this route is the
// site's only SSR path over an unbounded, attacker-chosen path space: without a
// shape test every request is request-time CMS I/O.
const DOCUMENT_ID = /^[A-Za-z0-9._-]{1,64}$/;

export async function getServerSideProps({ params, locale, res }) {
  const twin = otherLocale(locale);
  let resolved = null;

  if (!DOCUMENT_ID.test(params.id ?? '')) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
    return {
      redirect: {
        destination: withLocale(locale, '/publications'),
        permanent: false,
      },
    };
  }

  try {
    // In the language being read when it exists there. The press cuttings are
    // French only, so an English legacy URL for one has to cross over rather
    // than land permanently on an English page that does not exist.
    const here = await fetchPublicationById(locale, params.id);

    if (here) {
      resolved = { locale, slug: here.slug };
    } else {
      const there = await fetchPublicationById(twin, params.id);
      if (there) resolved = { locale: twin, slug: there.slug };
    }
  } catch (err) {
    console.error('legacy article getServerSideProps', locale, params.id, err);
  }

  // Next does not prefix a getServerSideProps redirect with the active locale,
  // so an unprefixed path sends every /en/articles/<id> to the French page.
  const destination = resolved
    ? withLocale(resolved.locale, `/publications/${resolved.slug}`)
    : withLocale(locale, '/publications');

  // Only a hit in the language being read is permanent. The cross-locale
  // fallback is best-effort: /en/articles/<id> for a piece that is French-only
  // today should serve /en/publications/<slug> once its English body is written,
  // and a 308 would have consolidated it onto the French page for good.
  const permanent = Boolean(resolved) && resolved.locale === locale;

  // Both branches get an edge cache. Without one on the miss, an unbounded
  // attacker-chosen path space reaches the origin on every request, and each
  // miss now costs two CMS round trips.
  res.setHeader(
    'Cache-Control',
    permanent
      ? 'public, max-age=0, s-maxage=3600'
      : 'public, max-age=0, s-maxage=60'
  );

  return { redirect: { destination, permanent } };
}
