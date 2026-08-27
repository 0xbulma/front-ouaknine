import Link from "next/link";
import { useContext } from "react";

import { NavContextSchema } from "../../../context/nav-context";
import type { IskaCopy, NavLink } from "../../../libs/types";
import { IskaMentionMobile } from "./iska-mention";
import LanguagePickerMobile from "./language-picker-mobile";

import classes from "./nav-mobile.module.scss";

function NavMobile({ navlinks, iska }: { navlinks: NavLink[]; iska: IskaCopy }) {
	const { isOn, toggleNav } = useContext(NavContextSchema);

	return (
		<nav className={`${classes.nav} ${isOn ? classes.visible : ""}`}>
			<ul className={`${classes.navlist} ${isOn ? classes.listvisible : ""}`}>
				{navlinks.map((link) => (
					<li key={link.url} className={classes.navitem}>
						<Link href={link.url} className={classes.link} onClick={toggleNav}>
							{link.label}
						</Link>
						<div className={classes.separator} />
					</li>
				))}
				<li className={classes.navitem}>
					<IskaMentionMobile content={iska} onClick={toggleNav} />
				</li>
				<li className={`${classes.navitem} ${classes.langblock}`}>
					<LanguagePickerMobile onClick={toggleNav} />
				</li>
			</ul>
		</nav>
	);
}

export default NavMobile;
