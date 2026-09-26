import rss from "@astrojs/rss";
import { basics } from "@cv";
import type { APIContext } from "astro";
import { getPublished } from "@/lib/content";

// The blog's RSS feed, prerendered with the posts. Layout.astro advertises it
// with <link rel="alternate"> only while there are posts to list.
export const prerender = true;

export async function GET(context: APIContext) {
	const posts = await getPublished("blog");
	return rss({
		title: `${basics.name} - Blog`,
		description: "Notes on cloud security, detection engineering, and reviewable systems.",
		site: context.site ?? basics.url,
		items: posts.map(({ id, data }) => ({
			title: data.title,
			description: data.description,
			pubDate: data.date,
			link: `/blog/${id}`,
			categories: data.tags,
		})),
		customData: "<language>en</language>",
	});
}
