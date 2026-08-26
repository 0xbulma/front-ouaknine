import Link from 'next/link';

import HeadPage from '../head/head-page';
import PageTitle from './page-title';
import { groupPublications, splitTitle } from '../../libs/publications';
import useLocale from '../../hooks/useLocale';
import CONTENT from '../../content/publicationsContent.json';

import classes from './publications-index.module.scss';

const pad = n => String(n).padStart(2, '0');

const formatDate = (iso, locale) =>
  new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
  });

// One row shape for everything on this page, the same one the home practice
// list uses: a micro-caps number in the gutter, the title beside it, a hairline
// beneath. An episode shows its number, an article its position in the list.
function Row({ post, index, locale, copy }) {
  const { title } = splitTitle(post);

  return (
    <li>
      <Link href={`/publications/${post.slug}`}>
        <a className={classes.row}>
          <span className={classes.index}>{pad(index)}</span>
          <span className={classes.value}>
            <h3 className={classes.title}>{title}</h3>
            <span className={classes.meta}>
              {formatDate(post.publishedAt, locale)}
              {post.filter === 'press' && post.author
                ? ` — ${post.author}`
                : post.readingTime
                ? ` — ${post.readingTime} ${copy.readingTime}`
                : ''}
            </span>
          </span>
        </a>
      </Link>
    </li>
  );
}

function Section({ label, children }) {
  return (
    <section className={classes.section}>
      <h2 className={classes.sectiontitle}>{label}</h2>
      {children}
    </section>
  );
}

function PublicationsIndex({ data, posts, seo }) {
  const locale = useLocale();
  const copy = CONTENT[locale] ?? CONTENT.fr;
  const { guides, articles, press } = groupPublications(posts ?? []);

  return (
    <div>
      <HeadPage title={seo?.title ?? ''} description={seo?.description ?? ''} />
      <PageTitle title={data?.title ?? ''} />

      <div className={classes.container}>
        {guides.map(guide => (
          <Section key={guide.series} label={guide.series}>
            <ul className={classes.list}>
              {guide.episodes.map((post, i) => (
                <Row
                  key={post._id}
                  post={post}
                  index={splitTitle(post).episode ?? i + 1}
                  locale={locale}
                  copy={copy}
                />
              ))}
            </ul>
          </Section>
        ))}

        {articles.length > 0 && (
          <Section label={copy.articles}>
            <ul className={classes.list}>
              {articles.map((post, i) => (
                <Row
                  key={post._id}
                  post={post}
                  index={i + 1}
                  locale={locale}
                  copy={copy}
                />
              ))}
            </ul>
          </Section>
        )}

        {press.length > 0 && (
          <Section label={copy.press}>
            <ul className={classes.list}>
              {press.map((post, i) => (
                <Row
                  key={post._id}
                  post={post}
                  index={i + 1}
                  locale={locale}
                  copy={copy}
                />
              ))}
            </ul>
          </Section>
        )}

        {guides.length === 0 && articles.length === 0 && press.length === 0 && (
          <p className={classes.empty}>{copy.empty}</p>
        )}
      </div>
    </div>
  );
}

export default PublicationsIndex;
