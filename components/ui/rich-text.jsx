import { createElement } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import SanityImage from './sanityImage';
import classes from './rich-text.module.scss';

const SITE_HOST = 'ouaknine-avocats.com';

// Where a link actually goes, resolved rather than pattern-matched.
//
// Two reasons not to test the raw string. The CMS authors internal links as
// absolute URLs ("https://www.ouaknine-avocats.com/articles/<id>"), so a
// startsWith('/') test sends every one of the guide's own cross-links out to a
// new tab; and the URL parser strips tabs and treats a backslash as a slash, so
// "/\evil.com" reads as a path and navigates off-site.
//
// Returns a same-origin path, or null when the link leaves the site.
const internalPath = href => {
  const clean = href.replace(/[\t\n\r]/g, '');
  if (clean.startsWith('#')) return clean;

  try {
    const url = new URL(clean, 'https://internal.invalid');
    const internal =
      url.hostname === 'internal.invalid' ||
      url.hostname === SITE_HOST ||
      url.hostname.endsWith(`.${SITE_HOST}`);

    return internal ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch (err) {
    return null;
  }
};

// `headingLevel` collapses every heading a document carries onto one tag. The
// publications surface needs it: the guide writes h4 throughout and a press
// cutting opens on the outlet's own h2, so without it the accessibility tree
// exposes a gapped, inconsistent hierarchy under the page h1 while the stylesheet
// renders them all alike.
const headingOverrides = level => {
  if (!level) return {};

  const Heading = ({ children }) => createElement(level, null, children);

  return { h1: Heading, h2: Heading, h3: Heading, h4: Heading, h5: Heading, h6: Heading };
};

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
            const internal = internalPath(href);

            if (internal) {
              return (
                <Link href={internal}>
                  <a className={classes.link}>{children}</a>
                </Link>
              );
            }

            // An allowlist, not a scheme denylist: anything that is not a
            // recognised external scheme keeps its text and loses its link.
            if (!/^(https?|mailto|tel):/i.test(href.trim())) {
              return <>{children}</>;
            }

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
