import { useRouter } from 'next/router';

import NavMobile from './nav-mobile';
import NavDesktop from './nav-desktop';
import NavMobileButton from './nav-mobile-button';
import useLocale from '../../../hooks/useLocale';
import navlinks from '../../../content/headerContent.json';

import classes from './main-header.module.scss';

function MainHeader() {
  const locale = useLocale();
  const { pathname } = useRouter();

  return (
    <header
      className={`${classes.header} ${
        pathname.includes('/legal') || pathname.includes('/404') ? classes.border : ''
      }`}
    >
      <div className={classes.navcontainer}>
        <NavDesktop navlinks={navlinks[locale].nav} iska={navlinks[locale].iska} />
        <NavMobileButton />
      </div>
      <NavMobile navlinks={navlinks[locale].nav} iska={navlinks[locale].iska} />
    </header>
  );
}

export default MainHeader;
