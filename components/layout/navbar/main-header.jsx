import { useContext, useState } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import Link from 'next/link';
import { NavContextSchema } from '../../../context/nav-context';
import NavMobile from './nav-mobile';
import NavDesktop from './nav-desktop';
import NavMobileButton from './nav-mobile-button';
import classes from './main-header.module.scss';
import navlinks from '../../../content/headerContent.json';
import useLocale from '../../../hooks/useLocale';
import { useRouter } from 'next/router';

import AnimatedLogo from './animated-logo';

function MainHeader() {
  const { isOn, toggleNav } = useContext(NavContextSchema);
  const locale = useLocale();
  const { pathname } = useRouter();

  const [isFilled, setIsFilled] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  const clickHandler = () => {
    if (pathname !== '/') {
      setTimeout(() => {
        setIsFilled(false);
        setIsAnimated(true);
      }, 100);
    } else {
      setIsFilled(false);
      setIsAnimated(true);
    }
  };

  useDebounce(
    () => {
      if (isAnimated) {
        setIsFilled(true);
        setIsAnimated(false);
      }
    },
    3200,
    [isFilled]
  );

  return (
    <>
      <header
        className={`${classes.header} ${
          pathname.includes('/legal') ||
          pathname.includes('/404')
            ? classes.border
            : ''
        }`}
      >
        <div className={classes.navcontainer}>
          <Link
            href={{
              pathname: '/',
            }}
            locale={locale}
          >
            <a
              className={classes.logocontainer}
              onClick={clickHandler}
              alt={
                'Logo image Alice Ouaknine, Droit Pénal, Criminal Law, Paris, France'
              }
              aria-label={
                'Logo image Alice Ouaknine, Droit Pénal, Criminal Law, Paris, France'
              }
            >
              <AnimatedLogo
                width={209}
                height={39.16}
                on={isAnimated}
                isFilled={isFilled}
              />
            </a>
          </Link>
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
