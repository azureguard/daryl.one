// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
	site: "https://daryl.one",
	integrations: [
		icon({
			include: {
				charm: ["certificate", "mail", "globe", "graduate-cap", "link-external"],
				codicon: ["azure-devops", "database", "folder"],
				lucide: ["sun-moon"],
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
	adapter: cloudflare(),
	vite: {
		plugins: [tailwindcss()],
		// Pre-bundle astro-icon and the iconify helpers it pulls in. Without this,
		// Vite discovers and re-optimizes them on the first request and triggers a
		// reload, which desyncs the workerd dev module runner used by the
		// Cloudflare adapter (Astro 6+) and throws "module is not defined".
		optimizeDeps: {
			include: ["astro-icon/components", "@iconify/utils"],
		},
	},
});
