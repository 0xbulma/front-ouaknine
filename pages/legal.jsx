import RichText from '../components/ui/rich-text';
import { fetchLegal } from '../libs/page-content';
import { staticPageProps } from '../libs/static-page-props.mjs';
import classes from './legal.module.scss';
import useLocale from '../hooks/useLocale';

import CONTENT from '../content/legalContent.json'
import HeadPage from '../components/head/head-page';

import { useContext } from 'react';
import { CookieContextSchema } from '../context/cookie-context';

function Legal({ data }) {
  const { isAccepted, toggleCookie } = useContext(CookieContextSchema);
  const locale = useLocale()

  return (
    <section className={classes.container}>
        <HeadPage title={data.titleseo} description={data.descriptionseo} />
      {data?.title && <h1>{data?.title}</h1>}
      {data?.block && <RichText value={data.block} />}


      <form className={classes.cookie}>
        <label htmlFor='cookie' className={classes.label}>{CONTENT[locale].label}</label>
        <input
          id='cookie'
          type='checkbox'
          checked={isAccepted}
          onClick={() => toggleCookie(isAccepted)}
        />
      </form>
     
    </section>
  );
}

export const getStaticProps = staticPageProps(fetchLegal, '/legal');

export default Legal;
