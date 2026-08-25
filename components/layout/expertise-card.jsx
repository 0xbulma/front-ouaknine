import { useState, useEffect } from 'react';

import scrollTo from '../../libs/scrollTo';

import Link from 'next/link';
import { ArrowSmRightIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { useInView } from 'react-intersection-observer';
import RichText from '../../components/ui/rich-text';

import classes from './expertise-card.module.scss';

function ExpertiseCard({
  _id,
  query,
  title,
  description,
  titleSpe,
  right,
  linkLabel,
  index,
}) {
  const [seeMore, setSeeMore] = useState(false);

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0.3,
    triggerOnce: true,
    onChange: () => {
      if (!inView) {
        setSeeMore(false);
      }
    },
  });
  const {
    ref: ref2,
    inView: inView2,
    entry: entry2,
  } = useInView({
    /* Optional options */
    threshold: 0,
    onChange: () => {
      if (!inView2) {
        setSeeMore(false);
      }
    },
  });

  const toggleSeeMore = () => {
    setSeeMore(bol => !bol);

    if (!seeMore) {
      scrollTo(_id, 60);
    }
  };

  useEffect(() => {

    if (query._id === _id) {
      setSeeMore(true);

      if (!seeMore) {
        scrollTo(_id, 60);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const animationCSS = `animation${index}`;
  const animationSepCSS = `animationsep${index}`;

  return (
    <li
      id={_id}
      className={`${classes.spe} ${!query?._id && classes[animationCSS]}`}
    >
      {title && (
        <div className={classes.spe_titlegroup} onClick={toggleSeeMore}>
          <ChevronDownIcon
            className={`${classes.spe_chevron} ${
              seeMore && classes.spe_chevronselected
            }`}
          />
          <div className={classes.spe_titleouter}>
            <span className={classes.spe_index}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h2 className={`${classes.spe_title}`}>{title}</h2>
            <div
              className={`${classes.spe_titlebar} ${
                seeMore && classes.spe_selected
              }`}
            ></div>
          </div>
        </div>
      )}

      <div className={`${classes.spe_lower} ${seeMore && classes.spe_show}`}>
        {description && (
          <div className={`${classes.spe_description}`}>
            <RichText value={description} />
          </div>
        )}
        {right && (
          <div className={`${classes.spe_right}`}>
            {titleSpe && <h3 className={classes.spe_titlespe}>{titleSpe}</h3>}
            <RichText value={right} />
          </div>
        )}

        <div className={classes.spe_lowerbar}>
          <div className={classes.spe_linkcontainer}>
            <Link href='/contact'>
              <a className={classes.spe_link}>
                <span>{linkLabel}</span>
                <ArrowSmRightIcon className={classes.arrowlink} />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export default ExpertiseCard;
