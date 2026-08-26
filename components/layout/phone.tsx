import { PhoneIcon } from "@heroicons/react/solid";
import footerContent from "../../content/footerContent.json";
import CONTENT from "../../content/phoneContent.json";
import useLocale from "../../hooks/useLocale";

import classes from "./phone.module.scss";

function Phone() {
	const locale = useLocale();
	return (
		<a
			className={classes.phone}
			href={`tel:${footerContent.phone}`}
			aria-label={CONTENT[locale].alt}
		>
			<PhoneIcon className={classes.svg} />
		</a>
	);
}

export default Phone;
