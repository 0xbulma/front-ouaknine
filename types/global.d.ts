/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="vitest/globals" />

// `next-env.d.ts` carries the first two references too, but it is generated and
// gitignored: without a committed copy, `yarn typecheck` fails on a clean
// checkout until someone has run `next build` first.

// A SCSS module resolves to a class-name map, and a name that is not in the
// stylesheet is `undefined` rather than a silent empty class.
declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}
