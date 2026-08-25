import classes from './contact.module.scss';
import Form from '../components/ui/form/form';

import { useRef, useState } from 'react';
import RichText from '../components/ui/rich-text';
import contactContent from '../content/contactContent.json';

import useLocale from '../hooks/useLocale';
import clientApi from '../libs/clientApi';
import HeadPage from '../components/head/head-page';
import footerContent from '../content/footerContent.json';

import { useInView } from 'react-intersection-observer';

import Button from '../components/ui/button';
import { PhoneIcon, LocationMarkerIcon } from '@heroicons/react/solid';

import PageTitle from '../components/layout/page-title';
import useOffset from '../hooks/useOffset';

import AnimatedScale from '../components/layout/animated-scale-center';

function Contact({ data }) {
  const {
    titleseo,
    descriptionseo,
    title,
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

      <PageTitle title={title ? title : ''} />
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
                    <LocationMarkerIcon className={classes.phone} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.rightblock}>
            <address className={classes.addressblock}>
              {footerContent[locale].address}
            </address>
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
