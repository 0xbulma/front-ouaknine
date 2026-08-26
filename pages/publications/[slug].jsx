import PublicationPage from '../../components/layout/publication-page';
import {
  fetchPublication,
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

    // Only this page renders prose, so only this page asks for it. The list and
    // the twin-locale check take the body-free projection: carrying bodies into
    // them put the whole guide's text into the page's __NEXT_DATA__.
    const [post, posts, translations] = await Promise.all([
      fetchPublication(locale, params.slug),
      fetchPublications(locale),
      fetchPublications(twin),
    ]);

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

    // The rail and the pager render a number, a title and a link. Handing them
    // whole documents would serialise every episode of the guide into the page.
    const episodes = series
      ? seriesOf(posts, series).map(entry => ({
          post: { _id: entry.post._id, slug: entry.post.slug },
          episode: entry.episode,
          title: entry.title,
        }))
      : null;

    return {
      props: {
        post,
        series: episodes,
        seo: {
          title: `${title} | ${org.name}`,
          description: plainText(post.body),
          alternates,
        },
      },
      revalidate: 60,
    };
  } catch (err) {
    // A transient CMS failure must not cache a 404 for a live publication until
    // the next deploy; the deliberate not-found above already carries a window.
    console.error('publication getStaticProps', params.slug, err);
    return { notFound: true, revalidate: 60 };
  }
}
