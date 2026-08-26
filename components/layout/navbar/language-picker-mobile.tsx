import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { LocalesContextSchema } from "../../../context/locales-context";
import useLocale from "../../../hooks/useLocale";
import localePath from "../../../libs/localePath";
import type { Locale } from "../../../libs/types";

import classes from "./language-picker-mobile.module.scss";

function LanguagePickerMobile({ onClick }: { onClick: () => void }) {
	const locale = useLocale();
	const router = useRouter();
	const availableLocales = useContext(LocalesContextSchema);

	const { pathname, asPath } = router;
	const other: Locale = locale === "fr" ? "en" : "fr";

	// Every other link in the app is a next/link and prefetches itself once it
	// is on screen. This one is a toggle, and the desktop picker that points at
	// the same page is display:none at this width, so it never intersects —
	// the other language has to be asked for by hand.
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the destination, not on `router` or the context, which are new references on every render and would re-prefetch on each one.
	useEffect(() => {
		// router.prefetch only takes a string, unlike router.push below.
		const target = localePath(router, other, availableLocales);
		router.prefetch(typeof target === "string" ? target : pathname, undefined, {
			locale: other,
		});
	}, [asPath, other]);

	const toggleHandler = (loc: Locale) => {
		const target = localePath(router, loc, availableLocales);

		router.push(target, typeof target === "string" ? undefined : asPath, {
			locale: loc,
		});
		onClick();
	};

	return (
		<div className={classes.container}>
			<div className={classes.switch}>
				<div className={`${classes.toggle} ${locale === "en" ? classes.toggleactive : ""}`} />
				{/* Buttons, not spans: this is the only way to change language at this
            width, and on a <span onClick> the keyboard cannot reach it. */}
				<button
					type="button"
					className={`${classes.label} ${locale === "en" ? classes.labelactive : ""}`}
					aria-pressed={locale === "fr"}
					onClick={() => toggleHandler("fr")}
				>
					Français
				</button>
				<button
					type="button"
					className={`${classes.label} ${locale === "fr" ? classes.labelactive : ""}`}
					aria-pressed={locale === "en"}
					onClick={() => toggleHandler("en")}
				>
					English
				</button>
			</div>
		</div>
	);
}

export default LanguagePickerMobile;
