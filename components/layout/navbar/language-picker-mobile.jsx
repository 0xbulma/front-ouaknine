import classes from './language-picker-mobile.module.scss';
import useLocale from '../../../hooks/useLocale';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import localePath from '../../../libs/localePath';

function LanguagePickerMobile(props) {
  const locale = useLocale();
  const router = useRouter();
  const [state, setState] = useState(locale);

  const { pathname, asPath, query } = router;
  const other = locale === 'fr' ? 'en' : 'fr';

  // Every other link in the app is a next/link and prefetches itself once it
  // is on screen. This one is a toggle, and the desktop picker that points at
  // the same page is display:none at this width, so it never intersects —
  // the other language has to be asked for by hand.
  useEffect(() => {
    // router.prefetch only takes a string, unlike router.push below.
    const target = localePath(router, other);
    router.prefetch(typeof target === 'string' ? target : pathname, undefined, {
      locale: other,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath, other]);

  const toggleHandler = loc => {
    setState(l => loc);
    const target = localePath(router, loc);

    router.push(target, typeof target === 'string' ? undefined : asPath, {
      locale: loc,
    });
    props.onClick();
  };

  return (
    <div className={classes.container}>
      <div className={classes.switch}>
        <div
          className={`${classes.toggle} ${
            locale === 'en' && classes.toggleactive
          }`}
        ></div>
        <span
          className={`${classes.label} ${
            locale === 'en' && classes.labelactive
          }`}
          onClick={() => toggleHandler('fr')}
        >
          Français
        </span>
        <span
          className={`${classes.label} ${
            locale === 'fr' && classes.labelactive
          }`}
          onClick={() => toggleHandler('en')}
        >
          English
        </span>
      </div>
    </div>
  );
}

export default LanguagePickerMobile;
