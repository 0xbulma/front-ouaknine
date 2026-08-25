import classes from './button.module.scss';

function Button(props) {
  if (props.href) {
    return (
      <a className={`${classes.btn} ${props.className}`} href={props.href} target={props.target} rel='noreferrer'>
        {props.children}
      </a>
    );
  }

  return (
    <button className={classes.btn} onClick={props.onclick} {...props}>
      {props.children}
    </button>
  );
}

export default Button;
