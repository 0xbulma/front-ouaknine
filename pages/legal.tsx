import { useContext } from 'react';

import RichText from '../components/ui/rich-text';
import HeadPage from '../components/head/head-page';
import { fetchLegal } from '../libs/page-content';
import { staticPageProps } from '../libs/static-page-props';
import type { LegalDocument } from '../libs/types';
import useLocale from '../hooks/useLocale';
import CONTENT from '../content/legalContent.json';
import { CookieContextSchema } from '../context/cookie-context';

import classes from './legal.module.scss';

function Legal({ data }: { data: LegalDocument }) {
  const { isAccepted, toggleCookie } = useContext(CookieContextSchema);
  const locale = useLocale();

  return (
    <section className={classes.container}>
      <HeadPage title={data.titleseo ?? ''} description={data.descriptionseo ?? ''} />
      {data.title && <h1>{data.title}</h1>}
      {data.block && <RichText value={data.block} />}

      <form className={classes.cookie}>
        <label htmlFor='cookie' className={classes.label}>
          {CONTENT[locale].label}
        </label>
        <input
          id='cookie'
          type='checkbox'
          checked={Boolean(isAccepted)}
          onChange={() => toggleCookie(isAccepted)}
        />
      </form>
    </section>
  );
}

export const getStaticProps = staticPageProps(fetchLegal, '/legal');

export default Legal;
