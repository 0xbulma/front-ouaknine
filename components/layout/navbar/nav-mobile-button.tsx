import { useContext } from 'react';

import { NavContextSchema } from '../../../context/nav-context';
import classes from './nav-mobile-button.module.scss';

function NavMobileButton() {
  const { isOn, toggleNav } = useContext(NavContextSchema);

  return (
    <button
      className={classes.hamburger}
      onClick={toggleNav}
      aria-label='Open the navigation menu'
    >
      <span
        className={`${classes.line} ${classes['line--top']} ${
          isOn ? classes.rotatetop : ''
        }`}
      />
      <span
        className={`${classes.line} ${classes['line--middle']} ${
          isOn ? classes.rotatemiddle : ''
        }`}
      />
      <span
        className={`${classes.line} ${classes['line--bottom']} ${
          isOn ? classes.rotatebottom : ''
        }`}
      />
    </button>
  );
}

export default NavMobileButton;
