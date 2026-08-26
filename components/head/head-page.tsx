import Head from 'next/head';
import { useRouter } from 'next/router';

import useLocale from '../../hooks/useLocale';
import { localeHref } from '../../libs/localePath';
import { HOST, LOCALES, markdownSibling } from '../../libs/site-url';
import type { Locale } from '../../libs/types';

// Re-exported for the schema components that already reach for it here. The
// origin itself is parsed once in libs/site.ts.
export { HOST };

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

const SHARE_IMAGE = `${HOST}/images/banner-meta.png`;

export type HeadPageProps = {
  title: string;
  description: string;
  alternatePaths?: Partial<Record<Locale, string>> | null;
  noindex?: boolean;
};

function HeadPage({ title, description, alternatePaths, noindex }: HeadPageProps) {
  const router = useRouter();
  const locale = useLocale();

  // One entry per language that actually has this page. A field of expertise
  // whose counterpart has been renamed in the studio has none, and is left out
  // rather than annotated with a URL that does not exist.
  //
  // `alternatePaths` is for a page that stands in for another one: the
  // expertise landing page renders the first field, so it publishes that
  // field's URLs rather than its own.
  const pathFor = (target: Locale): string | null | undefined =>
    alternatePaths ? alternatePaths[target] : localeHref(router, target);

  const alternates = LOCALES.map(target => [target, pathFor(target)] as const).filter(
    ([, path]) => path
  );

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
      {noindex && <meta name='robots' content='noindex, follow' />}

      {/* A noindex page publishes a title, a description and the robots meta
          and nothing else: an hreflang pointing at a URL that itself answers
          404 is reported as an error, and a self-canonical beside noindex is a
          contradictory pair of signals. */}
      {!noindex &&
        alternates.map(([target, path]) => (
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
      {!noindex && french && (
        <link rel='alternate' hrefLang='x-default' href={`${HOST}${french}`} />
      )}

      {/* The markdown representation of this page, for agent clients.
          https://acceptmarkdown.com

          Built from the path actually requested, not from `pathFor`: the
          expertise hub canonicalises onto its first field, and pointing the
          markdown link there too would name a different document from the one
          the middleware advertises and serves for this URL. Omitted under
          `noindex`, where the requested path is the 404 route itself. */}
      {!noindex && (
        <link
          rel='alternate'
          type='text/markdown'
          href={`${HOST}${markdownSibling(localeHref(router, locale))}`}
        />
      )}

      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Cabinet Ouaknine' />
      {!noindex && <meta property='og:url' content={canonical} />}
      <meta property='og:locale' content={OG_LOCALE[locale]} />
      {LOCALES.filter(target => target !== locale).map(target => (
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

      {!noindex && <link rel='canonical' href={canonical} />}
      <link rel='icon' href='/favicon.ico' />

      <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='manifest' href='/site.webmanifest' />
    </Head>
  );
}

export default HeadPage;
