import { useContext } from "react";

import CONTENT from "../../../content/headerContent.json";
import { NavContextSchema } from "../../../context/nav-context";
import useLocale from "../../../hooks/useLocale";
import classes from "./nav-mobile-button.module.scss";

function NavMobileButton() {
	const { isOn, toggleNav } = useContext(NavContextSchema);
	const locale = useLocale();

	return (
		// `aria-expanded` rather than a label that flips between open and close:
		// the label names the control, the state says whether it is open, and a
		// screen reader announces both. A fixed "Open the navigation menu" was
		// wrong in one of the two states as well as English on the French site.
		<button
			type="button"
			className={classes.hamburger}
			onClick={toggleNav}
			aria-label={CONTENT[locale].navAria}
			// `isOn` starts null so the burger animation only runs on a change;
			// collapsed is the right thing to announce for that first state.
			aria-expanded={Boolean(isOn)}
		>
			<span
				className={`${classes.line} ${classes["line--top"]} ${isOn ? classes.rotatetop : ""}`}
			/>
			<span
				className={`${classes.line} ${classes["line--middle"]} ${isOn ? classes.rotatemiddle : ""}`}
			/>
			<span
				className={`${classes.line} ${classes["line--bottom"]} ${isOn ? classes.rotatebottom : ""}`}
			/>
		</button>
	);
}

export default NavMobileButton;
