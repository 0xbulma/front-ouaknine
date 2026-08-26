import ExpertisePage from '../../components/layout/expertise-page';
import { fetchExpertise, plainText } from '../../libs/expertise';
import { staticPageProps } from '../../libs/static-page-props.mjs';
import organizationContent from '../../content/organizationContent.json';

export default ExpertisePage;

export async function getStaticPaths({ locales }) {
  try {
    const docs = await Promise.all(
      locales.map(async locale => ({
        locale,
        content: await fetchExpertise(locale),
      }))
    );

    const paths = docs.flatMap(({ locale, content }) =>
      (content?.expertiseList ?? []).map(item => ({
        params: { slug: item.slug },
        locale,
      }))
    );

    return { paths, fallback: 'blocking' };
  } catch (err) {
    // A field added in the studio still resolves on its first request.
    return { paths: [], fallback: 'blocking' };
  }
}

export const getStaticProps = staticPageProps(
  fetchExpertise,
  ctx => `/expertise/${ctx?.params?.slug}`,
  (content, ctx) => {
    const { slug } = ctx.params;
    const field = (content.expertiseList ?? []).find(
      item => item.slug === slug
    );
    if (!field) return null;

    // The field leads, then the practice and the city. Every commercial query
    // in Search Console pairs a field with "paris"; the section label the title
    // used to carry ("Practice Areas") matched none of them.
    const org = organizationContent[ctx.locale] ?? organizationContent.fr;

    return {
      data: content,
      slug,
      seo: {
        title: `${field.title.trim()} | ${org.name}, ${org.areaServed}`,
        description: plainText(field.description),
      },
    };
  }
);
