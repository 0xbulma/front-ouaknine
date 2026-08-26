import PublicationPage from '../../components/layout/publication-page';
import {
  fetchPublications,
  otherLocale,
  seriesOf,
  splitTitle,
} from '../../libs/publications';
import { plainText } from '../../libs/expertise';
import { withLocale } from '../../libs/localePath';
import organizationContent from '../../content/organizationContent.json';

export default PublicationPage;

export async function getStaticPaths({ locales }) {
  try {
    const lists = await Promise.all(
      locales.map(async locale => ({
        locale,
        posts: await fetchPublications(locale),
      }))
    );

    const paths = lists.flatMap(({ locale, posts }) =>
      posts.map(post => ({ params: { slug: post.slug }, locale }))
    );

    return { paths, fallback: 'blocking' };
  } catch (err) {
    // A publication added in the studio still resolves on its first request.
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const twin = otherLocale(locale);

    const [posts, translations] = await Promise.all([
      fetchPublications(locale),
      fetchPublications(twin),
    ]);

    const post = posts.find(entry => entry.slug === params.slug);

    if (!post) return { notFound: true, revalidate: 60 };

    const { series, title } = splitTitle(post);
    const org = organizationContent[locale] ?? organizationContent.fr;

    // A press cutting exists only in French. Annotating it as available in
    // English would publish an hreflang to a page that is not there.
    const path = `/publications/${post.slug}`;
    const alternates = { [locale]: withLocale(locale, path) };

    if (translations.some(entry => entry.slug === post.slug)) {
      alternates[twin] = withLocale(twin, path);
    }

    return {
      props: {
        post,
        series: series ? seriesOf(posts, series) : null,
        seo: {
          title: `${title} | ${org.name}`,
          description: plainText(post.body),
          alternates,
        },
      },
      revalidate: 60,
    };
  } catch (err) {
    return { notFound: true };
  }
}
