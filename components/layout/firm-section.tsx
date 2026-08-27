import Image from "next/image";
import { createElement } from "react";
import type { PortableText } from "../../libs/types";
import portrait from "../../public/images/alice-portrait-illustration.png";
import type { HeadingLevel } from "../ui/rich-text";
import RichText from "../ui/rich-text";

import classes from "./firm-section.module.scss";

// The firm block: the ink portrait beside the practice description. It closes
// the home page and is the whole of /about, where it carries the page heading.
function FirmSection({
	sectionTitle,
	body,
	imageAlt,
	headingLevel = "h2",
	priority = false,
}: {
	sectionTitle?: string;
	body?: PortableText;
	imageAlt?: string;
	headingLevel?: HeadingLevel;
	priority?: boolean;
}) {
	return (
		<section className={classes.bottom} id="homedesc">
			<div className={classes.portrait}>
				<Image
					src={portrait}
					alt={imageAlt ?? "Alice Ouaknine"}
					style={{ width: "100%", height: "auto" }}
					sizes="(min-width: 992px) 34vw, 78vw"
					placeholder="blur"
					quality={72}
					priority={priority}
				/>
			</div>
			<div className={classes.desc}>
				<div className={classes.descinner}>
					{sectionTitle
						? createElement(headingLevel, { className: classes.bottomtitle }, sectionTitle.trim())
						: null}
					{body ? <RichText value={body} /> : null}
				</div>
			</div>
		</section>
	);
}

export default FirmSection;
