// @ts-check
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";

const root = dirname(fileURLToPath(import.meta.url));
// aube installs packages as symlinks into a virtual store outside the project
// root, which Vite's dev-server fs allowlist rejects — fontsource woff2
// requests 403 in dev without the resolved real paths.
const fontDirs = [
	"@fontsource-variable/big-shoulders-display",
	"@fontsource-variable/ibm-plex-sans",
	"@fontsource/ibm-plex-mono",
].map((pkg) => realpathSync(resolve(root, "node_modules", pkg)));

// https://astro.build/config
export default defineConfig({
	site: "https://daryl.one",
	integrations: [
		// Only listed glyphs are bundled. Icons named from cv.json data
		// (src/icons.ts) must be listed here too, because nothing else can see them.
		icon({
			include: {
				charm: ["certificate", "globe", "graduate-cap", "link-external", "mail"],
				lucide: [
					"app-window",
					"check",
					"chevron-down",
					"cloud-cog",
					"database",
					"key-round",
					"moon",
					"scale",
					"server",
					"shield-check",
					"sun",
					"sun-moon",
					"user-round",
					"workflow",
				],
				"simple-icons": ["github", "linkedin"],
			},
		}),
		sitemap(),
		robotsTxt(),
	],
	output: "server",
	markdown: {
		// Shiki otherwise writes its palette onto the element as an inline
		// `style`, which no stylesheet can override. `defaultColor: false` emits
		// --shiki-light / --shiki-dark instead, and global.css picks the pair.
		shikiConfig: {
			themes: { light: "github-light", dark: "github-dark" },
			defaultColor: false,
			wrap: false,
		},
	},
	// `compile` processes <Image> at build time, so the Worker needs no
	// Cloudflare Images (IMAGES) binding.
	adapter: cloudflare({ imageService: "compile" }),
	// Setting any non-KV session driver stops the adapter from auto-provisioning
	// the SESSION KV namespace. Sessions are unused, so an in-memory driver is fine.
	session: { driver: { entrypoint: "unstorage/drivers/memory" } },
	vite: {
		// Always emit page scripts as external files (Astro inlines scripts below
		// this threshold). The CSP in `public/_headers` is `script-src 'self'` with
		// no 'unsafe-inline', so inlined scripts would be blocked in production.
		build: { assetsInlineLimit: 0 },
		server: { fs: { allow: [root, ...fontDirs] } },
		// Pre-bundle astro-icon and the iconify helpers it pulls in. Without this,
		// Vite discovers and re-optimizes them on the first request and triggers a
		// reload, which desyncs the workerd dev module runner and throws
		// "module is not defined".
		optimizeDeps: {
			include: ["astro-icon/components", "@iconify/utils"],
		},
	},
});
