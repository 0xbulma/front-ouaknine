import MainHeader from './navbar/main-header';
import MainFooter from './footer/main-footer';
import Cookie from './cookie';
import Phone from './phone';
import GaScript from './ga-script';
import SiteSchema from '../head/site-schema';

import classes from './layout.module.scss';

import { useContext } from 'react';
import { CookieContextSchema } from '../../context/cookie-context';
import { NavContextSchema } from '../../context/nav-context';

function Layout(props) {
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
