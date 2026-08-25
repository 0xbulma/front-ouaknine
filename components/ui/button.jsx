import classes from './button.module.scss';

// The anchor branch forwards the remaining props so callers can set aria-label,
// download, etc. — they used to be silently dropped on links.
function Button({ href, target, className, children, ...rest }) {
  if (href) {
    return (
      <a
        className={`${classes.btn} ${className ?? ''}`}
        href={href}
        target={target}
        rel='noreferrer'
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={`${classes.btn} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;
