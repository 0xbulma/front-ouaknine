import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

// The Sanity client is a server dependency, and nothing under components/ has
// ever called it. But the two fetcher modules used to re-export the pure
// derivations beside them for convenience — `formatDate` out of
// libs/publications, `plainText` out of libs/expertise — and a component
// importing one of those pulled the whole client, rxjs and get-it into the
// browser: 72 kB, on the home page, for a string function.
//
// That is invisible in a diff and invisible in a screenshot. It shows up only
// as a chunk that grew, so the import graph is asserted here instead.

const ROOT = resolve(__dirname, "..");
const FORBIDDEN = "libs/clientApi.ts";

const resolveSpec = (from: string, spec: string): string | null => {
	if (!spec.startsWith(".")) return null;
	const base = resolve(dirname(from), spec);
	const candidates = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`, base];

	return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
};

const specifiersIn = (source: string): string[] =>
	[...source.matchAll(/^\s*(?:import|export)[\s\S]*?from\s+"([^"]+)"/gm)].flatMap((m) =>
		m[1] ? [m[1]] : [],
	);

/** The first import chain from `file` down to the client, or null. */
const chainToClient = (
	file: string,
	seen = new Set<string>(),
	trail: string[] = [],
): string[] | null => {
	if (seen.has(file)) return null;
	seen.add(file);

	const here = [...trail, relative(ROOT, file)];
	if (relative(ROOT, file) === FORBIDDEN) return here;

	for (const spec of specifiersIn(readFileSync(file, "utf8"))) {
		const next = resolveSpec(file, spec);
		const found = next ? chainToClient(next, seen, here) : null;
		if (found) return found;
	}

	return null;
};

const walk = (dir: string): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)],
	);

test("no component can reach the Sanity client", () => {
	const components = walk(resolve(ROOT, "components")).filter(
		(file) => /\.tsx?$/.test(file) && !file.includes(".test."),
	);

	expect(components.length).toBeGreaterThan(10);

	const offenders = components
		.map((file) => chainToClient(file))
		.filter((chain): chain is string[] => chain !== null)
		.map((chain) => chain.join(" -> "));

	expect(offenders).toStrictEqual([]);
});
