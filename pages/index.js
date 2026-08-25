import Link from 'next/link';
import clientApi from '../libs/clientApi';
import RichText from '../components/ui/rich-text.jsx';
import { ChevronDoubleDownIcon } from '@heroicons/react/outline';
import scrollTo from '../libs/scrollTo';
import AnimatedScale from '../components/layout/animated-scale';

import HeadPage from '../components/head/head-page';

import classes from './Home.module.scss';

import AnimatedScaleMobile from '../components/layout/animated-scale-mobile';

export default function Home({ data }) {
  const {
    titleseo,
    descriptionseo,
    title1,
    title2,
    tag1,
    link1,
    tag2,
    link2,
    tag3,
    link3,
    sectionTitle,
    body,
  } = data;

  return (
    <div className={classes.container}>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />
      <div className={classes.upper}>
        <div className={`${classes.upperinner}`}>
          <div className={classes.titlegroup}>
            {title1 && title2 && (
              <h1>
                <span className={classes.title}>{`${title1?.trim()} `}</span>
                <span className={classes.subtitle}>{title2?.trim()}</span>
              </h1>
            )}
            <div className={classes.spegroup}>
              {tag1 && (
                <Link href={{ pathname: '/expertise', query: { _id: link1 } }}>
                  <a className={classes.spe}>{tag1?.trim()}</a>
                </Link>
              )}
              {tag2 && (
                <Link href={{ pathname: '/expertise', query: { _id: link2 } }}>
                  <a className={classes.spe}>{tag2?.trim()}</a>
                </Link>
              )}
              {tag3 && (
                <Link href={{ pathname: '/expertise', query: { _id: link3 } }}>
                  <a className={classes.spe}>{tag3?.trim()}</a>
                </Link>
              )}
            </div>
          </div>

          <div className={classes.heromark} aria-hidden='true'>
            <AnimatedScale draw />
            <AnimatedScaleMobile draw />
          </div>

          <ChevronDoubleDownIcon
            className={classes.arrow}
            onClick={() => scrollTo('homedesc')}
          />
        </div>
      </div>

      <section className={classes.bottom} id='homedesc'>
        <div className={`${classes.desc}`}>
          <div className={classes.descinner}>
            {sectionTitle && (
              <h2 className={classes.bottomtitle}>{sectionTitle?.trim()}</h2>
            )}
            {body && <RichText value={body} />}
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getStaticProps(ctx) {

  try {
    const locale = ctx?.locale;

    const content = await clientApi.fetch(
      `*[_type == "home" && language == "${locale ? locale : "en"}"]{
        titleseo,
        descriptionseo,
        title1,
        title2,
        tag1,
        "link1": link1->_id,
        tag2,
        "link2": link2->_id,
        tag3,
        "link3": link3->_id,
        sectionTitle,
        body}`
    );
    return { props: { data: content?.length && content[0] }, revalidate: 10};
  } catch (err) {
    return {
      notFound: true,
    };
  }
}
