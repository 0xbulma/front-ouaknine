import "react";

// The expertise rail staggers its reveal off a `--i` custom property set per
// item. React's own CSSProperties lists only real CSS properties, so without
// this the alternative is a cast at the one call site.
declare module "react" {
	interface CSSProperties {
		[custom: `--${string}`]: string | number | undefined;
	}
}
