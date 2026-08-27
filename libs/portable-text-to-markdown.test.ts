import { toMarkdown } from "./portable-text-to-markdown";
import type { PortableNode } from "./types";

const block = (text: string, extra: Partial<PortableNode> = {}): PortableNode => ({
	_type: "block",
	_key: text.slice(0, 6) || "empty",
	style: "normal",
	markDefs: [],
	children: [{ _type: "span", _key: "s", text, marks: [] }],
	...extra,
});

test("paragraphs are separated by a blank line", () => {
	expect(toMarkdown([block("One"), block("Two")])).toBe("One\n\nTwo");
});

test("whitespace-only spacer blocks are dropped", () => {
	// The behaviour `isSpacer` adds over the empty-text check: Sanity produces a
	// space-only paragraph whenever an editor leaves one in a spacer, and it
	// would otherwise emit a stray indented line.
	expect(toMarkdown([block("One"), block("   "), block("Two")])).toBe("One\n\nTwo");
});

test("empty spacer blocks are dropped", () => {
	// The CMS stores an empty paragraph between every paragraph of the bio.
	expect(toMarkdown([block("One"), block(""), block("Two")])).toBe("One\n\nTwo");
});

test("headings and blockquotes carry their markdown prefix", () => {
	expect(toMarkdown([block("Title", { style: "h2" })])).toBe("## Title");
	expect(toMarkdown([block("Quote", { style: "blockquote" })])).toBe("> Quote");
});

test("consecutive list items become one list", () => {
	const value = [
		block("Intro"),
		block("First", { listItem: "bullet", level: 1 }),
		block("Second", { listItem: "bullet", level: 1 }),
		block("Outro"),
	];
	expect(toMarkdown(value)).toBe("Intro\n\n- First\n- Second\n\nOutro");
});

test("numbered lists are numbered and levels are indented", () => {
	const value = [
		block("One", { listItem: "number", level: 1 }),
		block("Two", { listItem: "number", level: 1 }),
		block("Nested", { listItem: "bullet", level: 2 }),
	];
	expect(toMarkdown(value)).toBe("1. One\n2. Two\n  - Nested");
});

test("decorator marks and links", () => {
	const value: PortableNode[] = [
		{
			_type: "block",
			_key: "b",
			style: "normal",
			markDefs: [{ _key: "l1", _type: "link", href: "https://example.com" }],
			children: [
				{ _type: "span", _key: "s1", text: "plain ", marks: [] },
				{ _type: "span", _key: "s2", text: "bold", marks: ["strong"] },
				{ _type: "span", _key: "s3", text: " and ", marks: [] },
				{ _type: "span", _key: "s4", text: "italic", marks: ["em"] },
				{ _type: "span", _key: "s5", text: " and ", marks: [] },
				{ _type: "span", _key: "s6", text: "a link", marks: ["l1"] },
			],
		},
	];
	expect(toMarkdown(value)).toBe("plain **bold** and _italic_ and [a link](https://example.com)");
});

test("an unknown mark leaves the text alone", () => {
	const value = [
		block("kept", {
			children: [{ _type: "span", _key: "s", text: "kept", marks: ["underline"] }],
		}),
	];
	expect(toMarkdown(value)).toBe("kept");
});

test("missing and empty input", () => {
	expect(toMarkdown(undefined)).toBe("");
	expect(toMarkdown([])).toBe("");
	expect(toMarkdown([block("")])).toBe("");
});

test("a non-block between list items closes the list first", () => {
	// Without the flush the image is pushed before the open list, so the two
	// items merge and the image jumps ahead of them.
	expect(
		toMarkdown([
			{ ...block("A"), listItem: "bullet" },
			{ _type: "image", _key: "i", alt: "Portrait" },
			{ ...block("B"), listItem: "bullet" },
		]),
	).toBe("- A\n\nPortrait\n\n- B");
});

test("images render as their alt text only", () => {
	// Not `![alt]()`: this module is pure and the projections return a raw asset
	// reference, so there is no URL to put in the parentheses, and an empty one
	// is a broken reference to whatever reads the document.
	expect(toMarkdown([{ _type: "image", _key: "i", alt: "A portrait" }])).toBe("A portrait");
	expect(toMarkdown([{ _type: "image", _key: "i", caption: "Une légende" }])).toBe("Une légende");
	expect(toMarkdown([{ _type: "image", _key: "i" }])).toBe("");
	expect(toMarkdown([{ _type: "image", _key: "i" }]).includes("![")).toBe(false);
});

const spans = (
	parts: [string, string[]][],
	markDefs: PortableNode["markDefs"] = [],
): PortableNode => ({
	_type: "block",
	_key: "runs",
	style: "normal",
	markDefs,
	children: parts.map(([text, marks], i) => ({
		_type: "span",
		_key: `s${i}`,
		text,
		marks,
	})),
});

test("a decorator shared by consecutive spans is opened once", () => {
	// What the guide stores for a bold sentence with one italic word in it.
	// Wrapping each span on its own emitted `**a****_b_****c**`, where two `**`
	// runs meet and CommonMark stops reading it as one bold sentence.
	const value = [
		spans([
			["informé « ", ["strong"]],
			["par tous moyens", ["em", "strong"]],
			[" ».", ["strong"]],
		]),
	];
	expect(toMarkdown(value)).toBe("**informé « _par tous moyens_ ».**");
});

test("mark order within a span does not change the nesting", () => {
	const a = toMarkdown([spans([["x", ["em", "strong"]]])]);
	const b = toMarkdown([spans([["x", ["strong", "em"]]])]);
	expect(a).toBe(b);
	expect(a).toBe("**_x_**");
});

test("consecutive spans sharing one link stay a single link", () => {
	const value = [
		spans(
			[
				["Guide", ["l1"]],
				[" de survie", ["strong", "l1"]],
			],
			[{ _key: "l1", _type: "link", href: "https://example.test/a" }],
		),
	];
	expect(toMarkdown(value)).toBe("[Guide** de survie**](https://example.test/a)");
});

test("adjacent links to different places stay separate", () => {
	const value = [
		spans(
			[
				["one", ["l1"]],
				["two", ["l2"]],
			],
			[
				{ _key: "l1", _type: "link", href: "https://example.test/a" },
				{ _key: "l2", _type: "link", href: "https://example.test/b" },
			],
		),
	];
	expect(toMarkdown(value)).toBe("[one](https://example.test/a)[two](https://example.test/b)");
});

test("an unmarked span between two bold ones closes and reopens", () => {
	const value = [
		spans([
			["a", ["strong"]],
			[" and ", []],
			["b", ["strong"]],
		]),
	];
	expect(toMarkdown(value)).toBe("**a** and **b**");
});
