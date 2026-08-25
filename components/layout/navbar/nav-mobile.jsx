import { useContext } from 'react';
import Link from 'next/link';
import { NavContextSchema } from '../../../context/nav-context';
import LanguagePickerMobile from './language-picker-mobile';
import { IskaMentionMobile } from './iska-mention';

import classes from './nav-mobile.module.scss';

function NavMobile({ navlinks, iska }) {
  const { isOn, toggleNav } = useContext(NavContextSchema);
  let i = 0;

  return (
    <nav className={`${classes.nav} ${isOn && classes.visible}`}>
      <ul className={`${classes.navlist} ${isOn && classes.listvisible}`}>
        {navlinks &&
          navlinks.map((link, index) => {
            const animationCSS = `animation${index}`;
            const animationSepCSS = `animationsep${index}`;
            ++i;
            return (
              <li key={index} className={`${classes.navitem}`}>
        
                <Link href={link.url}>
                  <a
                    className={`${classes.link} ${classes[animationCSS]}`}
                    onClick={toggleNav}
                  >
                    {link.label}
                  </a>
                </Link>
                <div
                  className={`${classes.separator} ${classes[animationSepCSS]}`}
                ></div>
              </li>
            );
          })}
        <li className={`${classes.navitem} ${classes[`animation${i}`]}`}>
          <IskaMentionMobile content={iska} onClick={toggleNav} />
        </li>
        <li
          className={`${classes.navitem} ${classes.langblock} ${classes[`animation${i + 1}`]}`}
        >
          <LanguagePickerMobile onClick={toggleNav}/>
        </li>
      </ul>
    </nav>
  );
}

export default NavMobile;
