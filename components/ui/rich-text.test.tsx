import { render, screen } from "@testing-library/react";
import type { PortableNode } from "../../libs/types";
import RichText from "./rich-text";

// Link marks are free text an editor fills, so this is a rendering boundary
// over untrusted input. `libs/href.ts` decides; this asserts the decision
// actually reaches the anchor.

const linked = (href: string, text = "le texte"): PortableNode[] => [
	{
		_type: "block",
		_key: "b",
		style: "normal",
		markDefs: [{ _key: "m", _type: "link", href }],
		children: [{ _type: "span", _key: "s", text, marks: ["m"] }],
	},
];

const paragraph = (text: string, style = "normal"): PortableNode => ({
	_type: "block",
	_key: text.slice(0, 4),
	style,
	markDefs: [],
	children: [{ _type: "span", _key: "s", text, marks: [] }],
});

test("a same-site link stays on the site, in the same tab", () => {
	// The CMS authors internal links as absolute URLs, so a startsWith('/')
	// test sent the guide's own cross-links out to a new tab.
	render(<RichText value={linked("https://www.ouaknine-avocats.com/publications/x")} />);

	const anchor = screen.getByRole("link");
	expect(anchor).toHaveAttribute("href", "/publications/x");
	expect(anchor).not.toHaveAttribute("target");
});

test("a link that leaves the site opens away from it", () => {
	render(<RichText value={linked("https://www.legifrance.gouv.fr/article")} />);

	const anchor = screen.getByRole("link");
	expect(anchor).toHaveAttribute("href", "https://www.legifrance.gouv.fr/article");
	expect(anchor).toHaveAttribute("target", "_blank");
	expect(anchor).toHaveAttribute("rel", "noreferrer noopener");
});

test("an unrecognised scheme keeps its text and loses its href", () => {
	for (const href of ["javascript:alert(1)", "data:text/html,x"]) {
		const { unmount } = render(<RichText value={linked(href, "cliquez ici")} />);

		expect(screen.getByText("cliquez ici")).toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		unmount();
	}
});

test("a lookalike host is not treated as this site", () => {
	// Compared against the parsed hostname, so userinfo and a lookalike both
	// fail, and a real subdomain is somewhere else.
	for (const href of [
		"https://www.ouaknine-avocats.com@evil.com/",
		"https://notouaknine-avocats.com/x",
		"https://blog.ouaknine-avocats.com/x",
	]) {
		const { unmount } = render(<RichText value={linked(href)} />);

		expect(screen.getByRole("link"), href).toHaveAttribute("target", "_blank");
		unmount();
	}
});

test("headingLevel collapses a document's headings onto one tag", () => {
	// The guide writes h4 throughout and a press cutting opens on the outlet's
	// own h2, so without this the accessibility tree is gapped under the page h1.
	render(
		<RichText
			value={[paragraph("Un titre", "h4"), paragraph("Un autre", "h2")]}
			headingLevel="h2"
		/>,
	);

	expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
	expect(screen.queryByRole("heading", { level: 4 })).not.toBeInTheDocument();
});

test("without headingLevel the document keeps its own hierarchy", () => {
	render(<RichText value={[paragraph("Un titre", "h4")]} />);

	expect(screen.getByRole("heading", { level: 4 })).toBeInTheDocument();
});

test("nothing to render is nothing, not an empty shell", () => {
	const { container } = render(<RichText value={null} />);

	expect(container).toBeEmptyDOMElement();
});
