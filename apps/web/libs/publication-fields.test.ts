import { pagerFor } from "./publication-fields";

// The rail the page is handed, shaped the way getStaticProps shapes it.
const rail = [
	{ post: { _id: "a", slug: "ep-1" }, episode: 1, title: "Un" },
	{ post: { _id: "b", slug: "ep-2" }, episode: 2, title: "Deux" },
	{ post: { _id: "c", slug: "ep-3" }, episode: 3, title: "Trois" },
];

const ids = ({ previous, next }: ReturnType<typeof pagerFor>) => [
	previous?.post._id ?? null,
	next?.post._id ?? null,
];

test("an episode in the middle has both neighbours", () => {
	expect(ids(pagerFor(rail, "b"))).toStrictEqual(["a", "c"]);
});

test("the ends of a guide have one neighbour each", () => {
	expect(ids(pagerFor(rail, "a"))).toStrictEqual([null, "b"]);
	expect(ids(pagerFor(rail, "c"))).toStrictEqual(["b", null]);
});

test("a document that is not in the rail gets no pager at all", () => {
	// The one that matters: at position -1, a bare `series[position + 1]` is
	// `series[0]`, so every standalone article published the guide's first
	// episode as its "next".
	expect(ids(pagerFor(rail, "not-in-this-guide"))).toStrictEqual([null, null]);
});

test("a standalone article has no rail", () => {
	expect(ids(pagerFor(null, "a"))).toStrictEqual([null, null]);
	expect(ids(pagerFor(undefined, "a"))).toStrictEqual([null, null]);
	expect(ids(pagerFor([], "a"))).toStrictEqual([null, null]);
});

test("a guide of one is both ends at once", () => {
	expect(ids(pagerFor(rail.slice(0, 1), "a"))).toStrictEqual([null, null]);
});
