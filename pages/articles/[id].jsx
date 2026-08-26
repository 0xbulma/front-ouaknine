import { fetchPublicationById } from '../../libs/publications';
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
  let post = null;

  try {
    post = await fetchPublicationById(params.id);
  } catch (err) {
    // Fall through to the index; the redirect below stays temporary so the real
    // destination is still reachable once the CMS answers again.
  }

  // Next does not prefix a getServerSideProps redirect with the active locale,
  // so an unprefixed path sends every /en/articles/<id> to the French page. The
  // English half of the guide is the most-seen URL the site has, and permanent
  // is the one kind of mistake a browser and a search engine both keep.
  const destination = withLocale(
    locale,
    post ? `/publications/${post.slug}` : '/publications'
  );

  // Only a resolved post earns a permanent redirect. A CMS failure or an id that
  // is not published yet gets a temporary one, so the URL can still find its own
  // page later rather than being pinned to the index for good.
  const permanent = Boolean(post);

  if (permanent) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  }

  return { redirect: { destination, permanent } };
}
