// @ts-check
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";

const root = dirname(fileURLToPath(import.meta.url));
// aube installs packages as symlinks into a virtual store outside the project
// root, which Vite's dev-server fs allowlist rejects — fontsource woff2
// requests 403 in dev without the resolved real paths.
const fontDirs = ["@fontsource-variable/ibm-plex-sans", "@fontsource/ibm-plex-mono"].map((pkg) =>
	realpathSync(resolve(root, "node_modules", pkg)),
);

// https://astro.build/config
export default defineConfig({
	site: "https://daryl.one",
	integrations: [
		icon({
			include: {
				charm: [
					"certificate",
					"mail",
					"globe",
					"graduate-cap",
					"link-external",
				],
				codicon: ["azure-devops", "database", "folder"],
				lucide: [
					"app-window",
					"cloud-cog",
					"database",
					"key-round",
					"scale",
					"server",
					"shield-check",
					"sun-moon",
					"workflow",
				],
				"simple-icons": [
					"amazonaws",
					"amazondynamodb",
					"amazonredshift",
					"apacheairflow",
					"burpsuite",
					"cplusplus",
					"dotnet",
					"kubernetes",
					"bamboo",
					"css3",
					"docker",
					"git",
					"github",
					"html5",
					"javascript",
					"jenkins",
					"kubernetes",
					"linkedin",
					"metasploit",
					"mlflow",
					"nextdotjs",
					"nodedotjs",
					"postgresql",
					"python",
					"react",
					"splunk",
					"tailwindcss",
					"typescript",
				],
			},
		}),
		sitemap(),
		robotsTxt(),
	],
	output: "server",
	// `passthrough` image service avoids the Cloudflare Images (IMAGES) binding —
	// the site uses plain <img>, not astro:assets.
	adapter: cloudflare({ imageService: "compile" }),
	// Setting any non-KV session driver stops the adapter from auto-provisioning
	// the SESSION KV namespace. Sessions are unused, so an in-memory driver is fine.
	session: { driver: { entrypoint: "unstorage/drivers/memory" } },
	vite: {
		plugins: [tailwindcss()],
		// Always emit page scripts as external files (Astro inlines scripts below
		// this threshold). The CSP in `public/_headers` is `script-src 'self'` with
		// no 'unsafe-inline', so inlined scripts would be blocked in production.
		build: { assetsInlineLimit: 0 },
		server: { fs: { allow: [root, ...fontDirs] } },
		// Pre-bundle astro-icon and the iconify helpers it pulls in. Without this,
		// Vite discovers and re-optimizes them on the first request and triggers a
		// reload, which desyncs the workerd dev module runner used by the
		// Cloudflare adapter (Astro 6+) and throws "module is not defined".
		optimizeDeps: {
			include: ["astro-icon/components", "@iconify/utils"],
		},
	},
});
