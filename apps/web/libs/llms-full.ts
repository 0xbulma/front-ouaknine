import { joinBlocks } from "./markdown-list";

// /llms-full.txt: the llms.txt header, then the markdown of every page, one
// after the other, for an agent that would rather read the site once than
// follow its links. Pure, like llms.txt: the route fetches and renders, this
// only decides the order and the shape.

// The pages in the order llms.txt lists them, each field of expertise right
// after the expertise index and each publication right after the publications
// index, so a child page sits where an agent reading in order expects it.
export const fullPaths = (
	pages: { path: string }[],
	fieldSlugs: string[],
	publicationSlugs: string[],
): string[] =>
	pages.flatMap(({ path }) => {
		if (path === "/expertise") return [path, ...fieldSlugs.map((slug) => `/expertise/${slug}`)];
		if (path === "/publications") {
			return [path, ...publicationSlugs.map((slug) => `/publications/${slug}`)];
		}
		return [path];
	});

// Each document already opens on its own `# title` and its `Source:` URL, and
// closes on the `---` footer, which is what separates it from the next one.
export const llmsFull = (header: string, documents: string[]): string =>
	`${joinBlocks([header, ...documents.map((document) => document.trim())])}\n`;
