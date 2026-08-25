import NavContext from '../context/nav-context';
import CookieContext from '../context/cookie-context';
import Layout from '../components/layout/layout';
import '../styles/globals.scss';
import '../styles/scale.scss';

function MyApp({ Component, pageProps }) {
  return (
    <CookieContext>
      <NavContext>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NavContext>
    </CookieContext>
  );
}

export default MyApp;
