import NavContext from '../context/nav-context';
import CookieContext from '../context/cookie-context';
import LocalesContext from '../context/locales-context';
import Layout from '../components/layout/layout';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }) {
  // A page that publishes an explicit alternate set knows which languages it has.
  const locales = pageProps?.seo?.alternates
    ? Object.keys(pageProps.seo.alternates)
    : null;

  return (
    <CookieContext>
      <NavContext>
        <LocalesContext value={locales}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LocalesContext>
      </NavContext>
    </CookieContext>
  );
}

export default MyApp;
