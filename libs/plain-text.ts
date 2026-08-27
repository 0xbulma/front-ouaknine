import type { PortableText } from "./types";

// Portable text down to one line, for a meta description or an agent's lead.
// It lived in libs/expertise.ts, which builds a Sanity client: the five
// components that call it were pulling @sanity/client into the browser bundle
// for a pure string function. It has nothing to do with expertise, and here it
// is testable.
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
