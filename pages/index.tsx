import Link from "next/link";
import HeadPage from "../components/head/head-page";
import FirmSection from "../components/layout/firm-section";
import footerContent from "../content/footerContent.json";
import useLocale from "../hooks/useLocale";
import { splitAddress } from "../libs/address";
import { expertiseSlug } from "../libs/expertise-list";
import { fetchHome } from "../libs/page-content";
import { staticPageProps } from "../libs/static-page-props";
import type { HomeDocument } from "../libs/types";

import classes from "./Home.module.scss";

export default function Home({ data }: { data: HomeDocument }) {
	const {
		titleseo,
		descriptionseo,
		title1,
		title2,
		tag1,
		link1,
		tag2,
		link2,
		tag3,
		link3,
		sectionTitle,
		body,
	} = data;

	const locale = useLocale();
	const { street: addressLine, phone: phoneLine } = splitAddress(footerContent[locale].address);

	const tags = [
		{ label: tag1, link: link1 },
		{ label: tag2, link: link2 },
		{ label: tag3, link: link3 },
	].filter((t) => t.label);

	return (
		<div className={classes.container}>
			<HeadPage title={titleseo ?? ""} description={descriptionseo ?? ""} />
			<div className={classes.upper}>
				<div className={classes.upperinner}>
					<div className={classes.titlegroup}>
						{title2 ? <p className={classes.subtitle}>{title2.trim()}</p> : null}
						{title1 ? <h1 className={classes.title}>{title1.trim()}</h1> : null}
					</div>

					<ul className={classes.spegroup}>
						{tags.map((tag, i) => (
							<li key={tag.link ?? tag.label}>
								<Link href={`/expertise/${expertiseSlug(tag.link)}`} className={classes.spe}>
									<span className={classes.speindex}>{String(i + 1).padStart(2, "0")}</span>
									<span className={classes.spelabel}>{tag.label?.trim()}</span>
								</Link>
							</li>
						))}
					</ul>

					<div className={classes.herofoot}>
						<span className={classes.herofootitem}>{addressLine}</span>
						<a className={classes.herofootitem} href={`tel:${footerContent.phone}`}>
							{phoneLine}
						</a>
					</div>
				</div>
			</div>

			<FirmSection
				sectionTitle={sectionTitle}
				body={body}
				imageAlt={title1 && title2 ? `${title1.trim()} - ${title2.trim()}` : "Alice Ouaknine"}
			/>
		</div>
	);
}

export const getStaticProps = staticPageProps(fetchHome, "/");
