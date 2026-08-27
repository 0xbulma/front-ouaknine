import Link from "next/link";
import { useContext } from "react";

import { NavContextSchema } from "../../../context/nav-context";
import type { IskaCopy, NavLink } from "../../../libs/types";
import { IskaMentionMobile } from "./iska-mention";
import LanguagePickerMobile from "./language-picker-mobile";

import classes from "./nav-mobile.module.scss";

function NavMobile({ navlinks, iska }: { navlinks: NavLink[]; iska: IskaCopy }) {
	const { isOn, toggleNav } = useContext(NavContextSchema);

	// The two trailing rows continue the stagger the nav items set up, so their
	// animation classes carry on from the last link's index.
	const trailing = navlinks.length;

	return (
		<nav className={`${classes.nav} ${isOn ? classes.visible : ""}`}>
			<ul className={`${classes.navlist} ${isOn ? classes.listvisible : ""}`}>
				{navlinks.map((link, index) => (
					<li key={link.url} className={classes.navitem}>
						<Link
							href={link.url}
							className={`${classes.link} ${classes[`animation${index}`]}`}
							onClick={toggleNav}
						>
							{link.label}
						</Link>
						<div className={`${classes.separator} ${classes[`animationsep${index}`]}`} />
					</li>
				))}
				<li className={`${classes.navitem} ${classes[`animation${trailing}`]}`}>
					<IskaMentionMobile content={iska} onClick={toggleNav} />
				</li>
				<li
					className={`${classes.navitem} ${classes.langblock} ${
						classes[`animation${trailing + 1}`]
					}`}
				>
					<LanguagePickerMobile onClick={toggleNav} />
				</li>
			</ul>
		</nav>
	);
}

export default NavMobile;
