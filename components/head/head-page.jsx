import Head from 'next/head';
import { useRouter } from 'next/router';

import { localeHref } from '../../libs/localePath';

// A missing env var would otherwise publish `undefined/expertise/...` as a
// canonical, which is invisible in review and expensive in the index.
export const HOST =
  process.env.NEXT_PUBLIC_HOST ?? 'https://www.ouaknine-avocats.com';

const OG_LOCALE = { fr: 'fr_FR', en: 'en_US' };

const SHARE_IMAGE = `${HOST}/images/banner-meta.png`;

function HeadPage({ title, description, alternatePaths }) {
  const router = useRouter();
  const { locale, locales } = router;

  // One entry per language that actually has this page. A field of expertise
  // whose counterpart has been renamed in the studio has none, and is left out
  // rather than annotated with a URL that does not exist.
  //
  // `alternatePaths` is for a page that stands in for another one: the
  // expertise landing page renders the first field, so it publishes that
  // field's URLs rather than its own.
  const pathFor = target =>
    alternatePaths ? alternatePaths[target] : localeHref(router, target);

  const alternates = locales
    .map(target => [target, pathFor(target)])
    .filter(([, path]) => path);

  const canonical = `${HOST}${pathFor(locale)}`;

  // France is 88% of the traffic, so an unmatched language gets the French page.
  const french = alternates.find(([target]) => target === 'fr')?.[1];

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='author' content='Alice Ouaknine' />

      {alternates.map(([target, path]) => (
        <link
          // `next/head` de-dupes every child against one shared key namespace,
          // so a bare locale here would collide with og:locale:alternate below
          // and silently drop one of the two annotations.
          key={`hreflang-${target}`}
          rel='alternate'
          hrefLang={target}
          href={`${HOST}${path}`}
        />
      ))}
      {french && (
        <link rel='alternate' hrefLang='x-default' href={`${HOST}${french}`} />
      )}

      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Cabinet Ouaknine' />
      <meta property='og:url' content={canonical} />
      <meta property='og:locale' content={OG_LOCALE[locale]} />
      {locales
        .filter(target => target !== locale)
        .map(target => (
          <meta
            key={`og-locale-${target}`}
            property='og:locale:alternate'
            content={OG_LOCALE[target]}
          />
        ))}
      <meta property='og:image' content={SHARE_IMAGE} />
      <meta property='og:image:alt' content={title} />

      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={SHARE_IMAGE} />

      <link rel='canonical' href={canonical} />
      <link rel='icon' href='/favicon.ico' />

      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon-16x16.png'
      />
      <link rel='manifest' href='/site.webmanifest' />
    </Head>
  );
}

export default HeadPage;
