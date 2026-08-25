import ExpertisePage from '../../components/layout/expertise-page';
import { expertiseSlug, fetchExpertise } from '../../libs/expertise';
import { fieldAlternates } from '../../libs/localePath';

export default ExpertisePage;

// The landing page shows the first field, so it points its canonical and its
// hreflang at that field's own URL rather than competing with it. It is left
// out of the sitemap for the same reason.
export async function getStaticProps({ locale }) {
  try {
    const content = await fetchExpertise(locale);
    const first = content?.expertiseList?.[0];

    if (!first) return { notFound: true };

    const slug = expertiseSlug(first.title);

    return {
      props: {
        data: content,
        slug,
        seo: {
          title: content?.titleseo ?? '',
          description: content?.descriptionseo ?? '',
          alternates: fieldAlternates(slug),
        },
      },
      revalidate: 10,
    };
  } catch (err) {
    return { notFound: true };
  }
}
