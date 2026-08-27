import { useContext, useState } from "react";
import CONTENT from "../../content/cookieContent.json";
import { CookieContextSchema } from "../../context/cookie-context";
import useLocale from "../../hooks/useLocale";
import useTimeout from "../../hooks/useTimout";
import Button from "../ui/button";
import classes from "./cookie.module.scss";

function Cookie() {
	const { acceptCookie, denyCookie } = useContext(CookieContextSchema);

	const [isReady, setIsReady] = useState(false);
	useTimeout(() => setIsReady(true), 600);

	const locale = useLocale();

	return (
		<div className={`${classes.container} ${isReady ? classes.show : ""}`}>
			<div className={classes.right}>
				<div>
					<h3 className={classes.title}>{CONTENT[locale].title}</h3>
					<p className={classes.desc}>{CONTENT[locale].body}</p>
				</div>

				<div className={classes.btngroup}>
					<Button onClick={acceptCookie}>
						<span>{CONTENT[locale].accept}</span>
					</Button>
					<Button onClick={denyCookie}>
						<span>{CONTENT[locale].decline}</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

export default Cookie;
