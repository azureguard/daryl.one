// @ts-check
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
	site: "https://daryl.one",
	integrations: [
		tailwind(),
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
});
