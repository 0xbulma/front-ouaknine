import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import classes from "./button.module.scss";

// One element, two tags: `href` is the discriminator, so a link cannot be given
// `type='submit'` and a button cannot be given `target`.
type ButtonProps = { children: ReactNode; className?: string } & (
	| ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
	| ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

// Each branch forwards the remaining props so callers can set aria-label,
// download, etc. — they used to be silently dropped on links.
function Button(props: ButtonProps) {
	if (props.href !== undefined) {
		const { className, children, ...rest } = props;
		return (
			<a className={`${classes.btn} ${className ?? ""}`} rel="noreferrer" {...rest}>
				{children}
			</a>
		);
	}

	const { className, children, ...rest } = props;
	return (
		<button className={`${classes.btn} ${className ?? ""}`} {...rest}>
			{children}
		</button>
	);
}

export default Button;
