import PublicationsIndex from '../../components/layout/publications-index';
import clientApi from '../../libs/clientApi';
import { fetchPublications } from '../../libs/publications';

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
        console.error('publications index copy', err);
        return null;
      }),
      fetchPublications(locale),
    ]);

    return {
      props: {
        data: content ?? {},
        posts,
        seo: {
          title: content?.titleseo ?? '',
          description: content?.descriptionseo ?? '',
        },
      },
      revalidate: 60,
    };
  } catch (err) {
    // Rethrown rather than turned into a not-found: this route is a nav item and
    // a sitemap entry, and a returned `notFound` would cache a 404 over the last
    // good render instead of leaving it up.
    console.error('publications index getStaticProps', err);
    throw err;
  }
}
