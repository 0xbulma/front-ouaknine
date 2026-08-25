import Link from 'next/link';
import Image from 'next/image';
import clientApi from '../libs/clientApi';
import RichText from '../components/ui/rich-text.jsx';

import HeadPage from '../components/head/head-page';

import classes from './Home.module.scss';

import portrait from '../public/images/alice-portrait-illustration.png';
import useLocale from '../hooks/useLocale';
import footerContent from '../content/footerContent.json';
import { expertiseSlug } from '../libs/expertise';

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

  const locale = useLocale();
  const [addressLine, phoneLine] = footerContent[locale].address.split('\n');

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
            {title2 && <p className={classes.subtitle}>{title2.trim()}</p>}
            {title1 && (
              <h1 className={classes.title}>{title1?.trim()}</h1>
            )}
          </div>

          <ul className={classes.spegroup}>
            {tags.map((tag, i) => (
              <li key={tag.link ? tag.link : tag.label}>
                <Link href={`/expertise/${expertiseSlug(tag.link)}`}>
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

          <div className={classes.herofoot}>
            <span className={classes.herofootitem}>{addressLine}</span>
            <a className={classes.herofootitem} href='tel:+33184162035'>
              {phoneLine}
            </a>
          </div>
        </div>
      </div>

      <section className={classes.bottom} id='homedesc'>
        <div className={classes.portrait}>
          <Image
            src={portrait}
            alt={
              title1 && title2
                ? `${title1.trim()} - ${title2.trim()}`
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
        "link1": link1->title,
        tag2,
        "link2": link2->title,
        tag3,
        "link3": link3->title,
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
