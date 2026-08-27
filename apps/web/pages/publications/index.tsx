import type { GetStaticProps } from "next";
import type { PublicationsIndexProps } from "../../components/layout/publications-index";
import PublicationsIndex from "../../components/layout/publications-index";
import publicationsContent from "../../content/publicationsContent.json";
import { getClient } from "../../libs/clientApi";
import { fetchPublications } from "../../libs/publications";
import { resolveLocale } from "../../libs/site-url";
import type { PublicationsDocument } from "../../libs/types";

export default PublicationsIndex;

const PAGE_QUERY = `*[_type == "articles" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title
}`;

// `draftMode` is what puts this route in Presentation: it swaps in the client
// that sees unpublished posts and stega-encodes an edit link into every string,
// the same swap libs/static-page-props.ts makes for the pages that use it. This
// route builds its own props, so it has to make the swap itself.
export const getStaticProps: GetStaticProps<PublicationsIndexProps> = async ({
	locale,
	draftMode,
}) => {
	try {
		const [content, posts] = await Promise.all([
			// The page renders without its CMS copy (the fallback below); only a
			// failure to fetch the posts genuinely leaves it with nothing.
			getClient(draftMode)
				.fetch<PublicationsDocument | null>(PAGE_QUERY, { locale: locale ?? "fr" })
				.catch((err) => {
					console.error("publications index copy", locale, err);
					return null;
				}),
			fetchPublications(locale, draftMode),
		]);

		// The copy query is allowed to fail, so it must have somewhere to fall back
		// to: `{}` rendered an empty h1 and an empty title tag on a route that is
		// both a nav item and a sitemap entry.
		const copy = publicationsContent[resolveLocale(locale)];

		return {
			props: {
				data: { ...content, title: content?.title || copy.title },
				posts,
				seo: {
					title: content?.titleseo || copy.title,
					description: content?.descriptionseo ?? "",
				},
			},
			revalidate: 60,
		};
	} catch (err) {
		// Rethrown rather than turned into a not-found: this route is a nav item and
		// a sitemap entry, and a returned `notFound` would cache a 404 over the last
		// good render instead of leaving it up.
		console.error("publications index getStaticProps", locale, err);
		throw err;
	}
};
