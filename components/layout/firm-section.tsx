import { createElement } from 'react';
import Image from 'next/image';

import RichText from '../ui/rich-text';
import type { HeadingLevel } from '../ui/rich-text';
import portrait from '../../public/images/alice-portrait-illustration.png';
import type { PortableText } from '../../libs/types';

import classes from './firm-section.module.scss';

// The firm block: the ink portrait beside the practice description. It closes
// the home page and is the whole of /about, where it carries the page heading.
function FirmSection({
  sectionTitle,
  body,
  imageAlt,
  headingLevel = 'h2',
  priority = false,
}: {
  sectionTitle?: string;
  body?: PortableText;
  imageAlt?: string;
  headingLevel?: HeadingLevel;
  priority?: boolean;
}) {
  return (
    <section className={classes.bottom} id='homedesc'>
      <div className={classes.portrait}>
        <Image
          src={portrait}
          alt={imageAlt ?? 'Alice Ouaknine'}
          layout='responsive'
          sizes='(min-width: 992px) 34vw, 78vw'
          placeholder='blur'
          quality={72}
          priority={priority}
        />
      </div>
      <div className={classes.desc}>
        <div className={classes.descinner}>
          {sectionTitle &&
            createElement(
              headingLevel,
              { className: classes.bottomtitle },
              sectionTitle.trim()
            )}
          {body && <RichText value={body} />}
        </div>
      </div>
    </section>
  );
}

export default FirmSection;
