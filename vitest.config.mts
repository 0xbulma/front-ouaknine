import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Two projects, because the two halves of the suite need different worlds.
//
// `libs` is the pure core: no React, no DOM, no Sanity client, and it should
// stay that way — a node environment is the guard that says so.
//
// `ui` covers the seams the pure tests cannot reach: which annotations the head
// actually emits, what the JSON-LD graph says about a document, and whether a
// CMS-authored link leaves the site. Everything below those components is
// mocked in test/setup.tsx. Stylesheets compile for real: sass is current again
// since the Next 16 upgrade, so the stub the `ui` project used is gone.
export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "libs",
					environment: "node",
					include: ["libs/**/*.test.ts"],
					globals: true,
				},
			},
			{
				plugins: [react()],
				test: {
					name: "ui",
					environment: "jsdom",
					include: ["components/**/*.test.tsx"],
					setupFiles: ["./test/setup.tsx"],
					globals: true,
				},
			},
		],
	},
});
