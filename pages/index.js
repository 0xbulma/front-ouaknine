import Link from 'next/link';
import Image from 'next/image';
import clientApi from '../libs/clientApi';
import RichText from '../components/ui/rich-text.jsx';
import AnimatedScale from '../components/layout/animated-scale';

import HeadPage from '../components/head/head-page';

import classes from './Home.module.scss';

import AnimatedScaleMobile from '../components/layout/animated-scale-mobile';
import portrait from '../public/images/_50A7988_1.jpeg';

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

  const tags = [
    { label: tag1, link: link1 },
    { label: tag2, link: link2 },
    { label: tag3, link: link3 },
  ].filter(t => t.label);

  return (
    <div className={classes.container}>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />
      <div className={classes.upper}>
        <div className={`${classes.upperinner}`}>
          <div className={classes.titlegroup}>
            {title2 && <p className={classes.subtitle}>{title2?.trim()}</p>}
            {title1 && (
              <h1 className={classes.title}>{title1?.trim()}</h1>
            )}
          </div>

          <ul className={classes.spegroup}>
            {tags.map((tag, i) => (
              <li key={tag.link ? tag.link : tag.label}>
                <Link href={{ pathname: '/expertise', query: { _id: tag.link } }}>
                  <a className={classes.spe}>
                    <span className={classes.speindex}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={classes.spelabel}>{tag.label?.trim()}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>

          <div className={classes.heromark} aria-hidden='true'>
            <AnimatedScale draw />
            <AnimatedScaleMobile draw />
          </div>
        </div>
      </div>

      <section className={classes.bottom} id='homedesc'>
        <div className={classes.portrait}>
          <Image
            src={portrait}
            alt={
              title1 && title2
                ? `${title1.trim()} — ${title2.trim()}`
                : 'Alice Ouaknine'
            }
            layout='responsive'
            sizes='(min-width: 992px) 34vw, 78vw'
            placeholder='blur'
            quality={72}
          />
        </div>
        <div className={`${classes.desc}`}>
          <div className={classes.descinner}>
            <span className={classes.sectionindex}>01</span>
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
