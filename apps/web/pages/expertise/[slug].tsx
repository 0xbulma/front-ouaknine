import type { GetStaticPaths } from "next";
import type { ExpertisePageProps } from "../../components/layout/expertise-page";
import ExpertisePage from "../../components/layout/expertise-page";
import organizationContent from "../../content/organizationContent.json";
import { fetchExpertise } from "../../libs/expertise";
import { plainText } from "../../libs/plain-text";
import { LOCALES, resolveLocale } from "../../libs/site-url";
import { staticPageProps } from "../../libs/static-page-props";

export default ExpertisePage;

export const getStaticPaths: GetStaticPaths = async ({ locales = LOCALES }) => {
	try {
		const docs = await Promise.all(
			locales.map(async (locale) => ({
				locale,
				content: await fetchExpertise(locale),
			})),
		);

		const paths = docs.flatMap(({ locale, content }) =>
			(content?.expertiseList ?? []).map((item) => ({
				params: { slug: item.slug },
				locale,
			})),
		);

		return { paths, fallback: "blocking" };
	} catch {
		// A field added in the studio still resolves on its first request.
		return { paths: [], fallback: "blocking" };
	}
};

export const getStaticProps = staticPageProps<ExpertisePageProps["data"], ExpertisePageProps>(
	fetchExpertise,
	(ctx) => `/expertise/${ctx?.params?.slug}`,
	(content, ctx) => {
		const slug = String(ctx.params?.slug ?? "");
		const field = content.expertiseList.find((item) => item.slug === slug);
		if (!field) return null;

		// The field leads, then the practice and the city. Every commercial query
		// in Search Console pairs a field with "paris"; the section label the title
		// used to carry ("Practice Areas") matched none of them.
		const org = organizationContent[resolveLocale(ctx.locale)];

		return {
			data: content,
			slug,
			seo: {
				title: `${field.title?.trim()} | ${org.name}, ${org.areaServed}`,
				description: plainText(field.description),
			},
		};
	},
);
