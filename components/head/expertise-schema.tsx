import headerContent from "../../content/headerContent.json";
import useLocale from "../../hooks/useLocale";
import { plainText } from "../../libs/expertise";
import { pageUrl } from "../../libs/site-url";
import type { ExpertiseField } from "../../libs/types";
import JsonLd from "./json-ld";
import { CABINET_ID } from "./site-schema";

// A field of expertise is a Service the practice provides, not a loose page.
// `current` marks the one being read, so the field pages describe themselves
// and the hub describes the catalogue.
function ExpertiseSchema({ items, current }: { items: ExpertiseField[]; current?: string }) {
	const locale = useLocale();
	const nav = headerContent[locale].nav;
	const sectionName = nav.find((link) => link.url === "/expertise")?.label ?? "Expertise";

	const field = current ? items.find((item) => item.slug === current) : null;

	const service = (item: ExpertiseField) => ({
		"@type": "Service",
		"@id": `${pageUrl(locale, `/expertise/${item.slug}`)}#service`,
		name: item.title?.trim(),
		description: plainText(item.description, 300),
		serviceType: item.title?.trim(),
		url: pageUrl(locale, `/expertise/${item.slug}`),
		provider: { "@id": CABINET_ID },
		areaServed: { "@type": "City", name: "Paris" },
		availableLanguage: ["fr", "en"],
	});

	const crumb = (name: string | undefined, path: string, position: number) => ({
		"@type": "ListItem",
		position,
		name,
		item: pageUrl(locale, path),
	});

	const breadcrumb = {
		"@type": "BreadcrumbList",
		itemListElement: [
			crumb(nav[0]?.label ?? "Accueil", "/", 1),
			crumb(sectionName, "/expertise", 2),
			...(field ? [crumb(field.title?.trim(), `/expertise/${current}`, 3)] : []),
		],
	};

	const data = {
		"@context": "https://schema.org",
		"@graph": [
			breadcrumb,
			field
				? service(field)
				: {
						"@type": "ItemList",
						name: sectionName,
						itemListElement: items.map((item, index) => ({
							"@type": "ListItem",
							position: index + 1,
							item: service(item),
						})),
					},
		],
	};

	return <JsonLd id="expertise-schema" data={data} />;
}

export default ExpertiseSchema;
