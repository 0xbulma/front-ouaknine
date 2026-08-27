import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

// ESLint exists here for the `@next/next` rules and nothing else. Biome owns
// formatting and every general rule; see biome.json and CLAUDE.md.
//
// These 21 have no Biome equivalent and several matter in a pages-router app:
// no-html-link-for-pages, google-font-display and google-font-preconnect for
// the fonts _document.tsx loads by hand, inline-script-id and
// next-script-for-ga for the gtag snippet, no-duplicate-head.
//
// Flat config, because `next lint` was removed in Next 16 and ESLint 10 no
// longer reads `.eslintrc`. The file list is what `next lint --dir` used to
// pass: the app, not the build output and not the test harness, whose mocks
// render a bare <img> on purpose.
export default [
	{
		ignores: [".next/**", ".next-verify/**", "public/**", "coverage/**", "test/**"],
	},
	{
		files: [
			"components/**/*.{ts,tsx}",
			"context/**/*.{ts,tsx}",
			"hooks/**/*.{ts,tsx}",
			"libs/**/*.{ts,tsx}",
			"pages/**/*.{ts,tsx}",
			"proxy.ts",
		],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: { "@next/next": nextPlugin },
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs["core-web-vitals"].rules,
		},
	},
];
