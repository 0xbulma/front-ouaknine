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
      clientApi.fetch(PAGE_QUERY, { locale: locale ?? 'fr' }),
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
    // Without a revalidate window Next caches the 404 until the next deploy, and
    // this route is both a nav item and a sitemap entry.
    console.error('publications index getStaticProps', err);
    return { notFound: true, revalidate: 60 };
  }
}
