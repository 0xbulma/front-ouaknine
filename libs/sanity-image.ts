import type { ImageDimensions } from "./types";

// Sanity encodes an asset's pixel size in the reference itself:
//
//   image-<assetId>-<width>x<height>-<extension>
//
// next-sanity-image read them the same way, by splitting on `-` and taking the
// third field. It is the only source of the intrinsic size: the GROQ
// projections return a raw `asset._ref` and nothing else, and without a width
// and height `next/image` cannot reserve the space, so a responsive layout
// collapses to zero height and the article reflows as each image arrives.
const DIMENSIONS = /-(\d+)x(\d+)-[a-z0-9]+$/i;

/** The asset's intrinsic size, or null when the reference is not an image. */
export const imageDimensions = (ref: string | null | undefined): ImageDimensions | null => {
	const match = ref ? DIMENSIONS.exec(ref) : null;
	if (!match) return null;

	const width = Number(match[1]);
	const height = Number(match[2]);

	return width > 0 && height > 0 ? { width, height } : null;
};
