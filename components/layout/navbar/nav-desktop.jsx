import Link from 'next/link';
import { useRouter } from 'next/router';
import LanguagePicker from './language-picker';
import { IskaMention } from './iska-mention';
import classes from './nav-desktop.module.scss';

function NavDesktop({ navlinks, iska }) {
  const { pathname } = useRouter();

  // A section stays marked while you are anywhere inside it — /expertise is
  // underlined on every field of expertise, not only on its own page.
  const isActive = url => pathname === url || pathname.startsWith(`${url}/`);

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
                    isActive(link.url) ? classes.active : ''
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
