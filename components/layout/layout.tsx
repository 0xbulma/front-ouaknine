import { useContext } from 'react';
import type { ReactNode } from 'react';

import MainHeader from './navbar/main-header';
import MainFooter from './footer/main-footer';
import Cookie from './cookie';
import Phone from './phone';
import GaScript from './ga-script';
import SiteSchema from '../head/site-schema';

import { CookieContextSchema } from '../../context/cookie-context';
import { NavContextSchema } from '../../context/nav-context';

import classes from './layout.module.scss';

function Layout(props: { children: ReactNode }) {
  const { doNotShow, isAccepted } = useContext(CookieContextSchema);
  const { isOn } = useContext(NavContextSchema);

  return (
    <>
      <SiteSchema />
      {isAccepted && <GaScript />}
      {!doNotShow && !isOn && <Cookie />}
      {!isOn && <Phone />}
      <MainHeader />
      <main className={classes.main}>{props.children}</main>
      {!isOn && <MainFooter />}
    </>
  );
}

export default Layout;
