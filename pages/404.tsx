import Link from "next/link";

import HeadPage from "../components/head/head-page";
import CONTENT from "../content/404Content.json";
import useLocale from "../hooks/useLocale";
import { withLocale } from "../libs/site-url";

import classes from "./404.module.scss";

// Only the two generated files carry these, so the JSON's inferred element type
// is a union the renderer cannot read through.
type NotFoundLink = {
	label: string;
	url: string;
	file?: boolean;
	localized?: boolean;
};

// A missing page still says where everything is, so that a reader — or an agent
// that guessed a URL — has somewhere to go. The two generated files are in the
// list for the same reason.
function Page404() {
	const locale = useLocale();
	const content = CONTENT[locale];
	const links: NotFoundLink[] = content.links;

	return (
		<div className={classes.container}>
			<HeadPage title={content.titleseo} description={content.body.trim()} noindex />

			<h1 className={classes.title}>{content.body}</h1>

			<p className={classes.lead}>{content.lead}</p>

			<nav className={classes.nav} aria-label={content.navLabel}>
				<ul className={classes.list}>
					{links.map((link) => (
						<li key={link.url}>
							{link.file ? (
								// A generated file, so not a <Link>. Only llms.txt has a French
								// and an English edition; the sitemap lists both languages at one
								// URL and stays unprefixed.
								<a
									className={classes.link}
									href={link.localized ? withLocale(locale, link.url) : link.url}
								>
									{link.label}
								</a>
							) : (
								<Link href={link.url}>
									<a className={classes.link}>{link.label}</a>
								</Link>
							)}
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}

export default Page404;
