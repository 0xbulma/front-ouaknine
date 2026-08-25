import { useRouter } from 'next/router';

import JsonLd from './json-ld';
import { HOST } from './head-page';
import { CABINET_ID } from './site-schema';

import { expertiseSlug, plainText } from '../../libs/expertise';
import { withLocale } from '../../libs/localePath';
import headerContent from '../../content/headerContent.json';

const localeUrl = (locale, path) => `${HOST}${withLocale(locale, path)}`;

// A field of expertise is a Service the practice provides, not a loose page.
// `current` marks the one being read, so the field pages describe themselves
// and the hub describes the catalogue.
function ExpertiseSchema({ items, current }) {
  const { locale } = useRouter();
  const nav = (headerContent[locale] ?? headerContent.fr).nav;
  const sectionName = nav.find(link => link.url === '/expertise')?.label ?? 'Expertise';

  const field = current
    ? items.find(item => expertiseSlug(item.title) === current)
    : null;

  const service = item => ({
    '@type': 'Service',
    '@id': `${localeUrl(locale, `/expertise/${expertiseSlug(item.title)}`)}#service`,
    name: item.title?.trim(),
    description: plainText(item.description, 300),
    serviceType: item.title?.trim(),
    url: localeUrl(locale, `/expertise/${expertiseSlug(item.title)}`),
    provider: { '@id': CABINET_ID },
    areaServed: { '@type': 'City', name: 'Paris' },
    availableLanguage: ['fr', 'en'],
  });

  const crumb = (name, path, position) => ({
    '@type': 'ListItem',
    position,
    name,
    item: localeUrl(locale, path),
  });

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      crumb(nav[0]?.label ?? 'Accueil', '/', 1),
      crumb(sectionName, '/expertise', 2),
      ...(field
        ? [crumb(field.title?.trim(), `/expertise/${current}`, 3)]
        : []),
    ],
  };

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb,
      field
        ? service(field)
        : {
            '@type': 'ItemList',
            name: sectionName,
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: service(item),
            })),
          },
    ],
  };

  return <JsonLd id='expertise-schema' data={data} />;
}

export default ExpertiseSchema;
