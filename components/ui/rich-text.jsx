import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import SanityImage from './sanityImage';
import classes from './rich-text.module.scss';

export default function RichText({ value }) {
  return (
    <PortableText
      value={value}
      onMissingComponent={(message, options) => {return
      }}
      components={{
        block: {
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
            const isExternal = /^https?:\/\//i.test(href);

            if (!isExternal) {
              return (
                <Link href={href}>
                  <a className={classes.link}>{children}</a>
                </Link>
              );
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
