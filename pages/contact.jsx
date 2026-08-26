import classes from './contact.module.scss';

import contactContent from '../content/contactContent.json';

import useLocale from '../hooks/useLocale';
import clientApi from '../libs/clientApi';
import HeadPage from '../components/head/head-page';
import footerContent from '../content/footerContent.json';

import PageTitle from '../components/layout/page-title';
import Image from 'next/image';
import parisMap from '../public/images/paris-map.svg';


function Contact({ data }) {
  const { titleseo, descriptionseo, title } = data;
  const locale = useLocale();
  const [addressLine, phoneLine] = footerContent[locale].address.split('\n');
  // the stored line carries its own prefix ("Tél. : ", "Tel: "), which would
  // repeat the label above it
  const phoneNumber = phoneLine.replace(/^[^:]*:\s*/, '');
  const email = footerContent[locale].email;
  const mobile = footerContent[locale].mobile;

  return (
    <div>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />

      <PageTitle title={title ? title : ''} />

      <section className={classes.container}>
        <div className={classes.grid}>
          <a
            className={classes.map}
            href={footerContent.mapsUrl}
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
                  href={footerContent.mapsUrl}
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
              <a className={classes.rowlink} href={`tel:${footerContent.phone}`}>
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
                  <a className={classes.rowlink} href={`tel:${footerContent.mobilePhone}`}>
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
