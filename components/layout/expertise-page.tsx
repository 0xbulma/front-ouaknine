import ExpertiseContent from "../../content/expertiseContent.json";
import useLocale from "../../hooks/useLocale";
import type { ExpertiseDocument, PageSeo } from "../../libs/types";
import ExpertiseSchema from "../head/expertise-schema";
import HeadPage from "../head/head-page";
import ExpertiseFields from "./expertise-fields";

import classes from "./expertise-page.module.scss";

export type ExpertisePageProps = {
	data: ExpertiseDocument;
	slug?: string;
	seo?: PageSeo;
};

function ExpertisePage({ data, slug, seo }: ExpertisePageProps) {
	const locale = useLocale();
	const { title, expertiseList } = data;

	return (
		<div>
			<HeadPage
				title={seo?.title ?? ""}
				description={seo?.description ?? ""}
				alternatePaths={seo?.alternates}
			/>
			<ExpertiseSchema items={expertiseList ?? []} current={slug} />
			<section id="section1" className={classes.section1}>
				{expertiseList.length > 0 && (
					<ExpertiseFields
						items={expertiseList}
						label={title ?? ""}
						linkLabel={ExpertiseContent[locale].contactLinkLabel}
						current={slug}
					/>
				)}
			</section>
		</div>
	);
}

export default ExpertisePage;
