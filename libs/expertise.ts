import clientApi from "./clientApi";
import { normaliseFields } from "./expertise-list";
import type { ExpertiseDocument, ExpertiseDocumentRaw, PortableText } from "./types";

// The CMS has no slug field on an expertise item, so the URL is derived from
// the title, stable for as long as the title is. `slugify` is the one
// derivation behind every URL on the site.
export { slugify as expertiseSlug } from "./slug";

const EXPERTISE_QUERY = `*[_type == "expertise" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title,
  "expertiseList": expertiseList[]->
}`;

// Normalised once, where every consumer reads the list. The shaping is in
// libs/expertise-list.ts, which is pure and therefore tested.
export const fetchExpertise = async (locale?: string): Promise<ExpertiseDocument | null> => {
	const doc = await clientApi.fetch<ExpertiseDocumentRaw | null>(EXPERTISE_QUERY, {
		locale: locale ?? "fr",
	});
	if (!doc) return null;

	return { ...doc, expertiseList: normaliseFields(doc.expertiseList) };
};

// Portable text down to one line, for a meta description.
export const plainText = (blocks: PortableText | null | undefined, limit = 160): string => {
	const text = (blocks ?? [])
		.filter((block) => block._type === "block")
		.map((block) => (block.children ?? []).map((span) => span.text).join(""))
		.join(" ")
		.replace(/\s+/g, " ")
		.trim();

	if (text.length <= limit) return text;

	const cut = text.lastIndexOf(" ", limit);

	// Trailing punctuation would run straight into the ellipsis ("commun....").
	const kept = text.slice(0, cut > 0 ? cut : limit).replace(/[\s.,;:]+$/, "");

	return `${kept}…`;
};
