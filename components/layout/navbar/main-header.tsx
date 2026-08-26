import { useRouter } from "next/router";
import navlinks from "../../../content/headerContent.json";
import useLocale from "../../../hooks/useLocale";
import classes from "./main-header.module.scss";
import NavDesktop from "./nav-desktop";
import NavMobile from "./nav-mobile";
import NavMobileButton from "./nav-mobile-button";

function MainHeader() {
	const locale = useLocale();
	const { pathname } = useRouter();

	return (
		<header
			className={`${classes.header} ${
				pathname.includes("/legal") || pathname.includes("/404") ? classes.border : ""
			}`}
		>
			<div className={classes.navcontainer}>
				<NavDesktop navlinks={navlinks[locale].nav} iska={navlinks[locale].iska} />
				<NavMobileButton />
			</div>
			<NavMobile navlinks={navlinks[locale].nav} iska={navlinks[locale].iska} />
		</header>
	);
}

export default MainHeader;
