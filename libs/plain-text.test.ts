import { plainText } from "./plain-text";
import type { PortableText } from "./types";

const block = (text: string): PortableText[number] => ({
	_type: "block",
	children: [{ _type: "span", text }],
});

test("joins the spans of every block into one line", () => {
	expect(plainText([block("Une phrase."), block("Et une autre.")])).toBe(
		"Une phrase. Et une autre.",
	);
});

test("collapses the whitespace a rich-text editor leaves behind", () => {
	expect(plainText([block("  deux   espaces\net un retour  ")])).toBe("deux espaces et un retour");
});

test("skips anything that is not a block", () => {
	const withImage: PortableText = [
		block("Le texte."),
		{ _type: "image", asset: { _ref: "image-abc-800x600-jpg", _type: "reference" } },
	];

	expect(plainText(withImage)).toBe("Le texte.");
});

test("an absent body is an empty string, not a crash", () => {
	expect(plainText(null)).toBe("");
	expect(plainText(undefined)).toBe("");
	expect(plainText([])).toBe("");
});

test("cuts on a word boundary and marks the cut", () => {
	const long = plainText([block("un ".repeat(100))], 20);

	expect(long.endsWith("…")).toBe(true);
	expect(long.length).toBeLessThanOrEqual(21);
	expect(long).not.toContain("u…");
});

test("trailing punctuation does not run into the ellipsis", () => {
	// "commun...." is what a naive slice produces at a sentence end.
	expect(plainText([block("Le droit pénal commun. Une autre phrase entière ici.")], 22)).toBe(
		"Le droit pénal commun…",
	);
});

test("a body shorter than the limit is returned whole, with no ellipsis", () => {
	expect(plainText([block("Court.")], 160)).toBe("Court.");
});
