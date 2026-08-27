import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaGooglePlusSquare, FaLinkedin } from "react-icons/fa";
import CONTENT from "../../../content/footerContent.json";
import useLocale from "../../../hooks/useLocale";
import LogoSquare from "../../../public/images/logosquare.svg";

import classes from "./main-footer.module.scss";

const LINKEDIN_URL = "https://fr.linkedin.com/in/alice-ouaknine-23a4186b";
const STUDIO_URL = "https://cabinet-ouaknine.sanity.studio/desk";

function MainFooter() {
	const locale = useLocale();
	const { pathname } = useRouter();

	const underPinnedIndex = pathname.startsWith("/expertise");

	return (
		<footer className={`${classes.footer} ${underPinnedIndex ? classes.footerbare : ""}`}>
			<div className={classes.innercontainer}>
				<div className={classes.logo}>
					<Image src={LogoSquare} alt="logo" width={70} height={38.73} />
				</div>

				<div className={classes.links}>
					<Link href="/" className={classes.link}>
						{CONTENT[locale].link1}
					</Link>
					<Link href="/about" className={classes.link}>
						{CONTENT[locale].link4}
					</Link>
					<Link href="/legal" className={classes.link}>
						{CONTENT[locale].link2}
					</Link>
					<a
						href={STUDIO_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="Administration console"
						className={classes.link}
					>
						{CONTENT[locale].link3}
					</a>
				</div>

				<p className={classes.address}>{CONTENT[locale].address}</p>

				<div className={classes.social}>
					<a
						href={LINKEDIN_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="Open LinkedIn Alice Ouaknine"
					>
						<FaLinkedin className={classes.socialicon} />
					</a>
					<a
						href={CONTENT.mapsUrl}
						target="_blank"
						rel="noreferrer"
						aria-label="Open Google Alice Ouaknine"
					>
						<FaGooglePlusSquare className={classes.socialicon} />
					</a>
				</div>
				<div className={classes.credit} />
			</div>
		</footer>
	);
}

export default MainFooter;
