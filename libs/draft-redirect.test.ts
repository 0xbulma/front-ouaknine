import { draftRedirect } from "./draft-redirect";

test("keeps a path on this site", () => {
	expect(draftRedirect("/")).toBe("/");
	expect(draftRedirect("/contact")).toBe("/contact");
	expect(draftRedirect("/en/expertise/droit-penal")).toBe("/en/expertise/droit-penal");
	expect(draftRedirect("/publications?page=2")).toBe("/publications?page=2");
});

test("refuses anything that leaves the origin", () => {
	// Protocol-relative: the browser reads the host that follows, not a path.
	expect(draftRedirect("//evil.example")).toBe("/");
	expect(draftRedirect("//evil.example/contact")).toBe("/");
	// Backslashes normalise to slashes before the URL resolves.
	expect(draftRedirect("/\\evil.example")).toBe("/");
	expect(draftRedirect("\\\\evil.example")).toBe("/");
	expect(draftRedirect("https://evil.example")).toBe("/");
	expect(draftRedirect("javascript:alert(1)")).toBe("/");
});

test("falls back when the Studio sent nothing", () => {
	expect(draftRedirect(undefined)).toBe("/");
	expect(draftRedirect("")).toBe("/");
	// A bare path with no leading slash is relative to /api/, not to the site.
	expect(draftRedirect("contact")).toBe("/");
});
