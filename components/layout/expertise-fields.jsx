import { useEffect, useRef } from 'react';

import Link from 'next/link';
import { ArrowSmRightIcon } from '@heroicons/react/outline';

import RichText from '../ui/rich-text';

import classes from './expertise-fields.module.scss';

const pad = number => String(number).padStart(2, '0');

// Clears the sticky header, and matches the field's scroll-margin.
const READING_TOP = 96;

function ExpertiseFields({ items, label, linkLabel, current }) {
  const fieldRef = useRef(null);
  const landed = useRef(false);

  const active = items.findIndex(item => item.slug === current);
  const field = items[active >= 0 ? active : 0];

  // Every field is read from its own first line: whichever one is arrived at,
  // and however far into the last one the page had been scrolled. Not on the
  // first render, though — a page opened from a search result should start
  // where it was asked to start.
  useEffect(() => {
    if (!landed.current) {
      landed.current = true;
      return;
    }

    const top = fieldRef.current?.getBoundingClientRect().top;
    if (top === undefined || Math.abs(top - READING_TOP) < 8) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    fieldRef.current.scrollIntoView({
      block: 'start',
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [current]);

  return (
    <div className={classes.fields}>
      <div className={classes.rail}>
        <nav className={classes.railinner} aria-label={label}>
          {items.map((item, index) => {
            const slug = item.slug;
            const isActive = index === active;

            return (
              <Link key={item._id} href={`/expertise/${slug}`} scroll={false}>
                <a
                  className={classes.railitem}
                  style={{ '--i': index }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={classes.railindex}>{pad(index + 1)}</span>
                  <span className={classes.railtitle}>{item.title?.trim()}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      <article className={classes.field} ref={fieldRef}>
        <div key={field?._id} className={classes.fieldinner}>
          <p className={classes.meta}>
            <span className={classes.metainner}>
              {pad((active >= 0 ? active : 0) + 1)}
              <span className={classes.metatotal}> / {pad(items.length)}</span>
            </span>
          </p>

          <div className={classes.titlemask}>
            <h1 className={classes.title}>{field?.title?.trim()}</h1>
          </div>

          <div className={classes.rule} />

          <div className={classes.body}>
            {field?.description && (
              <div className={classes.description}>
                <RichText value={field.description} />
              </div>
            )}
            {field?.right && (
              <aside className={classes.spe}>
                {field.titleSpe && (
                  <h2 className={classes.spetitle}>{field.titleSpe}</h2>
                )}
                <div className={classes.spelist}>
                  <RichText value={field.right} />
                </div>
              </aside>
            )}
          </div>

          <Link href='/contact'>
            <a className={classes.link}>
              <span>{linkLabel}</span>
              <ArrowSmRightIcon className={classes.arrow} />
            </a>
          </Link>
        </div>
      </article>
    </div>
  );
}

export default ExpertiseFields;
