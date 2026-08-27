import type { ImageDimensions } from "./types";

// The two fields that address a project on Sanity's CDN, and the whole of what
// the image URL builder needs. They live here rather than beside the client
// because `components/ui/sanityImage.tsx` runs in the browser: importing them
// from libs/clientApi pulled @sanity/client, rxjs and get-it into the bundle of
// every page that can render rich text, 72 kB the browser never calls.
// An absent id stays absent rather than becoming a silent default: the client
// refuses a blank one with "Configuration must contain `projectId`", which is
// the error the local-development notes in CLAUDE.md tell you to expect.
export const SANITY_PROJECT = {
	projectId: process.env.NEXT_PUBLIC_SANITY_ID ?? "",
	dataset: "production",
};

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
