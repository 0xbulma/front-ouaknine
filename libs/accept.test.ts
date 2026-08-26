import { isNegotiablePath, preferredType, varyWithAccept } from "./accept";

// The table published at https://acceptmarkdown.com/guides/accept-parsing
const VECTORS: [string | null, string][] = [
	["text/markdown", "text/markdown"],
	["text/markdown, text/html;q=0.8", "text/markdown"],
	["text/html", "text/html"],
	["text/markdown;q=0, text/html", "text/html"],
	[null, "text/html"],
	["*/*", "text/html"],
];

test("published test vectors", () => {
	for (const [header, expected] of VECTORS) {
		expect(preferredType(header), `Accept: ${header}`).toBe(expected);
	}
});

test("406 only when every representation is ruled out", () => {
	expect(preferredType("application/pdf")).toBe(null);
	// A single q=0 is not a reason to 406 when something else still matches.
	expect(preferredType("text/markdown;q=0")).toBe("text/html");
	expect(preferredType("text/html;q=0")).toBe("text/markdown");
});

test("a real browser Accept header resolves to HTML", () => {
	const chrome =
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";
	expect(preferredType(chrome)).toBe("text/html");
	expect(preferredType("text/html,application/xhtml+xml,*/*;q=0.8")).toBe("text/html");
});

test("a specific range beats a wildcard regardless of q", () => {
	// RFC 9110 §12.5.1: the explicit refusal wins over the catch-all.
	expect(preferredType("text/html;q=0, */*")).toBe("text/markdown");
	expect(preferredType("text/markdown;q=0, */*")).toBe("text/html");
});

test("a wildcard in another type family matches nothing", () => {
	// `text/*` matching by prefix is what keeps `image/*` and `application/*`
	// from resolving to HTML instead of the 406 gate.
	expect(preferredType("image/*")).toBe(null);
	expect(preferredType("application/*")).toBe(null);
	expect(preferredType("text/*")).toBe("text/html");
});

test("subtype wildcards and malformed q values", () => {
	expect(preferredType("text/*")).toBe("text/html");
	expect(preferredType("text/markdown;q=nonsense")).toBe("text/markdown");
	expect(preferredType("TEXT/MARKDOWN")).toBe("text/markdown");
	expect(preferredType("  text/markdown ; q=0.9 ")).toBe("text/markdown");
	expect(preferredType("")).toBe("text/html");
});

test("client order breaks ties at equal q", () => {
	expect(preferredType("text/markdown, text/html")).toBe("text/markdown");
	expect(preferredType("text/html, text/markdown")).toBe("text/html");
});

test("only page paths and .md siblings are negotiated", () => {
	expect(isNegotiablePath("/")).toBe(true);
	expect(isNegotiablePath("/contact")).toBe(true);
	expect(isNegotiablePath("/expertise/droit-penal-general")).toBe(true);
	expect(isNegotiablePath("/contact.md")).toBe(true);
	expect(isNegotiablePath("/images/paris-map.svg")).toBe(false);
	expect(isNegotiablePath("/robots.txt")).toBe(false);
	expect(isNegotiablePath("/sitemap.xml")).toBe(false);
	expect(isNegotiablePath("/favicon.ico")).toBe(false);
	expect(isNegotiablePath("/site.webmanifest")).toBe(false);
});

test("Vary keeps whatever was already there", () => {
	expect(varyWithAccept(null)).toBe("Accept, Accept-Encoding");
	expect(varyWithAccept("Accept-Encoding")).toBe("Accept-Encoding, Accept");
	expect(varyWithAccept("Accept")).toBe("Accept");
	expect(varyWithAccept("accept, Accept-Encoding")).toBe("accept, Accept-Encoding");
});

test("specificity outranks client order, not just position", () => {
	// The named test above puts the specific range first, where the tie-break on
	// order alone gives the same answer — so it passed with the specificity rule
	// deleted. These vectors put the wildcard first, where only §12.5.1's
	// "most specific match wins" produces the right answer.
	expect(preferredType("*/*, text/html;q=0")).toBe("text/markdown");
	expect(preferredType("*/*;q=0.9, text/markdown;q=0.8")).toBe("text/html");
	expect(preferredType("*/*, text/markdown;q=0")).toBe("text/html");
	// A subtype wildcard has to rank below a fully specified type too, or an
	// explicit q=0 on that type would not survive.
	expect(preferredType("text/*, text/html;q=0")).toBe("text/markdown");
});
