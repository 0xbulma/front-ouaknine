import Image from "next/image";
import { useNextSanityImage } from "next-sanity-image";

import clientApi from "../../libs/clientApi";
import type { SanityImageRef } from "../../libs/types";

const SanityImage = ({ asset }: { asset: SanityImageRef }) => {
	const imageProps = useNextSanityImage(clientApi, asset);

	if (!imageProps) return null;

	return (
		// No alt here: it belongs to the Portable Text block rather than to the
		// asset, and the studio does not always fill it.
		<Image {...imageProps} layout="responsive" sizes="(max-width: 800px) 100vw, 800px" />
	);
};

export default SanityImage;
