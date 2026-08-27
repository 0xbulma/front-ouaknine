import Image from "next/image";

import HeadPage from "../components/head/head-page";
import Button from "../components/ui/button";
import RichText from "../components/ui/rich-text";
import { fetchIska } from "../libs/page-content";
import { staticPageProps } from "../libs/static-page-props";
import type { IskaDocument } from "../libs/types";
import iskaCollage from "../public/images/iska-collage.png";
import iskaLogo from "../public/images/iska-logo.svg";

import classes from "./iska.module.scss";

const ISKA_URL = "https://www.iska-avocats.fr";

// The same `01 / 02 / 03` gutter the home practice list runs.
const blockIndex = (position: number) => String(position + 1).padStart(2, "0");

// The wordmark and the collage stay local imports: they are the network's brand
// assets, not copy, and the blur-up placeholder wants a build-time import.
function Iska({ data }: { data: IskaDocument }) {
	// Numbered by what is rendered, not by which field it came from: every one of
	// these is optional in the studio, and a section emptied there would otherwise
	// leave a blank heading and a gap in the count.
	const prose = [
		{ id: "network", title: data.networkTitle, body: data.network },
		{ id: "bring", title: data.bringTitle, body: data.bring },
	].filter((block) => block.title || block.body?.length);

	const skills = data.skills ?? [];

	return (
		<div>
			<HeadPage title={data.titleseo ?? ""} description={data.descriptionseo ?? ""} />

			<div className={classes.container}>
				<section className={classes.lede}>
					<div className={classes.ledetext}>
						<h1 className={classes.wordmark}>
							<Image
								src={iskaLogo}
								alt={data.title ?? "ISKA"}
								width={260}
								height={105}
								style={{ maxWidth: "100%", height: "auto" }}
								priority
							/>
						</h1>
						{data.tagline ? <p className={classes.tagline}>{data.tagline}</p> : null}
						{data.cta ? (
							<div className={classes.actions}>
								<Button
									href={ISKA_URL}
									target="_blank"
									aria-label={data.ctaAria}
									className={classes.cta}
								>
									{data.cta}
								</Button>
							</div>
						) : null}
					</div>

					<div className={classes.visual}>
						<Image
							src={iskaCollage}
							alt=""
							aria-hidden="true"
							style={{ width: "100%", height: "auto" }}
							sizes="(min-width: 992px) 42vw, 80vw"
							placeholder="blur"
							priority
						/>
					</div>
				</section>

				{prose.map((block, i) => (
					<section key={block.id} className={classes.block}>
						<span className={classes.blockindex}>{blockIndex(i)}</span>
						{block.title ? <h2 className={classes.blocktitle}>{block.title}</h2> : null}
						<div className={classes.body}>
							<RichText value={block.body} />
						</div>
					</section>
				))}

				{skills.length ? (
					<section className={classes.block}>
						<span className={classes.blockindex}>{blockIndex(prose.length)}</span>
						{data.skillsTitle ? <h2 className={classes.blocktitle}>{data.skillsTitle}</h2> : null}
						<ul className={classes.skills}>
							{skills.map((skill) => (
								<li key={skill} className={classes.skill}>
									{skill}
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
		</div>
	);
}

export const getStaticProps = staticPageProps(fetchIska, "/iska");

export default Iska;
