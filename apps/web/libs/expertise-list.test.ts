import { normaliseFields } from "./expertise-list";

test("the slug comes from the title, not from another field", () => {
	// Derived from the wrong field, every field URL collapses onto `/expertise/`
	// — in the sitemap, in llms.txt, in the markdown and in getStaticPaths.
	const [field] = normaliseFields([{ title: "Droit pénal général", titleseo: "Autre chose" }]);

	expect(field?.slug).toBe("droit-penal-general");
});

test("a dangling studio reference is dropped, not carried", () => {
	// A dereference yields null for a target that has been deleted or is only a
	// draft; handed on, it throws in every consumer.
	const fields = normaliseFields([
		{ title: "Droit pénal général" },
		null,
		{ title: "Enquêtes internes" },
		undefined,
	]);

	expect(fields).toHaveLength(2);
	expect(fields.map((f) => f.slug)).toStrictEqual(["droit-penal-general", "enquetes-internes"]);
});

test("the rest of the field is preserved", () => {
	const [field] = normaliseFields([
		{ title: "Droit de la presse", description: [{ _type: "block" }], titleSpe: "Compétences" },
	]);

	expect(field?.titleSpe).toBe("Compétences");
	expect(field?.description).toStrictEqual([{ _type: "block" }]);
});

test("a missing list is an empty one", () => {
	expect(normaliseFields(undefined)).toStrictEqual([]);
	expect(normaliseFields(null)).toStrictEqual([]);
	expect(normaliseFields([])).toStrictEqual([]);
});
