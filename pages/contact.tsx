import Image from "next/image";
import HeadPage from "../components/head/head-page";
import PageTitle from "../components/layout/page-title";
import contactContent from "../content/contactContent.json";
import footerContent from "../content/footerContent.json";
import useLocale from "../hooks/useLocale";
import { splitAddress } from "../libs/address";
import { fetchContact } from "../libs/page-content";
import { staticPageProps } from "../libs/static-page-props";
import type { ContactDocument } from "../libs/types";
import parisMap from "../public/images/paris-map.svg";

import classes from "./contact.module.scss";

function Contact({ data }: { data: ContactDocument }) {
	const { titleseo, descriptionseo, title } = data;
	const locale = useLocale();
	// The stored line carries its own prefix ("Tél. : ", "Tel: "), which would
	// repeat the label above it; splitAddress strips it, and the markdown
	// representation of this page derives the same two values the same way.
	const { street: addressLine, phone: phoneNumber } = splitAddress(footerContent[locale].address);
	const email = footerContent[locale].email;
	const mobile = footerContent[locale].mobile;

	return (
		<div>
			<HeadPage title={titleseo ?? ""} description={descriptionseo ?? ""} />

			<PageTitle title={title ?? ""} />

			<section className={classes.container}>
				<div className={classes.grid}>
					{/* biome-ignore lint/a11y/useAnchorContent: decorative and aria-hidden, with tabIndex -1. The labelled link to the same map is the address below. */}
					<a
						className={classes.map}
						href={footerContent.mapsUrl}
						target="_blank"
						rel="noreferrer"
						tabIndex={-1}
						aria-hidden="true"
					>
						<Image src={parisMap} alt="" priority style={{ width: "100%", height: "auto" }} />
					</a>

					<dl className={classes.details}>
						<div className={classes.row}>
							<dt className={classes.rowlabel}>{contactContent[locale].addressLabel}</dt>
							<dd className={classes.rowvalue}>
								<a
									className={classes.rowlink}
									href={footerContent.mapsUrl}
									target="_blank"
									rel="noreferrer"
								>
									{addressLine}
								</a>
							</dd>
						</div>

						<div className={classes.row}>
							<dt className={classes.rowlabel}>{contactContent[locale].phoneLabel}</dt>
							<dd className={classes.rowvalue}>
								<a className={classes.rowlink} href={`tel:${footerContent.phone}`}>
									{phoneNumber}
								</a>
							</dd>
						</div>

						{mobile ? (
							<div className={classes.row}>
								<dt className={classes.rowlabel}>{contactContent[locale].mobileLabel}</dt>
								<dd className={classes.rowvalue}>
									<a className={classes.rowlink} href={`tel:${footerContent.mobilePhone}`}>
										{mobile}
									</a>
								</dd>
							</div>
						) : null}

						<div className={classes.row}>
							<dt className={classes.rowlabel}>{contactContent[locale].emailLabel}</dt>
							<dd className={classes.rowvalue}>
								<a className={classes.rowlink} href={`mailto:${email}`}>
									{email}
								</a>
							</dd>
						</div>
					</dl>
				</div>
			</section>
		</div>
	);
}

export const getStaticProps = staticPageProps(fetchContact, "/contact");

export default Contact;
