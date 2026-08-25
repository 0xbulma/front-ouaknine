import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IskaLogo from '../../../public/images/iska-logo.svg';
import classes from './iska-mention.module.scss';

const ISKA_PATH = '/iska';

function IskaMention({ content }) {
  const { pathname } = useRouter();

  return (
    <Link href={ISKA_PATH}>
      <a
        className={`${classes.mention} ${
          pathname === ISKA_PATH ? classes.active : ''
        }`}
        aria-label={content.aria}
      >
        <span className={classes.separator} aria-hidden={'true'}></span>
        <span className={classes.label}>{content.label}</span>
        <span className={classes.chip}>
          <Image
            src={IskaLogo}
            alt={'ISKA'}
            width={52}
            height={21}
            layout={'fixed'}
            priority
          />
        </span>
      </a>
    </Link>
  );
}

function IskaMentionMobile({ content, onClick }) {
  return (
    <Link href={ISKA_PATH}>
      <a
        className={classes.mobile}
        aria-label={content.aria}
        onClick={onClick}
      >
        <span className={classes.mobilelabel}>{content.labelMobile}</span>
        <span className={classes.chip}>
          <Image
            src={IskaLogo}
            alt={'ISKA'}
            width={54}
            height={22}
            layout={'fixed'}
          />
        </span>
      </a>
    </Link>
  );
}

export { IskaMention, IskaMentionMobile };
