import { createElement } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import SanityImage from './sanityImage';
import classes from './rich-text.module.scss';

// `headingLevel` collapses every heading a document carries onto one tag. The
// publications surface needs it: the guide writes h4 throughout and a press
// cutting opens on the outlet's own h2, so without it the accessibility tree
// exposes a gapped, inconsistent hierarchy under the page h1 while the stylesheet
// renders them all alike.
const headingOverrides = level =>
  level
    ? Object.fromEntries(
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(style => [
          style,
          // eslint-disable-next-line react/display-name
          ({ children }) => createElement(level, null, children),
        ])
      )
    : {};

export default function RichText({ value, headingLevel }) {
  return (
    <PortableText
      value={value}
      onMissingComponent={(message, options) => {return
      }}
      components={{
        block: {
          ...headingOverrides(headingLevel),
          // Ex. 1: customizing common block types
          normal: ({ children }) => {
            if (!children[0]) {
              return <br></br>;
            } else {
              return <p>{children}</p>;
            }
          },
          blockquote: ({ children }) => (
            <blockquote className={classes.blockquote}>{children}</blockquote>
          ),
        },
        types: {
          image: ({ value }) => {
            return (
              <div className={classes.img}>
                <SanityImage {...value} />
              </div>
            );
          },
        },
        listItem: {
          bullet: ({ children }) => (
            <li className={classes.bullet}>{children}</li>
          ),
          bullet2: ({ children }) => (
            <li className={classes.bullet2}>{children}</li>
          ),
          number:({ children }) => (
            <li>{children}</li>
          ),
        },
        marks: {
          // The guide cross-links its own episodes. Those are internal, and
          // sending a reader to a new tab to read the next one is wrong; only a
          // link that leaves the site opens away from it.
          link: ({ children, value }) => {
            const href = value?.href || '/';

            // An allowlist, not a scheme test. Treating "not http(s)" as
            // internal handed `javascript:` and `data:` URLs straight to an
            // anchor, and link marks are authored in the CMS.
            const isInternal =
              (href.startsWith('/') && !href.startsWith('//')) ||
              href.startsWith('#');

            if (isInternal) {
              return (
                <Link href={href}>
                  <a className={classes.link}>{children}</a>
                </Link>
              );
            }

            if (!/^(https?|mailto|tel):/i.test(href)) return <>{children}</>;

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
