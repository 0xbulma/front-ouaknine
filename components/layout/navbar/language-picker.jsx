import { useState, useRef, useContext } from 'react';
import useClickOutside from '../../../hooks/useClickoutside';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/outline';

import useLocale from '../../../hooks/useLocale';
import localePath from '../../../libs/localePath';
import { LocalesContextSchema } from '../../../context/locales-context';

import classes from './language-picker.module.scss';

function LanguagePicker() {
  const [state, setState] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const availableLocales = useContext(LocalesContextSchema);
  const dropdown = useRef();
  const capLocale = locale.charAt(0).toUpperCase() + locale.slice(1);

  const toggleHandler = () => {
    setState(bol => !bol);
  };


  useClickOutside(state, setState, dropdown);

  return (
    <div className={classes.container} onClick={toggleHandler} ref={dropdown}>
      <div className={classes.innercontainer}>
        <div className={classes.firstgroup}>
          <div className={classes.tag}>{capLocale}</div>
        </div>

        <ChevronDownIcon
          className={`${classes.svg} ${state && classes.svgactive}`}
        />
      </div>
      <div className={`${classes.selector} ${state && classes.selectoractive}`}>
        <Link locale='fr' href={localePath(router, 'fr', availableLocales)}>
          <a className={classes.label}>
            <CheckIcon
              className={`${classes.check} ${
                locale !== 'fr' && classes.checkinactive
              }`}
            />
            <span>Français</span>
          </a>
        </Link>

        <Link locale='en' href={localePath(router, 'en', availableLocales)}>
          <a className={classes.label}>
            <CheckIcon
              className={`${classes.check} ${
                locale !== 'en' && classes.checkinactive
              }`}
            />
            <span>English</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default LanguagePicker;
