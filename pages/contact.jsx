import classes from './contact.module.scss';

import RichText from '../components/ui/rich-text';
import contactContent from '../content/contactContent.json';

import useLocale from '../hooks/useLocale';
import clientApi from '../libs/clientApi';
import HeadPage from '../components/head/head-page';
import footerContent from '../content/footerContent.json';

import PageTitle from '../components/layout/page-title';

const MAPS_URL =
  'https://www.google.com/maps/place/Ouaknine+Alice+Avocat/@48.876648,2.3255411,14.2z/data=!4m5!3m4!1s0x0:0x51a276d4dfa05806!8m2!3d48.8775684!4d2.316890';
const TEL_HREF = 'tel:+33184162035';

function Contact({ data }) {
  const { titleseo, descriptionseo, title, titlebox, body } = data;
  const locale = useLocale();
  const [addressLine, phoneLine] = footerContent[locale].address.split('\n');
  // the stored line carries its own prefix ("Tél. : ", "Tel: "), which would
  // repeat the label above it
  const phoneNumber = phoneLine.replace(/^[^:]*:\s*/, '');
  const email = footerContent[locale].email;

  return (
    <div>
      <HeadPage title={titleseo ? titleseo : ''} description={descriptionseo ? descriptionseo : ''} />

      <PageTitle title={title ? title : ''} />

      <section className={classes.container}>
        <div className={classes.grid}>
          <div className={classes.intro}>
            {titlebox && <h2 className={classes.introtitle}>{titlebox}</h2>}
            {body && (
              <div className={classes.introbody}>
                <RichText value={body} />
              </div>
            )}
          </div>

          <dl className={classes.details}>
            <div className={classes.row}>
              <dt className={classes.rowlabel}>
                {contactContent[locale].addressLabel}
              </dt>
              <dd className={classes.rowvalue}>
                <span>{addressLine}</span>
                <a
                  className={classes.rowaction}
                  href={MAPS_URL}
                  target='_blank'
                  rel='noreferrer'
                >
                  {contactContent[locale].google}
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
        title,
        titlebox,
        body
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
