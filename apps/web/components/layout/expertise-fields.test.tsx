import { render } from "@testing-library/react";
import type { ExpertiseField } from "../../libs/types";
import ExpertiseFields from "./expertise-fields";

// Picking a field scrolls to its first line, or deliberately does not, and which
// one is right depends on where the index is: beside the field on a wide screen,
// above it once the two columns stack. jsdom lays nothing out, so the layout is
// the pair of rects the effect reads.
const rect = (left: number, right: number, top: number): DOMRect => ({
	x: left,
	y: top,
	top,
	bottom: top,
	left,
	right,
	width: right - left,
	height: 0,
	toJSON: () => "",
});

const items: ExpertiseField[] = [
	{ slug: "penal", title: "Pénal" },
	{ slug: "presse", title: "Presse" },
];

const scrollIntoView = vi.fn();

beforeEach(() => {
	scrollIntoView.mockClear();
	Element.prototype.scrollIntoView = scrollIntoView;
	vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

// `top` is the field's first line; `beside` puts the index in its own column to
// the left of it, the way it sits above $breakpoint-md.
const pick = ({ beside, top }: { beside: boolean; top: number }) => {
	const view = render(<ExpertiseFields items={items} label="Expertise" linkLabel="Contact" />);
	const field = view.container.querySelector("article");
	const rail = view.container.querySelector("article")?.previousElementSibling;
	if (!field || !rail) throw new Error("the index and the field are what this tests");

	field.getBoundingClientRect = () => rect(368, 1200, top);
	rail.getBoundingClientRect = () => (beside ? rect(96, 368, top) : rect(368, 1200, top - 600));

	view.rerender(
		<ExpertiseFields items={items} label="Expertise" linkLabel="Contact" current="presse" />,
	);
};

test("beside the index, a field picked from the top of the page is left where it is", () => {
	// It is already on screen there, 68px below the reading line, and pulling it
	// up scrolls a page that was never scrolled.
	pick({ beside: true, top: 164 });

	expect(scrollIntoView).not.toHaveBeenCalled();
});

test("beside the index, a field picked after reading into the last one is scrolled back up", () => {
	pick({ beside: true, top: -236 });

	expect(scrollIntoView).toHaveBeenCalled();
});

test("under the index, the field is scrolled to however the page was scrolled", () => {
	// Stacked, it starts a screen below the rows that pick it, so the offset test
	// on its own left the swap happening off the bottom of a phone.
	pick({ beside: false, top: 757 });

	expect(scrollIntoView).toHaveBeenCalled();
});
