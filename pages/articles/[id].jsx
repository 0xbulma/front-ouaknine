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

export async function getServerSideProps({ params, locale, res }) {
  const twin = otherLocale(locale);
  let resolved = null;

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
    console.error('legacy article getServerSideProps', params.id, err);
  }

  // Next does not prefix a getServerSideProps redirect with the active locale,
  // so an unprefixed path sends every /en/articles/<id> to the French page.
  const destination = resolved
    ? withLocale(resolved.locale, `/publications/${resolved.slug}`)
    : withLocale(locale, '/publications');

  // Only a resolved post earns a permanent redirect. A CMS failure or an id with
  // no readable publication behind it gets a temporary one, so the URL can still
  // find its own page later rather than being pinned to the index for good.
  const permanent = Boolean(resolved);

  if (permanent) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  }

  return { redirect: { destination, permanent } };
}
