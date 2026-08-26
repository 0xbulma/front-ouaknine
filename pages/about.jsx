import HeadPage from '../components/head/head-page';
import FirmSection from '../components/layout/firm-section';

import CONTENT from '../content/aboutContent.json';
import useLocale from '../hooks/useLocale';
import { plainText } from '../libs/expertise';
import { fetchHome } from '../libs/page-content';
import { staticPageProps } from '../libs/static-page-props.mjs';

// The firm's own page. It carries the description the home page closes with,
// as its own heading and its own URL, which is what a reader — or an agent
// checking that a business is real — looks for at /about.
function About({ data }) {
  const locale = useLocale();
  const { sectionTitle, body } = data;

  return (
    <>
      <HeadPage
        title={CONTENT[locale].titleseo}
        description={plainText(body)}
      />
      <FirmSection
        sectionTitle={sectionTitle?.trim() || CONTENT[locale].heading}
        body={body}
        headingLevel='h1'
        priority
        imageAlt={CONTENT[locale].portraitAlt}
      />
    </>
  );
}

export const getStaticProps = staticPageProps(fetchHome, '/about');

export default About;
