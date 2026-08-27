import type { PortableMarkDef, PortableNode, PortableSpan, PortableText } from "./types";

// Portable Text to markdown, for the text/markdown representation of a page.
// The HTML counterpart is components/ui/rich-text.tsx; the two should agree on
// which block styles, list types and marks mean something.

const HEADINGS: Record<string, string> = {
	h1: "#",
	h2: "##",
	h3: "###",
	h4: "####",
	h5: "#####",
	h6: "######",
};

const DECORATORS: Record<string, string> = {
	strong: "**",
	em: "_",
	code: "`",
};

// Marks are nested outermost first, in one fixed order, so that two spans
// carrying the same set always produce the same nesting and can be recognised
// as a single run. Sanity stores the set unordered: the guide has spans marked
// ["em","strong"] sitting between spans marked ["strong"].
const NESTING = ["strong", "em", "code"] as const;

type Layer = { key: string; open: string; close: string };

// A link is the outermost layer and is keyed by its href, so two consecutive
// spans pointing at the same place stay one link rather than becoming two.
const layersOf = (span: PortableSpan, markDefs: PortableMarkDef[]): Layer[] => {
	const marks = span.marks ?? [];
	const layers: Layer[] = [];

	const link = marks
		.map((mark) => markDefs.find((def) => def._key === mark))
		.find((def) => def?._type === "link" && def.href);

	if (link?.href) layers.push({ key: `link:${link.href}`, open: "[", close: `](${link.href})` });

	for (const name of NESTING) {
		const decorator = DECORATORS[name];
		if (decorator && marks.includes(name))
			layers.push({ key: name, open: decorator, close: decorator });
	}

	return layers;
};

// How many layers the two runs already have in common, from the outside in.
// Those stay open across the boundary; everything deeper is closed and the
// new span's own layers opened after it.
const sharedDepth = (open: Layer[], want: Layer[]): number => {
	const limit = Math.min(open.length, want.length);
	let shared = 0;
	while (shared < limit && open[shared]?.key === want[shared]?.key) shared++;
	return shared;
};

const closeFrom = (open: Layer[], depth: number): string =>
	open
		.slice(depth)
		.reverse()
		.map((layer) => layer.close)
		.join("");

const openFrom = (want: Layer[], depth: number): string =>
	want
		.slice(depth)
		.map((layer) => layer.open)
		.join("");

// Emphasis is opened and closed across the run of spans that share it, rather
// than around each span.
//
// Closing and reopening at every span boundary is what produced `****` in the
// markdown of the garde à vue guide: a bold sentence with one italic word
// inside it is stored as three spans, ["strong"], ["em","strong"], ["strong"],
// and wrapping each on its own emitted `**a****_b_****c**`. Two `**` runs meet,
// and CommonMark does not read that as the bold sentence it came from.
const blockText = (block: PortableNode): string => {
	const markDefs = block.markDefs ?? [];
	const spans = (block.children ?? []).filter((child) => child._type === "span");

	let out = "";
	let open: Layer[] = [];

	for (const span of spans) {
		const text = span.text ?? "";
		if (!text) continue;

		const want = layersOf(span, markDefs);
		const shared = sharedDepth(open, want);

		out += closeFrom(open, shared) + openFrom(want, shared) + text;
		open = want;
	}

	return out + closeFrom(open, 0);
};

// Sanity stores an empty paragraph where the editor wanted air. Markdown gets
// that from the blank line between blocks, so the spacer is dropped.
const isSpacer = (block: PortableNode): boolean => blockText(block).trim() === "";

const listMarker = (block: PortableNode, index: number): string =>
	block.listItem === "number" ? `${index + 1}.` : "-";

const renderListItem = (block: PortableNode, index: number): string => {
	const indent = "  ".repeat(Math.max((block.level ?? 1) - 1, 0));
	return `${indent}${listMarker(block, index)} ${blockText(block)}`;
};

const renderBlock = (block: PortableNode): string => {
	const text = blockText(block);
	if (!text) return "";

	const heading = block.style === undefined ? undefined : HEADINGS[block.style];
	if (heading) return `${heading} ${text}`;
	if (block.style === "blockquote") return `> ${text}`;
	return text;
};

// The GROQ projections return a raw `asset._ref`, and this module is pure, so
// no URL is derivable here. An image therefore degrades to its alt text rather
// than to `![alt]()`, which is a broken reference to whatever reads it.
const renderImage = (block: PortableNode): string => block.alt ?? block.caption ?? "";

// Consecutive list items become one markdown list; everything else is its own
// block separated by a blank line.
export const toMarkdown = (blocks: PortableText | null | undefined): string => {
	const chunks: string[] = [];
	let list: string[] | null = null;

	for (const block of blocks ?? []) {
		if (block?._type !== "block") {
			if (list) {
				chunks.push(list.join("\n"));
				list = null;
			}
			if (block?._type === "image") {
				const image = renderImage(block);
				if (image) chunks.push(image);
			}
			continue;
		}

		if (block.listItem) {
			list = list ?? [];
			list.push(renderListItem(block, list.length));
			continue;
		}

		if (list) {
			chunks.push(list.join("\n"));
			list = null;
		}

		if (isSpacer(block)) continue;

		const rendered = renderBlock(block);
		if (rendered) chunks.push(rendered);
	}

	if (list) chunks.push(list.join("\n"));

	return chunks.join("\n\n");
};
