// @ts-check
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import charm from "@iconify-json/charm/icons.json" with { type: "json" };
import rehypeExternalLinks from "rehype-external-links";

const root = dirname(fileURLToPath(import.meta.url));

// The external-link glyph the components render through astro-icon
// (`charm:link-external`), as a HAST node for Markdown. It is decorative: the
// icon is aria-hidden and adds no text. A word joiner ahead of it stops a line
// break between the link's last word and the icon.
const [, polylinePoints = "", pathData = ""] =
	charm.icons["link-external"].body.match(/points="([^"]+)"[^]*? d="([^"]+)"/) ?? [];
const externalLinkIcon = [
	{ type: "text", value: "\u2060" },
	{
		type: "element",
		tagName: "svg",
		properties: { className: ["external-link-icon"], viewBox: "0 0 16 16", ariaHidden: "true", focusable: "false" },
		children: [
			{
				type: "element",
				tagName: "g",
				properties: {
					fill: "none",
					stroke: "currentColor",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					strokeWidth: "1.5",
				},
				children: [
					{ type: "element", tagName: "polyline", properties: { points: polylinePoints }, children: [] },
					{ type: "element", tagName: "path", properties: { d: pathData }, children: [] },
				],
			},
		],
	},
];
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
	// Every page is prerendered to a static asset, served from Cloudflare's cache
	// ahead of the Worker; only the 404 renders on demand. `file` output with no
	// trailing slash gives `/about` → about.html, matching the canonical URLs and
	// the sitemap.
	trailingSlash: "never",
	build: { format: "file" },
	markdown: {
		// Off-site links in posts and case studies open in a new tab with no
		// referrer and carry the external-link glyph, as the site's hand-written
		// external links already do. Only absolute http(s) URLs count as
		// external; site links stay in-tab.
		processor: unified({
			rehypePlugins: [
				[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"], content: externalLinkIcon }],
			],
		}),
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
	adapter: cloudflare({
		imageService: "compile",
		// Prerendering runs in Node rather than workerd: the preview images are
		// drawn with CanvasKit (WebAssembly loaded from disk), which workerd
		// cannot load. Only the 404 renders on demand, in workerd.
		prerenderEnvironment: "node",
	}),
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
