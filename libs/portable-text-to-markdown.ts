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

const spanToMarkdown = (span: PortableSpan, markDefs: PortableMarkDef[]): string => {
	const text = span.text ?? "";
	if (!text) return "";

	const marks = span.marks ?? [];

	const wrapped = marks.reduce((acc, mark) => {
		const decorator = DECORATORS[mark];
		return decorator ? `${decorator}${acc}${decorator}` : acc;
	}, text);

	const link = marks
		.map((mark) => markDefs.find((def) => def._key === mark))
		.find((def) => def?._type === "link" && def.href);

	return link ? `[${wrapped}](${link.href})` : wrapped;
};

const blockText = (block: PortableNode): string =>
	(block.children ?? [])
		.filter((child) => child._type === "span")
		.map((span) => spanToMarkdown(span, block.markDefs ?? []))
		.join("");

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
