import type { GetStaticPaths, GetStaticProps } from "next";
import type { PublicationPageProps } from "../../components/layout/publication-page";
import PublicationPage from "../../components/layout/publication-page";
import organizationContent from "../../content/organizationContent.json";
import { plainText } from "../../libs/expertise";
import { withLocale } from "../../libs/localePath";
import {
	fetchPublicationBody,
	fetchPublications,
	otherLocale,
	seriesOf,
	splitTitle,
} from "../../libs/publications";
import { LOCALES, resolveLocale } from "../../libs/site-url";
import type { Locale, PageSeo } from "../../libs/types";

export default PublicationPage;

export const getStaticPaths: GetStaticPaths = async ({ locales = LOCALES }) => {
	try {
		const lists = await Promise.all(
			locales.map(async (locale) => ({
				locale,
				posts: await fetchPublications(locale),
			})),
		);

		const paths = lists.flatMap(({ locale, posts }) =>
			posts.map((post) => ({ params: { slug: post.slug }, locale })),
		);

		return { paths, fallback: "blocking" };
	} catch (err) {
		// A publication added in the studio still resolves on its first request, but
		// prebuilding none of them is a degradation worth recording.
		console.error("publication getStaticPaths", err);
		return { paths: [], fallback: "blocking" };
	}
};

export const getStaticProps: GetStaticProps<PublicationPageProps> = async ({
	params,
	locale: requested,
}) => {
	const slug = String(params?.slug ?? "");
	const locale = resolveLocale(requested);

	try {
		const twin = otherLocale(locale);

		// The list decides whether the page exists, so nothing heavier runs until it
		// says yes. The twin-locale list only chooses whether an hreflang alternate
		// is emitted, and a missing alternate is recoverable; a cached 404 is not,
		// so it must not be able to take the page down with it.
		const [posts, translations] = await Promise.all([
			fetchPublications(locale),
			fetchPublications(twin).catch((err) => {
				console.error("publication twin locale", twin, slug, err);
				return [];
			}),
		]);

		const meta = posts.find((entry) => entry.slug === slug);

		if (!meta) return { notFound: true, revalidate: 60 };

		// Only now, and only this one document's prose.
		const body = await fetchPublicationBody(locale, meta._id);

		if (!body) return { notFound: true, revalidate: 60 };

		const post = { ...meta, body };
		const { series, title } = splitTitle(post);
		const org = organizationContent[locale];

		// A press cutting exists only in French. Annotating it as available in
		// English would publish an hreflang to a page that is not there.
		const path = `/publications/${post.slug}`;
		const alternates: Partial<Record<Locale, string>> = {
			[locale]: withLocale(locale, path),
		};

		if (translations.some((entry) => entry.slug === post.slug)) {
			alternates[twin] = withLocale(twin, path);
		}

		// The rail and the pager render a number, a title and a link. Handing them
		// whole documents would serialise every episode of the guide into the page.
		const episodes = series
			? seriesOf(posts, series).map((entry) => ({
					post: { _id: entry.post._id, slug: entry.post.slug },
					episode: entry.episode,
					title: entry.title,
				}))
			: null;

		const seo: PageSeo = {
			title: `${title} | ${org.name}`,
			description: plainText(post.body),
			alternates,
		};

		return {
			props: { post, series: episodes, seo },
			revalidate: 60,
		};
	} catch (err) {
		// Rethrown, not turned into a not-found. `notFound` is a successful result,
		// so Next caches it over the last good render; a thrown getStaticProps makes
		// it re-set the existing page instead (response-cache/index.js). The two
		// guards above are the only definitive absences.
		console.error("publication getStaticProps", locale, slug, err);
		throw err;
	}
};
