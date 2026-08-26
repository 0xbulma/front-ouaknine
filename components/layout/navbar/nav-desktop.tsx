import Link from "next/link";
import { useRouter } from "next/router";
import type { IskaCopy, NavLink } from "../../../libs/types";
import { IskaMention } from "./iska-mention";
import LanguagePicker from "./language-picker";

import classes from "./nav-desktop.module.scss";

function NavDesktop({ navlinks, iska }: { navlinks: NavLink[]; iska: IskaCopy }) {
	const { pathname } = useRouter();

	// A section stays marked while you are anywhere inside it — /expertise is
	// underlined on every field of expertise, not only on its own page.
	const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

	return (
		<nav className={classes.nav}>
			<ul className={classes.navlist}>
				{navlinks.map((link) => (
					<li key={link.url}>
						<Link href={link.url}>
							<a className={`${classes.navitem} ${isActive(link.url) ? classes.active : ""}`}>
								{link.label}
							</a>
						</Link>
					</li>
				))}
			</ul>
			<IskaMention content={iska} />
			<div className={classes.locales}>
				<LanguagePicker />
			</div>
		</nav>
	);
}

export default NavDesktop;
