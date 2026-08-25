import Image from 'next/image';
import IskaLogo from '../../../public/images/iska-logo.svg';
import classes from './iska-mention.module.scss';

const ISKA_URL = 'https://www.iska-avocats.fr';

function IskaMention({ content }) {
  return (
    <a
      className={classes.mention}
      href={ISKA_URL}
      target={'_blank'}
      rel={'noopener noreferrer'}
      aria-label={content.aria}
    >
      <span className={classes.separator} aria-hidden={'true'}></span>
      <span className={classes.label}>{content.label}</span>
      <Image
        src={IskaLogo}
        alt={'ISKA'}
        width={52}
        height={21}
        layout={'fixed'}
        priority
      />
    </a>
  );
}

function IskaMentionMobile({ content, onClick }) {
  return (
    <a
      className={classes.mobile}
      href={ISKA_URL}
      target={'_blank'}
      rel={'noopener noreferrer'}
      aria-label={content.aria}
      onClick={onClick}
    >
      <span className={classes.mobilelabel}>{content.labelMobile}</span>
      <Image
        src={IskaLogo}
        alt={'ISKA'}
        width={54}
        height={22}
        layout={'fixed'}
      />
    </a>
  );
}

export { IskaMention, IskaMentionMobile };
