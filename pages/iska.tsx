import Image from "next/image";

import HeadPage from "../components/head/head-page";
import Button from "../components/ui/button";
import CONTENT from "../content/iskaContent.json";
import useLocale from "../hooks/useLocale";
import iskaCollage from "../public/images/iska-collage.png";
import iskaLogo from "../public/images/iska-logo.svg";

import classes from "./iska.module.scss";

const ISKA_URL = "https://www.iska-avocats.fr";

function Iska() {
	const locale = useLocale();
	const content = CONTENT[locale];

	return (
		<div>
			<HeadPage title={content.titleseo} description={content.descriptionseo} />

			<div className={classes.container}>
				<section className={classes.lede}>
					<div className={classes.ledetext}>
						<h1 className={classes.wordmark}>
							<Image
								src={iskaLogo}
								alt={content.title}
								width={260}
								height={105}
								layout="intrinsic"
								priority
							/>
						</h1>
						<p className={classes.tagline}>{content.tagline}</p>
						<div className={classes.actions}>
							<Button
								href={ISKA_URL}
								target="_blank"
								aria-label={content.ctaAria}
								className={classes.cta}
							>
								{content.cta}
							</Button>
						</div>
					</div>

					<div className={classes.visual}>
						<Image
							src={iskaCollage}
							alt=""
							aria-hidden="true"
							layout="responsive"
							sizes="(min-width: 992px) 42vw, 80vw"
							placeholder="blur"
							priority
						/>
					</div>
				</section>

				<section className={classes.block}>
					<span className={classes.blockindex}>01</span>
					<h2 className={classes.blocktitle}>{content.networkTitle}</h2>
					<div className={classes.body}>
						{content.network.map((paragraph) => (
							<p key={paragraph.slice(0, 24)}>{paragraph}</p>
						))}
					</div>
				</section>

				<section className={classes.block}>
					<span className={classes.blockindex}>02</span>
					<h2 className={classes.blocktitle}>{content.bringTitle}</h2>
					<div className={classes.body}>
						{content.bring.map((paragraph) => (
							<p key={paragraph.slice(0, 24)}>{paragraph}</p>
						))}
					</div>
				</section>

				<section className={classes.block}>
					<span className={classes.blockindex}>03</span>
					<h2 className={classes.blocktitle}>{content.skillsTitle}</h2>
					<ul className={classes.skills}>
						{content.skills.map((skill) => (
							<li key={skill} className={classes.skill}>
								{skill}
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}

export default Iska;
