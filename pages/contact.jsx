import classes from './contact.module.scss';
import Form from '../components/ui/form/form';

import { useRef, useState } from 'react';
import RichText from '../components/ui/rich-text';
import contactContent from '../content/contactContent.json';

import useLocale from '../hooks/useLocale';
import clientApi from '../libs/clientApi';
import Image from 'next/image';
import mapImage from '../public/images/maptrans.svg';
import googlePin from '../public/images/googlemaps_icon.svg';
import HeadPage from '../components/head/head-page';

import { useInView } from 'react-intersection-observer';

import Button from '../components/ui/button';
import { PhoneIcon } from '@heroicons/react/solid';

import PageTitle from '../components/layout/page-title';
import useOffset from '../hooks/useOffset';

import AnimatedScale from '../components/layout/animated-scale-center';

function Contact({ data }) {
  const {
    titleseo,
    descriptionseo,
    title,
    subtitle,
    white,
    imageTitleUrl,
    imageTitleAlt,
    imgRatioTitle,
    lqipTitle,
    titlebox,
    titleform,
    body,
    subform,
  } = data;
  const locale = useLocale();

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0.5,
    triggerOnce: true,
  });

  const scaleRef = useRef();
  const [percentView, setPercentView] = useState(1);

  useOffset(percentView, setPercentView, scaleRef, -200, 1.5)

  return (
    <div>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />

      <PageTitle
        title={title ? title : ''}
        subtitle={subtitle ? subtitle : ''}
        btn={false}
        imgUrl={imageTitleUrl ? `${imageTitleUrl}?w=1600` : null}
        imgAlt={imageTitleAlt ? imageTitleAlt : 'Background image'}
        imgRatio={imgRatioTitle ? imgRatioTitle : 1}
        imgLqip={lqipTitle ? lqipTitle : null}
        white={white ? white : false}
        position={'top'}
      />
      <section className={classes.container}>
        <div className={classes.grid}>
          <div className={classes.leftblock}>
            <div className={classes.leftblockinner}>
              <div className={classes.subtitleblock}>
                <h2 className={`h2 ${classes.subtitle}`}>
                  {titlebox ? titlebox : ''}
                </h2>
                {body && <RichText value={body} />}
              </div>

              <div className={classes.btngroup}>
                <Button href='tel:+33184162035' target='_self'>
                  <span>{contactContent[locale].call}</span>
                  <PhoneIcon className={classes.phone} />
                </Button>

                <div className={classes.googlemap}>
                  <Button
                    href='https://www.google.com/maps/place/Ouaknine+Alice+Avocat/@48.876648,2.3255411,14.2z/data=!4m5!3m4!1s0x0:0x51a276d4dfa05806!8m2!3d48.8775684!4d2.316890'
                    target='_blank'
                  >
                    <span>{contactContent[locale].google}</span>
                    <Image
                      src={googlePin}
                      width={5.12 * 3}
                      height={7.34 * 3}
                      alt={googlePin}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.rightblock}>
            <a
              href='https://www.google.com/maps/place/Ouaknine+Alice+Avocat/@48.876648,2.3255411,14.2z/data=!4m5!3m4!1s0x0:0x51a276d4dfa05806!8m2!3d48.8775684!4d2.316890'
              target='_blank'
              rel='noreferrer'
            >
              <Image
                src={mapImage}
                alt='Map'
                width={680.72}
                height={540.14}
                //objectFit={'cover'}
              />
            </a>
          </div>
        </div>
      </section>

      <div className={classes.separator} ref={ref} id='section2'>
            <div ref={scaleRef}>
            <AnimatedScale animate={inView} percentView={percentView}/>
            </div>
            
      </div>
      <section className={classes.container}>
        <Form titleform={titleform && titleform} subform={subform && subform} />
      </section>
    </div>
  );
}

export async function getStaticProps(ctx) {
  const locale = ctx.locale;

  try {
    const content = await clientApi.fetch(
      `*[_type == "contact" && language == "${locale}"]{
        titleseo,
        descriptionseo,
        title,
        subtitle,
        white,
        "imageTitleUrl": imageTitle.asset->url,
        "imageTitleAlt" : imageTitle.alt,
        "imgRatioTitle" : imageTitle.asset->metadata.dimensions.aspectRatio,
        "lqipTitle": imageTitle.asset->metadata.lqip,
        titlebox,
        titleform,
        body,
        subform
      }`
    );
    return { props: { data: content?.length && content[0] }, revalidate: 10  };
  } catch (err) {
    return {
      notFound: true,
    }
  }
}

export default Contact;
