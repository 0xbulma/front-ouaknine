import Link from "next/link";
import CONTENT from "../../content/publicationsContent.json";
import useLocale from "../../hooks/useLocale";
import { formatDate, groupPublications, isPress, splitTitle } from "../../libs/publications";
import type { Locale, PageSeo, PublicationMeta, PublicationsDocument } from "../../libs/types";
import HeadPage from "../head/head-page";
import PageTitle from "./page-title";

import classes from "./publications-index.module.scss";

type Copy = (typeof CONTENT)["fr"];

const pad = (n: number) => String(n).padStart(2, "0");

// One row shape for everything on this page, the same one the home practice
// list uses: a micro-caps number in the gutter, the title beside it, a hairline
// beneath. An episode shows its number, an article its position in the list.
function Row({
	post,
	index,
	locale,
	copy,
}: {
	post: PublicationMeta;
	index: number;
	locale: Locale;
	copy: Copy;
}) {
	const { title } = splitTitle(post);

	return (
		<li>
			<Link href={`/publications/${post.slug}`}>
				<a className={classes.row}>
					<span className={classes.index}>{pad(index)}</span>
					<span className={classes.value}>
						<h3 className={classes.title}>{title}</h3>
						<span className={classes.meta}>
							{formatDate(post.publishedAt, locale, {
								year: "numeric",
								month: "long",
							})}
							{isPress(post) && post.author
								? ` — ${post.author}`
								: post.readingTime
									? ` — ${post.readingTime} ${copy.readingTime}`
									: ""}
						</span>
					</span>
				</a>
			</Link>
		</li>
	);
}

// The three surfaces differ only in their heading and in where their row numbers
// come from: a guide numbers by episode, the other two by position in the list.
const byPosition = (_post: PublicationMeta, index: number) => index + 1;

const byEpisode = (post: PublicationMeta, index: number) => splitTitle(post).episode ?? index + 1;

function Section({
	label,
	posts,
	index = byPosition,
	locale,
	copy,
}: {
	label: string;
	posts: PublicationMeta[];
	index?: (post: PublicationMeta, position: number) => number;
	locale: Locale;
	copy: Copy;
}) {
	if (!posts.length) return null;

	return (
		<section className={classes.section}>
			<h2 className={classes.sectiontitle}>{label}</h2>
			<ul className={classes.list}>
				{posts.map((post, i) => (
					<Row key={post._id} post={post} index={index(post, i)} locale={locale} copy={copy} />
				))}
			</ul>
		</section>
	);
}

export type PublicationsIndexProps = {
	data?: PublicationsDocument;
	posts?: PublicationMeta[];
	seo?: PageSeo;
};

function PublicationsIndex({ data, posts, seo }: PublicationsIndexProps) {
	const locale = useLocale();
	const copy = CONTENT[locale];
	const { guides, articles, press } = groupPublications(posts ?? []);

	return (
		<div>
			<HeadPage title={seo?.title ?? ""} description={seo?.description ?? ""} />
			<PageTitle title={data?.title ?? ""} />

			<div className={classes.container}>
				{guides.map((guide) => (
					<Section
						key={guide.series}
						label={guide.series}
						posts={guide.episodes}
						index={byEpisode}
						locale={locale}
						copy={copy}
					/>
				))}

				<Section label={copy.articles} posts={articles} locale={locale} copy={copy} />

				<Section label={copy.press} posts={press} locale={locale} copy={copy} />

				{guides.length === 0 && articles.length === 0 && press.length === 0 && (
					<p className={classes.empty}>{copy.empty}</p>
				)}
			</div>
		</div>
	);
}

export default PublicationsIndex;
