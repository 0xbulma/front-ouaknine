import type { GetStaticProps } from 'next';

import PublicationsIndex from '../../components/layout/publications-index';
import type { PublicationsIndexProps } from '../../components/layout/publications-index';
import clientApi from '../../libs/clientApi';
import { fetchPublications } from '../../libs/publications';
import { resolveLocale } from '../../libs/site-url';
import type { PublicationsDocument } from '../../libs/types';
import publicationsContent from '../../content/publicationsContent.json';

export default PublicationsIndex;

const PAGE_QUERY = `*[_type == "articles" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title
}`;

export const getStaticProps: GetStaticProps<PublicationsIndexProps> = async ({ locale }) => {
  try {
    const [content, posts] = await Promise.all([
      // The page renders without its CMS copy (the fallback below); only a
      // failure to fetch the posts genuinely leaves it with nothing.
      clientApi
        .fetch<PublicationsDocument | null>(PAGE_QUERY, { locale: locale ?? 'fr' })
        .catch(err => {
          console.error('publications index copy', locale, err);
          return null;
        }),
      fetchPublications(locale),
    ]);

    // The copy query is allowed to fail, so it must have somewhere to fall back
    // to: `{}` rendered an empty h1 and an empty title tag on a route that is
    // both a nav item and a sitemap entry.
    const copy = publicationsContent[resolveLocale(locale)];

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
};
