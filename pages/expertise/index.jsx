import ExpertisePage from '../../components/layout/expertise-page';
import { expertiseSlug, fetchExpertise } from '../../libs/expertise';

export default ExpertisePage;

// The landing page shows the first field, so it points its canonical at that
// field's own URL rather than competing with it.
export async function getStaticProps({ locale }) {
  try {
    const content = await fetchExpertise(locale);
    const first = content?.expertiseList?.[0];

    if (!first) return { notFound: true };

    return {
      props: {
        data: content,
        slug: expertiseSlug(first.title),
        seo: {
          title: content?.titleseo ? content.titleseo : '',
          description: content?.descriptionseo ? content.descriptionseo : '',
        },
      },
      revalidate: 10,
    };
  } catch (err) {
    return { notFound: true };
  }
}
