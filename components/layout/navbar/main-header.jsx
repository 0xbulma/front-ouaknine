import { useContext } from 'react';
import { NavContextSchema } from '../../../context/nav-context';
import NavMobile from './nav-mobile';
import NavDesktop from './nav-desktop';
import NavMobileButton from './nav-mobile-button';
import classes from './main-header.module.scss';
import navlinks from '../../../content/headerContent.json';
import useLocale from '../../../hooks/useLocale';
import { useRouter } from 'next/router';

function MainHeader() {
  const { toggleNav } = useContext(NavContextSchema);
  const locale = useLocale();
  const { pathname } = useRouter();

  return (
    <>
      <header
        className={`${classes.header} ${
          pathname.includes('/legal') ||
          pathname.includes('/iska') ||
          pathname.includes('/404')
            ? classes.border
            : ''
        }`}
      >
        <div className={classes.navcontainer}>
          <NavDesktop navlinks={navlinks[locale].nav} iska={navlinks[locale].iska} />
          <NavMobileButton />
        </div>
        <NavMobile
          navlinks={navlinks[locale].nav}
          iska={navlinks[locale].iska}
          onclick={toggleNav}
        />
      </header>
    </>
  );
}

export default MainHeader;
