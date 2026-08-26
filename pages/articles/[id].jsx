import { fetchPublications } from '../../libs/publications';

// The articles section used to address a post by its Sanity id. Sixteen of those
// URLs were still earning search traffic when the section was removed, and PR
// #16 sent them to the home page for want of anywhere better. Now that the posts
// render again, the id is resolved to the publication it belongs to rather than
// mapped in a table that would go stale the first time a title changes.
export default function LegacyArticle() {
  return null;
}

export async function getServerSideProps({ params, locale, res }) {
  let destination = '/publications';

  try {
    const posts = await fetchPublications(locale);
    const post = posts.find(entry => entry._id === params.id);
    if (post) destination = `/publications/${post.slug}`;
  } catch (err) {
    // The index is a good enough landing when the CMS is unreachable.
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');

  return { redirect: { destination, permanent: true } };
}
