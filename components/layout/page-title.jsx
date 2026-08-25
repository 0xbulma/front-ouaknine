import classes from './page-title.module.scss';

export default function PageTitle({ title }) {
  return (
    <div className={classes.titlegroup}>
      <div className={classes.titlegroupinner}>
        <h1 className={classes.title}>{title ? `${title}` : ''}</h1>
      </div>
    </div>
  );
}
