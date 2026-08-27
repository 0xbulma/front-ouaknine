import imageUrlBuilder from "@sanity/image-url";
import type { ImageLoader } from "next/image";
import Image from "next/image";

import { imageDimensions, SANITY_PROJECT } from "../../libs/sanity-image";
import type { SanityImageRef } from "../../libs/types";

// The transforms `next-sanity-image` applied by default, kept so the CDN keeps
// serving the same bytes for the same request.
const QUALITY = 75;
const BLUR_WIDTH = 64;
const BLUR_QUALITY = 30;
const BLUR_AMOUNT = 50;

const builder = imageUrlBuilder(SANITY_PROJECT);

// `fit: clip` never enlarges past the asset, and `auto: format` lets Sanity
// negotiate webp or avif per request. Resizing happens on Sanity's CDN rather
// than through /_next/image, which is what the loader below is for.
// biome-ignore lint/suspicious/noFocusedTests: `fit` here is the Sanity image builder's crop mode, not Jasmine's focused test.
const source = (ref: string) => builder.image(ref).auto("format").fit("clip");

const SanityImage = ({ asset, alt }: { asset: SanityImageRef; alt: string }) => {
	const dimensions = imageDimensions(asset._ref);

	// An image block the studio left without an asset, or a reference to
	// something that is not an image: there is no size to reserve, so nothing
	// to render.
	if (!dimensions) return null;

	const loader: ImageLoader = ({ width, quality }) =>
		source(asset._ref)
			.quality(quality || QUALITY)
			.width(width)
			.url();

	return (
		<Image
			loader={loader}
			src={source(asset._ref).quality(QUALITY).url()}
			width={dimensions.width}
			height={dimensions.height}
			alt={alt}
			placeholder="blur"
			blurDataURL={source(asset._ref)
				.width(BLUR_WIDTH)
				.quality(BLUR_QUALITY)
				.blur(BLUR_AMOUNT)
				.url()}
			style={{ width: "100%", height: "auto" }}
			sizes="(max-width: 800px) 100vw, 800px"
		/>
	);
};

export default SanityImage;
