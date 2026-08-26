import { useRouter } from 'next/router';

import JsonLd from './json-ld';
import { HOST } from '../../libs/site-url.mjs';

import footerContent from '../../content/footerContent.json';
import organizationContent from '../../content/organizationContent.json';

const ISKA_URL = 'https://www.iska-avocats.fr';
const LINKEDIN_URL = 'https://fr.linkedin.com/in/alice-ouaknine-23a4186b';

export const CABINET_ID = `${HOST}/#cabinet`;
export const ALICE_ID = `${HOST}/#alice`;

// The practice's identity, published once per page from the layout. A single
// `@graph` rather than three scripts, so the nodes can reference each other by
// `@id` and Google resolves one entity instead of three loose ones.
//
// The coordinates and the map link come from the live Google listing for the
// business, not from the stale ones the site used to carry, so `geo` states the
// same point Google already holds.
function SiteSchema() {
  const { locale } = useRouter();
  const org = organizationContent[locale] ?? organizationContent.fr;
  const { email } = footerContent[locale] ?? footerContent.fr;

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // Attorney is a LocalBusiness and so an Organization already; the
        // third member says so outright, for the readers that match on the
        // literal type rather than resolving the hierarchy.
        '@type': ['LegalService', 'Attorney', 'Organization'],
        '@id': CABINET_ID,
        name: org.name,
        description: org.description,
        url: HOST,
        telephone: footerContent.phone,
        email,
        address: { '@type': 'PostalAddress', ...footerContent.postalAddress },
        geo: { '@type': 'GeoCoordinates', ...footerContent.geo },
        hasMap: footerContent.mapsUrl,
        areaServed: { '@type': 'City', name: org.areaServed },
        // The same two facts as above, in the shape an assistant asked "how do
        // I reach this firm" looks for.
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: footerContent.phone,
          email,
          areaServed: footerContent.postalAddress.addressCountry,
          availableLanguage: ['French', 'English'],
        },
        availableLanguage: ['fr', 'en'],
        founder: { '@id': ALICE_ID },
        employee: { '@id': ALICE_ID },
        memberOf: {
          '@type': 'Organization',
          name: 'ISKA Avocats',
          url: ISKA_URL,
        },
        sameAs: [footerContent.mapsUrl],
      },
      {
        '@type': 'Person',
        '@id': ALICE_ID,
        name: 'Alice Ouaknine',
        jobTitle: org.jobTitle,
        worksFor: { '@id': CABINET_ID },
        memberOf: org.bars.map(name => ({ '@type': 'Organization', name })),
        knowsLanguage: ['fr', 'en'],
        sameAs: [LINKEDIN_URL],
      },
      {
        '@type': 'WebSite',
        '@id': `${HOST}/#website`,
        url: HOST,
        name: org.name,
        inLanguage: locale,
        publisher: { '@id': CABINET_ID },
      },
    ],
  };

  return <JsonLd id='site-schema' data={data} />;
}

export default SiteSchema;
