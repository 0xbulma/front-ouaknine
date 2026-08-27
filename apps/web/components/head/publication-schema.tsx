import headerContent from "../../content/headerContent.json";
import useLocale from "../../hooks/useLocale";
import { isSafeExternal } from "../../libs/href";
import { expertiseSlugIn, withLocale } from "../../libs/localePath";
import { plainText } from "../../libs/plain-text";
import { isPress } from "../../libs/publication-fields";
import type { Locale, Publication } from "../../libs/types";
import { HOST } from "./head-page";
import JsonLd from "./json-ld";
import { ALICE_ID, CABINET_ID } from "./site-schema";

const localeUrl = (locale: Locale, path: string) => `${HOST}${withLocale(locale, path)}`;

// An article by a named lawyer, about a named practice area, published by the
// practice. All three already exist as nodes in the site graph, so this attaches
// to them by `@id` rather than restating them.
//
// A press cutting is someone else's work: it is marked up as the practice being
// mentioned, not as something the practice wrote.
function PublicationSchema({
	post,
	title,
	series,
}: {
	post: Publication;
	title: string;
	series: string | null;
}) {
	const locale = useLocale();
	const nav = headerContent[locale].nav;
	const label = (path: string) => nav.find((link) => link.url === path)?.label;

	const url = localeUrl(locale, `/publications/${post.slug}`);
	const press = isPress(post);

	// Same single-locale reference the on-page link resolves: pointing `about` at
	// the other language's slug would leave a dangling @id in the graph.
	const fieldSlug = expertiseSlugIn(post.field, locale);

	const crumb = (name: string | undefined, path: string, position: number) => ({
		"@type": "ListItem",
		position,
		name,
		item: localeUrl(locale, path),
	});

	const article = {
		"@type": press ? "NewsArticle" : "Article",
		"@id": `${url}#article`,
		headline: title,
		name: post.title,
		description: plainText(post.body, 300),
		url,
		inLanguage: locale,
		datePublished: post.publishedAt,
		dateModified: post.publishedAt,
		isAccessibleForFree: true,
		...(series ? { isPartOf: { "@type": "CreativeWorkSeries", name: series } } : {}),
		// A press cutting is someone else's work: the outlet wrote and published
		// it, and the practice is only mentioned in it. Naming the practice as the
		// publisher asserted it published Le Monde's article; omitting the author
		// entirely left a NewsArticle that no rich result will accept.
		...(press
			? {
					mentions: { "@id": CABINET_ID },
					...(post.author ? { author: { "@type": "Organization", name: post.author } } : {}),
					// Gated like the anchor on the page: one decision about `source`.
					...(isSafeExternal(post.source) ? { sameAs: post.source } : {}),
				}
			: { author: { "@id": ALICE_ID }, publisher: { "@id": CABINET_ID } }),
		...(fieldSlug
			? {
					about: {
						"@id": `${localeUrl(locale, `/expertise/${fieldSlug}`)}#service`,
					},
				}
			: {}),
	};

	const data = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					crumb(label("/") ?? "Accueil", "/", 1),
					crumb(label("/publications") ?? "Publications", "/publications", 2),
					crumb(title, `/publications/${post.slug}`, 3),
				],
			},
			article,
		],
	};

	return <JsonLd id="publication-schema" data={data} />;
}

export default PublicationSchema;
