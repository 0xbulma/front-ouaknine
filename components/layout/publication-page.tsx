import Link from 'next/link';

import HeadPage from '../head/head-page';
import PublicationSchema from '../head/publication-schema';
import PageTitle from './page-title';
import RichText from '../ui/rich-text';

import { formatDate, isPress, splitTitle } from '../../libs/publications';
import { isSafeExternal } from '../../libs/href';
import { expertiseSlugIn } from '../../libs/localePath';
import useLocale from '../../hooks/useLocale';
import type { PageSeo, Publication, SeriesLink } from '../../libs/types';
import CONTENT from '../../content/publicationsContent.json';

import classes from './publication-page.module.scss';

type Copy = (typeof CONTENT)['fr'];

const pad = (n: number) => String(n).padStart(2, '0');

// The guide's own cross-links, as navigation rather than as prose. The rail is
// the one from the fields of expertise: a sticky index of no height, so it stays
// pinned for the whole of the article instead of being pushed by the footer.
function SeriesRail({
  series,
  current,
  copy,
}: {
  series: SeriesLink[] | null;
  current: string;
  copy: Copy;
}) {
  if (!series?.length) return null;

  return (
    <nav className={classes.rail} aria-label={copy.series}>
      <div className={classes.railinner}>
        {series.map(({ post, episode, title }) => (
          <Link key={post._id} href={`/publications/${post.slug}`}>
            <a
              className={classes.railitem}
              aria-current={post._id === current ? 'page' : undefined}
            >
              {episode ? (
                <span className={classes.railindex}>{pad(episode)}</span>
              ) : (
                <span />
              )}
              <span className={classes.railtitle}>{title}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export type PublicationPageProps = {
  post: Publication;
  series: SeriesLink[] | null;
  seo?: PageSeo;
};

function PublicationPage({ post, series, seo }: PublicationPageProps) {
  const locale = useLocale();
  const copy = CONTENT[locale];
  const { series: seriesName, episode, title } = splitTitle(post);

  // relatedExpertise points at one language's document. Under the other locale
  // the derived slug names a page that is not served, so the link is resolved
  // through the pairs and dropped when the field has no counterpart.
  const fieldSlug = expertiseSlugIn(post.field, locale);

  const position = series ? series.findIndex(e => e.post._id === post._id) : -1;
  const previous = position > 0 ? series?.[position - 1] : null;
  // The guard has to stay: at -1, series[0] would wrongly be the next episode.
  const next = position >= 0 ? series?.[position + 1] ?? null : null;

  const meta = (
    <div className={classes.meta}>
      {seriesName && (
        <span className={classes.metaitem}>
          {seriesName}
          {episode ? ` — ${copy.episode} ${episode}` : ''}
        </span>
      )}
      <span className={classes.metaitem}>
        {formatDate(post.publishedAt, locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
      {(post.readingTime ?? 0) > 0 && (
        <span className={classes.metaitem}>
          {post.readingTime} {copy.readingTime}
        </span>
      )}
      {fieldSlug && (
        <Link href={`/expertise/${fieldSlug}`}>
          <a className={classes.metalink}>{post.field}</a>
        </Link>
      )}
    </div>
  );

  return (
    <div>
      <HeadPage
        title={seo?.title ?? ''}
        description={seo?.description ?? ''}
        alternatePaths={seo?.alternates}
      />
      <PublicationSchema post={post} title={title} series={seriesName} />

      <PageTitle title={title} />

      <div className={classes.container}>
        <div className={classes.layout}>
          <article className={classes.article}>
            {meta}

            <div className={classes.body}>
              <RichText value={post.body} headingLevel='h2' />
            </div>

            {isSafeExternal(post.source) && post.source && (
              <a
                className={classes.source}
                href={post.source}
                target='_blank'
                rel='noreferrer noopener'
              >
                {copy.source}
              </a>
            )}

            {!isPress(post) && post.author && (
              <div className={classes.author}>
                <span className={classes.authorlabel}>{copy.author}</span>
                <span className={classes.authorname}>{post.author}</span>
                <span className={classes.authorrole}>{copy.authorRole}</span>
              </div>
            )}

            {(previous || next) && (
              <div className={classes.pager}>
                {previous ? (
                  <Link href={`/publications/${previous.post.slug}`}>
                    <a className={classes.pagerlink}>
                      <span className={classes.pagerlabel}>{copy.previous}</span>
                      <span className={classes.pagertitle}>{previous.title}</span>
                    </a>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={`/publications/${next.post.slug}`}>
                    <a className={`${classes.pagerlink} ${classes.pagernext}`}>
                      <span className={classes.pagerlabel}>{copy.next}</span>
                      <span className={classes.pagertitle}>{next.title}</span>
                    </a>
                  </Link>
                )}
              </div>
            )}

            <Link href='/publications'>
              <a className={classes.back}>{copy.backToIndex}</a>
            </Link>
          </article>

          <SeriesRail series={series} current={post._id} copy={copy} />
        </div>
      </div>
    </div>
  );
}

export default PublicationPage;
