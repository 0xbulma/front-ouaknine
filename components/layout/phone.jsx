import { PhoneIcon } from '@heroicons/react/solid';
import classes from './phone.module.scss';
import useLocale from '../../hooks/useLocale';

import CONTENT from '../../content/phoneContent.json'

function Phone() {
  const locale = useLocale();
  return (
    <a className={classes.phone} href='tel:+33184162035' alt={CONTENT[locale].alt} aria-label={CONTENT[locale].alt}>
      <PhoneIcon className={classes.svg} />
    </a>
  );
}

export default Phone;
