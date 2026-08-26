import CONTENT from '../content/500Content.json';
import useLocale from '../hooks/useLocale';

import classes from './404.module.scss';

// Next's built-in 500 is English-only and injects its own body colours, which
// paint white under the site's chrome. The publication routes rethrow a transient
// CMS failure rather than caching a 404 over a live page, so this is where that
// lands and it should look like the rest of the site.
function Page500() {
  // `useLocale` guards the value: this is the page that renders after something
  // else has thrown.
  const locale = useLocale();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>{CONTENT[locale].body}</h1>
    </div>
  );
}

export default Page500;
