/** Shared helpers for the blog index, the post page and the homepage strip. */

import { getCollection } from "astro:content";

const WORDS_PER_MINUTE = 210;

/** Every non-draft post, newest first. The one definition of "the blog". */
export async function getPublishedPosts() {
	const posts = await getCollection("blog", ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The subset of a post's data the prev/next pair needs to render. */
export interface AdjacentPost {
	id: string;
	title: string;
	date: Date;
}

/**
 * The posts either side of `id` in publication order. "previous" is the OLDER
 * post and "next" the NEWER one — reading order down the log, matching the
 * newest-first index rather than array position.
 *
 * Drafts are excluded, so removing a post from the sequence closes the gap
 * instead of leaving a link to a 404. Fields are `| undefined` rather than
 * optional to stay assignable under exactOptionalPropertyTypes.
 */
export async function getAdjacentPosts(id: string): Promise<{
	previous: AdjacentPost | undefined;
	next: AdjacentPost | undefined;
}> {
	const posts = await getPublishedPosts();

	const index = posts.findIndex((post) => post.id === id);
	const at = (offset: number): AdjacentPost | undefined => {
		const post = index === -1 ? undefined : posts[index + offset];
		return post ? { id: post.id, title: post.data.title, date: post.data.date } : undefined;
	};

	return { previous: at(1), next: at(-1) };
}

/** Derive a "N min read" mono label from a Markdown body's word count. */
export function readTime(body: string): string {
	const words = body.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
	return `${minutes} min read`;
}

/** ISO date (YYYY-MM-DD), deterministic across locales/timezones for workerd. */
export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
