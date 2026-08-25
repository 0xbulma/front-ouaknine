import classes from './contact.module.scss';

import contactContent from '../content/contactContent.json';

import useLocale from '../hooks/useLocale';
import clientApi from '../libs/clientApi';
import HeadPage from '../components/head/head-page';
import footerContent from '../content/footerContent.json';

import PageTitle from '../components/layout/page-title';
import Image from 'next/image';
import parisMap from '../public/images/paris-map.svg';

const MAPS_URL =
  'https://www.google.com/maps/place/Ouaknine+Alice+Avocat/@48.876648,2.3255411,14.2z/data=!4m5!3m4!1s0x0:0x51a276d4dfa05806!8m2!3d48.8775684!4d2.316890';
const TEL_HREF = 'tel:+33184162035';

function Contact({ data }) {
  const { titleseo, descriptionseo, title } = data;
  const locale = useLocale();
  const [addressLine, phoneLine] = footerContent[locale].address.split('\n');
  // the stored line carries its own prefix ("Tél. : ", "Tel: "), which would
  // repeat the label above it
  const phoneNumber = phoneLine.replace(/^[^:]*:\s*/, '');
  const email = footerContent[locale].email;
  const mobile = footerContent[locale].mobile;
  const telHref = n => `tel:${n.replace(/\(0\)/, '').replace(/[^+0-9]/g, '')}`;

  return (
    <div>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />

      <PageTitle title={title ? title : ''} />

      <section className={classes.container}>
        <div className={classes.grid}>
          <a
            className={classes.map}
            href={MAPS_URL}
            target='_blank'
            rel='noreferrer'
            tabIndex={-1}
            aria-hidden='true'
          >
            <Image src={parisMap} alt='' layout='responsive' />
          </a>

          <dl className={classes.details}>
            <div className={classes.row}>
              <dt className={classes.rowlabel}>
                {contactContent[locale].addressLabel}
              </dt>
              <dd className={classes.rowvalue}>
                <a
                  className={classes.rowlink}
                  href={MAPS_URL}
                  target='_blank'
                  rel='noreferrer'
                >
                  {addressLine}
                </a>
              </dd>
            </div>

            <div className={classes.row}>
              <dt className={classes.rowlabel}>
                {contactContent[locale].phoneLabel}
              </dt>
              <dd className={classes.rowvalue}>
              <a className={classes.rowlink} href={TEL_HREF}>
                {phoneNumber}
              </a>
              </dd>
            </div>

            {mobile && (
              <div className={classes.row}>
                <dt className={classes.rowlabel}>
                  {contactContent[locale].mobileLabel}
                </dt>
                <dd className={classes.rowvalue}>
                  <a className={classes.rowlink} href={telHref(mobile)}>
                    {mobile}
                  </a>
                </dd>
              </div>
            )}

            <div className={classes.row}>
              <dt className={classes.rowlabel}>
                {contactContent[locale].emailLabel}
              </dt>
              <dd className={classes.rowvalue}>
              <a className={classes.rowlink} href={`mailto:${email}`}>
                {email}
              </a>
              </dd>
            </div>
          </dl>
        </div>
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
        title
      }`
    );
    return { props: { data: content?.length && content[0] }, revalidate: 10  };
  } catch (err) {
    return {
      notFound: true,
    };
  }
}

export default Contact;
