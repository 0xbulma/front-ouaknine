import Link from 'next/link';
import { useRouter } from 'next/router';
import LanguagePicker from './language-picker';
import { IskaMention } from './iska-mention';
import classes from './nav-desktop.module.scss';

function NavDesktop({ navlinks, iska }) {
  const { pathname } = useRouter();

  return (
    <nav className={classes.nav}>
      <ul className={classes.navlist}>
        {navlinks &&
          navlinks.map((link, index) => {
            return (
            <li key={index}>
              <Link href={link.url}>
                <a
                  className={`${classes.navitem} ${
                    pathname === link.url ? classes.active : ''
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            </li>)}
          )}
      </ul>
      <IskaMention content={iska} />
      <div className={classes.locales}>
        <LanguagePicker />
      </div>
    </nav>
  );
}

export default NavDesktop;
