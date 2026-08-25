import HeadPage from '../head/head-page';
import ExpertiseSchema from '../head/expertise-schema';
import ExpertiseFields from './expertise-fields';

import ExpertiseContent from '../../content/expertiseContent.json';
import useLocale from '../../hooks/useLocale';

import classes from './expertise-page.module.scss';

function ExpertisePage({ data, slug, seo }) {
  const locale = useLocale();
  const { title, expertiseList } = data;

  return (
    <div>
      <HeadPage
        title={seo?.title ?? ''}
        description={seo?.description ?? ''}
        alternatePaths={seo?.alternates}
      />
      <ExpertiseSchema items={expertiseList ?? []} current={slug} />
      <section id='section1' className={classes.section1}>
        {expertiseList?.length > 0 && (
          <ExpertiseFields
            items={expertiseList}
            label={title ? title : ''}
            linkLabel={ExpertiseContent[locale].contactLinkLabel}
            current={slug}
          />
        )}
      </section>
    </div>
  );
}

export default ExpertisePage;
