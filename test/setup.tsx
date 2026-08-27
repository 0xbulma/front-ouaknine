import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { NextRouter } from "next/router";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";

// The router every `ui` test renders against. Tests call `setRouter` in a
// `beforeEach`; the mock below reads this object at call time, so a test can
// change the locale or the path without re-mocking the module.
const DEFAULT_ROUTER = {
	locale: "fr",
	locales: ["fr", "en"],
	defaultLocale: "fr",
	pathname: "/contact",
	asPath: "/contact",
	query: {},
} satisfies Partial<NextRouter>;

let router: Partial<NextRouter> = { ...DEFAULT_ROUTER };

export const setRouter = (overrides: Partial<NextRouter> = {}) => {
	router = { ...DEFAULT_ROUTER, ...overrides };
};

// A static image import is an object; a string src is itself.
const imageSrc = (value: unknown): string => {
	if (typeof value === "string") return value;
	if (value && typeof value === "object" && "src" in value) {
		const { src } = value;
		return typeof src === "string" ? src : "";
	}
	return "";
};

// `next/head` renders into document.head through a portal and a side effect,
// neither of which shows up in a container query. Rendering the children where
// they are declared is what makes the annotations assertable.
vi.mock("next/head", () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Next 12's <Link> clones its <a> child and injects the href. The real one
// needs a router context; this does the one thing the tests care about.
vi.mock("next/link", () => ({
	default: ({ href, children }: { href: string | { pathname: string }; children: ReactNode }) => {
		const url = typeof href === "string" ? href : href.pathname;
		if (isValidElement<AnchorHTMLAttributes<HTMLAnchorElement>>(children)) {
			return cloneElement(children, { href: url });
		}
		return <a href={url}>{children}</a>;
	},
}));

// next/image does layout maths, blur placeholders and a loader. None of it is
// what these tests are about.
vi.mock("next/image", () => ({
	default: ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src?: unknown }) => (
		// biome-ignore lint/a11y/useAltText: alt is forwarded from the caller, which is what the tests assert on.
		<img src={imageSrc(src)} alt={alt} {...rest} />
	),
}));

vi.mock("next/router", () => ({
	useRouter: () => router,
}));

// Imported at module scope by anything that touches the CMS, and it throws
// without NEXT_PUBLIC_SANITY_ID. Nothing under test performs a fetch.
vi.mock("../libs/clientApi", () => ({ default: { fetch: async () => null } }));

beforeEach(() => {
	setRouter();
});

afterEach(() => {
	cleanup();
});
