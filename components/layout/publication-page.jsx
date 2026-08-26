import Link from 'next/link';

import HeadPage from '../head/head-page';
import PublicationSchema from '../head/publication-schema';
import PageTitle from './page-title';
import RichText from '../ui/rich-text';

import { isPress, splitTitle } from '../../libs/publications';
import { expertiseSlug } from '../../libs/expertise';
import useLocale from '../../hooks/useLocale';
import CONTENT from '../../content/publicationsContent.json';

import classes from './publication-page.module.scss';

const pad = n => String(n).padStart(2, '0');

const formatDate = (iso, locale) =>
  new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// The guide's own cross-links, as navigation rather than as prose. The rail is
// the one from the fields of expertise: a sticky index of no height, so it stays
// pinned for the whole of the article instead of being pushed by the footer.
function SeriesRail({ series, current, copy }) {
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
              <span className={classes.railindex}>{pad(episode ?? 0)}</span>
              <span className={classes.railtitle}>{title}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function PublicationPage({ post, series, seo }) {
  const locale = useLocale();
  const copy = CONTENT[locale] ?? CONTENT.fr;
  const { series: seriesName, episode, title } = splitTitle(post);

  const position = series?.findIndex(e => e.post._id === post._id) ?? -1;
  const previous = position > 0 ? series[position - 1] : null;
  const next =
    position >= 0 && position < (series?.length ?? 0) - 1
      ? series[position + 1]
      : null;

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
          <SeriesRail series={series} current={post._id} copy={copy} />

          <article className={classes.article}>
            <div className={classes.meta}>
              {seriesName && (
                <span className={classes.metaitem}>
                  {seriesName}
                  {episode ? ` — ${copy.episode} ${episode}` : ''}
                </span>
              )}
              <span className={classes.metaitem}>
                {formatDate(post.publishedAt, locale)}
              </span>
              {post.readingTime > 0 && (
                <span className={classes.metaitem}>
                  {post.readingTime} {copy.readingTime}
                </span>
              )}
              {post.field && (
                <Link href={`/expertise/${expertiseSlug(post.field)}`}>
                  <a className={classes.metalink}>{post.field}</a>
                </Link>
              )}
            </div>

            <div className={classes.body}>
              <RichText value={post.body} />
            </div>

            {post.source && (
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
                      <span className={classes.pagertitle}>
                        {previous.title}
                      </span>
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
        </div>
      </div>
    </div>
  );
}

export default PublicationPage;
