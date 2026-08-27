import { render } from "@testing-library/react";
import footerContent from "../../content/footerContent.json";
import organizationContent from "../../content/organizationContent.json";
import { HOST } from "../../libs/site-url";
import { graphOf, nodeOfType } from "../../test/json-ld";
import { setRouter } from "../../test/setup";
import SiteSchema from "./site-schema";

// The practice's identity, published once per page from the layout. One
// `@graph` rather than three scripts, so the nodes resolve to one entity.

const graph = () => graphOf(render(<SiteSchema />).container);

test("the graph carries the practice, the person and the site", () => {
	const nodes = graph();

	expect(nodes).toHaveLength(3);
	expect(nodeOfType(nodes, "Attorney")?.["@type"]).toStrictEqual([
		"LegalService",
		"Attorney",
		"Organization",
	]);
	expect(nodeOfType(nodes, "Person")).toBeDefined();
	expect(nodeOfType(nodes, "WebSite")).toBeDefined();
});

test("the nodes reference each other by @id rather than restating themselves", () => {
	const nodes = graph();
	const cabinet = `${HOST}/#cabinet`;
	const alice = `${HOST}/#alice`;

	expect(nodeOfType(nodes, "Attorney")).toMatchObject({
		"@id": cabinet,
		founder: { "@id": alice },
		employee: { "@id": alice },
	});
	expect(nodeOfType(nodes, "Person")).toMatchObject({
		"@id": alice,
		worksFor: { "@id": cabinet },
	});
	expect(nodeOfType(nodes, "WebSite")).toMatchObject({ publisher: { "@id": cabinet } });
});

test("the contact facts come from the store, never retyped", () => {
	// footerContent.json is the canonical home for the address, the phone and
	// the coordinates. A schema block that restates them is how they drift.
	expect(nodeOfType(graph(), "Attorney")).toMatchObject({
		telephone: footerContent.phone,
		email: footerContent.fr.email,
		hasMap: footerContent.mapsUrl,
		address: { "@type": "PostalAddress", ...footerContent.postalAddress },
		geo: { "@type": "GeoCoordinates", ...footerContent.geo },
	});
});

test("the English edition names the practice in English", () => {
	setRouter({ locale: "en" });
	const nodes = graph();

	expect(nodeOfType(nodes, "Attorney")).toMatchObject({
		name: organizationContent.en.name,
		description: organizationContent.en.description,
	});
	expect(nodeOfType(nodes, "WebSite")).toMatchObject({ inLanguage: "en" });
});

test("the phone the schema publishes is the dial-safe form", () => {
	// The displayed `+33 (0)1 …` does not dial from outside France, and this is
	// the number an assistant reads out.
	const telephone = nodeOfType(graph(), "Attorney")?.telephone;

	expect(telephone).toBe("+33184162035");
	expect(String(telephone)).not.toContain("(0)");
});
