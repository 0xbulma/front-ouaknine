import classes from './main-footer.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LogoSquare from '../../../public/images/logosquare.svg';
import Image from 'next/image';
import useLocale from '../../../hooks/useLocale';
import CONTENT from '../../../content/footerContent.json';

import { FaLinkedin, FaGooglePlusSquare } from 'react-icons/fa';

function MainFooter() {
  const locale = useLocale();
  const { pathname } = useRouter();

  const underPinnedIndex = pathname.startsWith('/expertise');

  return (
    <footer
      className={`${classes.footer} ${
        underPinnedIndex ? classes.footerbare : ''
      }`}
    >
      <div className={classes.innercontainer}>
        <div className={classes.logo}>
          <Image
            src={LogoSquare}
            alt={'logo'}
            width={70}
            height={38.73}
            layout={'fixed'}
          />
        </div>

        <div className={classes.links}>
          <Link href='/'><a className={classes.link}>{CONTENT[locale].link1}</a></Link>
          <Link href='/about'><a className={classes.link}>{CONTENT[locale].link4}</a></Link>
          <Link href='/legal'><a className={classes.link}>{CONTENT[locale].link2}</a></Link>
          <a
            href='https://cabinet-ouaknine.sanity.studio/desk'
            target='_blank'
            rel='noreferrer'
            alt='Administration Alice Ouaknine'
            aria-label='Administration console'
            className={classes.link}
          >{CONTENT[locale].link3}
          </a>
        </div>

        <p className={classes.address}>
        {CONTENT[locale].address}
        </p>

        <div className={classes.social}>
          <a
            href='https://fr.linkedin.com/in/alice-ouaknine-23a4186b'
            target='_blank'
            rel='noreferrer'
            alt='LinkedIn Alice Ouaknine'
            aria-label='Open LinkedIn Alice Ouaknine'
          >
            <FaLinkedin
              className={classes.socialicon}
              alt='Google Alice Ouaknine'
            />
          </a>
          <a
            href={CONTENT.mapsUrl}
            target='_blank'
            rel='noreferrer'
            alt='Google Alice Ouaknine'
            aria-label='Open Google Alice Ouaknine'
          >
            <FaGooglePlusSquare
              className={classes.socialicon}
              alt='Google Alice Ouaknine'
            />
          </a>
        </div>
        <div className={classes.credit}></div>
      </div>
    </footer>
  );
}

export default MainFooter;
