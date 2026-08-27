// Stands in for every `*.scss` import under the `ui` project.
//
// Vite would otherwise hand the file to `sass`, and the pinned 1.54.3 predates
// the async compiler API that Vite 8 calls. Bumping sass changes the CSS the
// production build emits, which is a design decision and belongs with the Next
// upgrade, not with a test harness.
//
// Returning the key means `classes.railitem` is `"railitem"`, which keeps a
// failed query readable. Nothing in the suite asserts on a class name.
const classes: Record<string, string> = new Proxy(
	{},
	{ get: (_target, key) => (typeof key === "string" ? key : "") },
);

export default classes;
