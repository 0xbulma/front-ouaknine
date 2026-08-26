import PublicationsIndex from '../../components/layout/publications-index';
import clientApi from '../../libs/clientApi';
import { fetchPublications } from '../../libs/publications';
import publicationsContent from '../../content/publicationsContent.json';

export default PublicationsIndex;

const PAGE_QUERY = `*[_type == "articles" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title
}`;

export async function getStaticProps({ locale }) {
  try {
    const [content, posts] = await Promise.all([
      // The page renders without its CMS copy (`content ?? {}` below); only a
      // failure to fetch the posts genuinely leaves it with nothing.
      clientApi.fetch(PAGE_QUERY, { locale: locale ?? 'fr' }).catch(err => {
        console.error('publications index copy', locale, err);
        return null;
      }),
      fetchPublications(locale),
    ]);

    // The copy query is allowed to fail, so it must have somewhere to fall back
    // to: `{}` rendered an empty h1 and an empty title tag on a route that is
    // both a nav item and a sitemap entry.
    const copy = publicationsContent[locale] ?? publicationsContent.fr;

    return {
      props: {
        data: { ...content, title: content?.title || copy.title },
        posts,
        seo: {
          title: content?.titleseo || copy.title,
          description: content?.descriptionseo ?? '',
        },
      },
      revalidate: 60,
    };
  } catch (err) {
    // Rethrown rather than turned into a not-found: this route is a nav item and
    // a sitemap entry, and a returned `notFound` would cache a 404 over the last
    // good render instead of leaving it up.
    console.error('publications index getStaticProps', locale, err);
    throw err;
  }
}
