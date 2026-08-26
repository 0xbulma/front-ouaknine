import { useNextSanityImage } from 'next-sanity-image';
import Image from 'next/image';

import clientApi from '../../libs/clientApi';
import type { SanityImageRef } from '../../libs/types';

const SanityImage = ({ asset }: { asset: SanityImageRef }) => {
  const imageProps = useNextSanityImage(clientApi, asset);

  if (!imageProps) return null;

  return (
    // The alt text belongs to the block, not to the asset: Portable Text keeps
    // it beside the image and the studio does not always fill it.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image {...imageProps} layout='responsive' sizes='(max-width: 800px) 100vw, 800px' />
  );
};

export default SanityImage;
