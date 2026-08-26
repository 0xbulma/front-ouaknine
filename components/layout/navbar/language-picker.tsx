import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { LocalesContextSchema } from "../../../context/locales-context";
import useClickOutside from "../../../hooks/useClickoutside";
import useLocale from "../../../hooks/useLocale";
import localePath from "../../../libs/localePath";

import classes from "./language-picker.module.scss";

function LanguagePicker() {
	const [state, setState] = useState(false);
	const locale = useLocale();
	const router = useRouter();
	const availableLocales = useContext(LocalesContextSchema);
	const dropdown = useRef<HTMLDivElement>(null);
	const capLocale = locale.charAt(0).toUpperCase() + locale.slice(1);

	const toggleHandler = () => {
		setState((bol) => !bol);
	};

	useClickOutside(state, setState, dropdown);

	// Next keeps this component mounted across a client-side navigation, so the
	// panel would stay open behind the page you just switched to. Closing on the
	// path rather than on each link's onClick also covers the browser back button,
	// and keeps the anchors free of handlers they do not need.
	useEffect(() => setState(false), [router.asPath]);

	return (
		// The handler is on the trigger, not on this container: a <div onClick> is
		// invisible to the keyboard, and this is the only language control at this
		// width. The container keeps the ref, because the click-outside check has
		// to cover the open panel as well as the trigger.
		<div className={classes.container} ref={dropdown}>
			<button
				type="button"
				className={classes.innercontainer}
				onClick={toggleHandler}
				aria-expanded={state}
			>
				<span className={classes.firstgroup}>
					<span className={classes.tag}>{capLocale}</span>
				</span>

				<ChevronDownIcon className={`${classes.svg} ${state ? classes.svgactive : ""}`} />
			</button>
			<div className={`${classes.selector} ${state ? classes.selectoractive : ""}`}>
				<Link locale="fr" href={localePath(router, "fr", availableLocales)}>
					<a className={classes.label}>
						<CheckIcon
							className={`${classes.check} ${locale !== "fr" ? classes.checkinactive : ""}`}
						/>
						<span>Français</span>
					</a>
				</Link>

				<Link locale="en" href={localePath(router, "en", availableLocales)}>
					<a className={classes.label}>
						<CheckIcon
							className={`${classes.check} ${locale !== "en" ? classes.checkinactive : ""}`}
						/>
						<span>English</span>
					</a>
				</Link>
			</div>
		</div>
	);
}

export default LanguagePicker;
