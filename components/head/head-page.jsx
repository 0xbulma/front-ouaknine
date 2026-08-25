import Head from 'next/head';
import { useRouter } from 'next/router';
import useLocale from '../../hooks/useLocale';

function HeadPage(props) {
  const locale = useLocale();

  const { title, description, canonicalPath } = props;
  const { asPath, locales, query } = useRouter();

  const pathLocale = locale === 'en' ? '/en': '';

  const path = `${process.env.NEXT_PUBLIC_HOST}${pathLocale}${canonicalPath ?? asPath}`


  return (
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='author' content='Alice Ouaknine'></meta>

      {locales.map((locale, index) => (
        <link
          key={index}
          rel='alternate'
          hrefLang={locale.toLowerCase()}
          href={`${
            process.env.NEXT_PUBLIC_HOST
          }/${locale.toLowerCase()}${asPath}`}
        />
      ))}
      <link
        rel='alternate'
        hrefLang='x-default'
        href={`${process.env.NEXT_PUBLIC_HOST}${asPath}`}
      />

      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content='website' />
      <meta
        property='og:url'
        content={path}
      />
      <meta
        property='og:image'
        content={'https://www.ouaknine-avocats.com/images/banner-meta.png'}
      />
      <meta property='og:image:alt' content={title} />

      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta
        name='twitter:image'
        content={'https://www.ouaknine-avocats.com/images/banner-meta.png'}
      />
      <meta name='twitter:site' content='@USERNAME' />
      <meta name='twitter:creator' content='@USERNAME' />

      <link
        rel='canonical'
        href={path}
      />
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
