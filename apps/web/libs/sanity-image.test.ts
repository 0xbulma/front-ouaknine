import { imageDimensions } from "./sanity-image";

// The intrinsic size is the only thing `next/image` cannot work out for itself
// here: the GROQ projections return a bare `asset._ref`, so the reference is
// the sole source. Read it wrong and every image in an article renders at zero
// height, or the page reflows around each one as it arrives.

test("the dimensions come out of the reference", () => {
	expect(imageDimensions("image-a1b2c3d4e5f6-1200x800-jpg")).toStrictEqual({
		width: 1200,
		height: 800,
	});
	expect(imageDimensions("image-abc-64x64-png")).toStrictEqual({ width: 64, height: 64 });
	expect(imageDimensions("image-abc-3000x1687-webp")).toStrictEqual({
		width: 3000,
		height: 1687,
	});
});

test("a reference from the real dataset parses to the size the CMS reports", () => {
	// Taken from `*[_type == "sanity.imageAsset"]`, where metadata.dimensions
	// says 1920x1245 for this asset. The id is the only copy of that the
	// projections hand the renderer.
	expect(
		imageDimensions("image-012e0e333bd58453de1b25c266a5701b0ed1ce2d-1920x1245-jpg"),
	).toStrictEqual({ width: 1920, height: 1245 });
	expect(
		imageDimensions("image-032a99868b85bdc3243216f4de2ca9791da8d627-800x800-png"),
	).toStrictEqual({ width: 800, height: 800 });
});

test("an asset id containing digits and dashes does not confuse the parse", () => {
	// The id is a hex hash; matching the *last* `<w>x<h>-<ext>` rather than the
	// third dash-separated field is what keeps a stray `-800x600-` inside an id
	// from winning.
	expect(imageDimensions("image-1a2b3c4d5e6f7a8b9c0d-1920x1080-png")).toStrictEqual({
		width: 1920,
		height: 1080,
	});
});

test("anything that is not an image reference has no dimensions", () => {
	expect(imageDimensions("file-abc-pdf")).toBe(null);
	expect(imageDimensions("image-abc-jpg")).toBe(null);
	expect(imageDimensions("image-abc-1200x-jpg")).toBe(null);
	expect(imageDimensions("not a reference at all")).toBe(null);
});

test("a missing reference is not an error", () => {
	// The studio lets an editor insert an image block and leave it empty.
	expect(imageDimensions(undefined)).toBe(null);
	expect(imageDimensions(null)).toBe(null);
	expect(imageDimensions("")).toBe(null);
});

test("a zero dimension is refused rather than passed to next/image", () => {
	expect(imageDimensions("image-abc-0x0-jpg")).toBe(null);
	expect(imageDimensions("image-abc-800x0-jpg")).toBe(null);
});
