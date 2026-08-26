import { defineConfig } from "vitest/config";

// The pure derivations in libs/ are the whole suite: no React, no Sanity
// client, no DOM. Components and routes are still checked with curl and a
// screenshot against `yarn build && yarn start`.
export default defineConfig({
	test: {
		environment: "node",
		include: ["libs/**/*.test.ts"],
		globals: true,
	},
});
