import { createElement } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlockComponent } from '@portabletext/react';

import { internalPath, isSafeExternal } from '../../libs/href';
import type { PortableText as PortableTextValue, SanityImageRef } from '../../libs/types';
import SanityImage from './sanityImage';
import classes from './rich-text.module.scss';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

// `headingLevel` collapses every heading a document carries onto one tag. The
// publications surface needs it: the guide writes h4 throughout and a press
// cutting opens on the outlet's own h2, so without it the accessibility tree
// exposes a gapped, inconsistent hierarchy under the page h1 while the stylesheet
// renders them all alike.
const headingOverrides = (
  level: HeadingLevel | undefined
): Record<string, PortableTextBlockComponent> => {
  if (!level) return {};

  const Heading = ({ children }: { children?: ReactNode }) =>
    createElement(level, null, children);

  return { h1: Heading, h2: Heading, h3: Heading, h4: Heading, h5: Heading, h6: Heading };
};

export default function RichText({
  value,
  headingLevel,
}: {
  value: PortableTextValue | null | undefined;
  headingLevel?: HeadingLevel;
}) {
  if (!value) return null;

  return (
    <PortableText
      value={value}
      // The default handler warns in the console for every block style the
      // studio grows that this renderer has no component for; there is nothing
      // useful to do about it at render time.
      onMissingComponent={false}
      components={{
        block: {
          ...headingOverrides(headingLevel),
          // Ex. 1: customizing common block types
          normal: ({ children }) => {
            const nodes = Array.isArray(children) ? children : [children];
            return nodes[0] ? <p>{children}</p> : <br />;
          },
          blockquote: ({ children }) => (
            <blockquote className={classes.blockquote}>{children}</blockquote>
          ),
        },
        types: {
          image: ({ value: image }: { value: { asset?: SanityImageRef } }) =>
            image.asset ? (
              <div className={classes.img}>
                <SanityImage asset={image.asset} />
              </div>
            ) : null,
        },
        listItem: {
          bullet: ({ children }) => <li className={classes.bullet}>{children}</li>,
          bullet2: ({ children }) => <li className={classes.bullet2}>{children}</li>,
          number: ({ children }) => <li>{children}</li>,
        },
        marks: {
          // The guide cross-links its own episodes. Those are internal, and
          // sending a reader to a new tab to read the next one is wrong; only a
          // link that leaves the site opens away from it.
          link: ({ children, value: mark }) => {
            const href = mark?.href || '/';
            const internal = internalPath(href);

            if (internal) {
              return (
                <Link href={internal}>
                  <a className={classes.link}>{children}</a>
                </Link>
              );
            }

            if (!isSafeExternal(href)) return <>{children}</>;

            return (
              <a
                className={classes.link}
                href={href}
                rel='noreferrer noopener'
                target='_blank'
              >
                {children}
              </a>
            );
          },
        },
      }}
    />
  );
}
