import ExpertisePage from '../../components/layout/expertise-page';
import { expertiseSlug, fetchExpertise, plainText } from '../../libs/expertise';

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
        params: { slug: expertiseSlug(item.title) },
        locale,
      }))
    );

    return { paths, fallback: 'blocking' };
  } catch (err) {
    // A field added in the studio still resolves on its first request.
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const content = await fetchExpertise(locale);
    const field = (content?.expertiseList ?? []).find(
      item => expertiseSlug(item.title) === params.slug
    );

    if (!field) return { notFound: true, revalidate: 10 };

    return {
      props: {
        data: content,
        slug: params.slug,
        seo: {
          title: `${field.title.trim()} — ${content?.title?.trim() ?? ''}`,
          description: plainText(field.description),
        },
      },
      revalidate: 10,
    };
  } catch (err) {
    return { notFound: true };
  }
}
