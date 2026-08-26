import type { ExpertisePageProps } from "../../components/layout/expertise-page";
import ExpertisePage from "../../components/layout/expertise-page";
import { fetchExpertise } from "../../libs/expertise";
import { fieldAlternates } from "../../libs/localePath";
import { staticPageProps } from "../../libs/static-page-props";

export default ExpertisePage;

// The landing page shows the first field, so it points its canonical and its
// hreflang at that field's own URL rather than competing with it. It is left
// out of the sitemap for the same reason.
export const getStaticProps = staticPageProps<ExpertisePageProps["data"], ExpertisePageProps>(
	fetchExpertise,
	"/expertise",
	(content) => {
		const first = content.expertiseList[0];
		if (!first) return null;

		const slug = first.slug;

		return {
			data: content,
			slug,
			seo: {
				title: content.titleseo ?? "",
				description: content.descriptionseo ?? "",
				alternates: fieldAlternates(slug),
			},
		};
	},
);
