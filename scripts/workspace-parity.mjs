/**
 * Fails if a workspace is missing one of the shared tasks.
 *
 * `pnpm -r <task>` runs the workspaces that define it and exits 0 on the ones
 * that do not, so a workspace added without a `verify` is not a CI failure, it
 * is silence. That is the only way the two apps come apart: not by one of them
 * breaking, but by one of them quietly falling out of the commands that check
 * them. This is the guard that makes `pnpm -r` mean "all of them".
 *
 * The tasks below are a vocabulary, not an implementation: what `lint` runs is
 * each workspace's business, and the site's is a different tool from the
 * studio's. Every workspace has to answer to the same words.
 */
import { execFileSync } from "node:child_process";

const REQUIRED = ["dev", "build", "lint", "test", "verify"];

const listed = JSON.parse(
	execFileSync("pnpm", ["ls", "-r", "--depth", "-1", "--json"], { encoding: "utf8" }),
);
const workspaces = listed.filter((w) => w.name !== "ouaknine");

if (workspaces.length === 0) {
	console.error("No workspaces found. Is pnpm-workspace.yaml still there?");
	process.exit(1);
}

const missing = [];
for (const { name, path } of workspaces) {
	const { default: pkg } = await import(`${path}/package.json`, { with: { type: "json" } });
	const absent = REQUIRED.filter((task) => !pkg.scripts?.[task]);
	if (absent.length > 0) missing.push(`  ${name}: ${absent.join(", ")}`);
}

if (missing.length > 0) {
	console.error(`Workspaces missing a shared task:\n${missing.join("\n")}`);
	console.error(`\nEvery workspace defines all of: ${REQUIRED.join(", ")}.`);
	process.exit(1);
}

console.log(`${workspaces.length} workspaces, all defining: ${REQUIRED.join(", ")}`);
