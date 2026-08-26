import { useRouter } from 'next/router';

import JsonLd from './json-ld';
import { HOST } from './head-page';
import { CABINET_ID } from './site-schema';

import { expertiseSlug, plainText } from '../../libs/expertise';
import { isPress } from '../../libs/publications';
import { withLocale } from '../../libs/localePath';
import headerContent from '../../content/headerContent.json';

const ALICE_ID = `${HOST}/#alice`;

const localeUrl = (locale, path) => `${HOST}${withLocale(locale, path)}`;

// An article by a named lawyer, about a named practice area, published by the
// practice. All three already exist as nodes in the site graph, so this attaches
// to them by `@id` rather than restating them.
//
// A press cutting is someone else's work: it is marked up as the practice being
// mentioned, not as something the practice wrote.
function PublicationSchema({ post, title, series }) {
  const { locale } = useRouter();
  const nav = (headerContent[locale] ?? headerContent.fr).nav;
  const label = url => nav.find(link => link.url === url)?.label;

  const url = localeUrl(locale, `/publications/${post.slug}`);
  const press = isPress(post);

  const crumb = (name, path, position) => ({
    '@type': 'ListItem',
    position,
    name,
    item: localeUrl(locale, path),
  });

  const article = {
    '@type': press ? 'NewsArticle' : 'Article',
    '@id': `${url}#article`,
    headline: title,
    name: post.title,
    description: plainText(post.body, 300),
    url,
    inLanguage: locale,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    publisher: { '@id': CABINET_ID },
    isAccessibleForFree: true,
    ...(series ? { isPartOf: { '@type': 'CreativeWorkSeries', name: series } } : {}),
    ...(press
      ? { mentions: { '@id': CABINET_ID }, ...(post.source ? { sameAs: post.source } : {}) }
      : { author: { '@id': ALICE_ID } }),
    ...(post.field
      ? {
          about: {
            '@id': `${localeUrl(
              locale,
              `/expertise/${expertiseSlug(post.field)}`
            )}#service`,
          },
        }
      : {}),
  };

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          crumb(label('/') ?? 'Accueil', '/', 1),
          crumb(label('/publications') ?? 'Publications', '/publications', 2),
          crumb(title, `/publications/${post.slug}`, 3),
        ],
      },
      article,
    ],
  };

  return <JsonLd id='publication-schema' data={data} />;
}

export default PublicationSchema;
