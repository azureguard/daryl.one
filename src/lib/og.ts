/**
 * The preview images (/og/<key>.png), from data that already exists: one site
 * card from cv.json shared by every fixed page, and one per post and case
 * study from its frontmatter. Nothing here restates a page's own copy.
 */

import { basics } from "@cv";
import { getPublished } from "./content";

export interface OgPage {
	heading: string;
	description: string;
}

/** Every preview image, keyed by its path under /og/ (without `.png`). */
export async function ogPages(): Promise<Record<string, OgPage>> {
	const [posts, caseStudies] = await Promise.all([
		getPublished("blog"),
		getPublished("projects"),
	]);
	return {
		site: { heading: basics.name, description: basics.label },
		...Object.fromEntries(
			posts.map(({ id, data }) => [
				`blog/${id}`,
				{ heading: data.title, description: data.description },
			]),
		),
		...Object.fromEntries(
			caseStudies.map(({ id, data }) => [
				`projects/${id}`,
				{ heading: data.title, description: data.description },
			]),
		),
	};
}

/** The image for a page: its own when it has one, otherwise the site card. */
export async function ogImageFor(
	pathname: string,
	site: URL | undefined,
): Promise<URL> {
	const key = pathname.replace(/^\/|\/$/g, "");
	return new URL(
		`/og/${Object.hasOwn(await ogPages(), key) ? key : "site"}.png`,
		site,
	);
}
