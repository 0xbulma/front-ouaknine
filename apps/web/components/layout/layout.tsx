import type { ReactNode } from "react";
import { useContext } from "react";
import { CookieContextSchema } from "../../context/cookie-context";
import { NavContextSchema } from "../../context/nav-context";
import SiteSchema from "../head/site-schema";
import Cookie from "./cookie";
import MainFooter from "./footer/main-footer";
import GaScript from "./ga-script";
import classes from "./layout.module.scss";
import MainHeader from "./navbar/main-header";
import Phone from "./phone";

function Layout(props: { children: ReactNode }) {
	const { doNotShow, isAccepted } = useContext(CookieContextSchema);
	const { isOn } = useContext(NavContextSchema);

	return (
		<>
			<SiteSchema />
			{isAccepted ? <GaScript /> : null}
			{!doNotShow && !isOn && <Cookie />}
			{!isOn && <Phone />}
			<MainHeader />
			<main className={classes.main}>{props.children}</main>
			{!isOn && <MainFooter />}
		</>
	);
}

export default Layout;
