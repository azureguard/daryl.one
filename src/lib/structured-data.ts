/**
 * schema.org JSON-LD, built from cv.json and the content frontmatter, typed by
 * schema-dts and rendered with astro-seo-schema's <Schema>. The Person is the
 * one entity the site is about; posts and case studies name it as author.
 */

import { basics, work } from "@cv";
import type { Article, BlogPosting, Person, WebSite, WithContext } from "schema-dts";

const { name, email, url, location, profiles } = basics;
const currentRole = work[0];

export const person: Person = {
	"@type": "Person",
	"@id": `${url}/#person`,
	name,
	url,
	email: `mailto:${email}`,
	...(currentRole && {
		jobTitle: currentRole.position,
		worksFor: { "@type": "Organization", name: currentRole.name, url: currentRole.url },
	}),
	address: { "@type": "PostalAddress", addressLocality: location.city, addressCountry: location.countryCode },
	sameAs: profiles.map((profile) => profile.url),
};

/** The landing page: the site, and the person it belongs to. */
export const websiteSchema: WithContext<WebSite> = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name,
	url,
	author: person,
};

/** The CV and About pages: the person on their own. */
export const personSchema: WithContext<Person> = { "@context": "https://schema.org", ...person };

interface Entry {
	title: string;
	description: string;
	date: Date;
	updated?: Date | undefined;
	tags?: Array<string> | undefined;
}

/** A post (`BlogPosting`) or a case study (`Article`). */
export function articleSchema(
	type: "BlogPosting" | "Article",
	entry: Entry,
	pageUrl: URL,
	image: URL,
): WithContext<BlogPosting | Article> {
	return {
		"@context": "https://schema.org",
		"@type": type,
		headline: entry.title,
		description: entry.description,
		datePublished: entry.date.toISOString(),
		...(entry.updated && { dateModified: entry.updated.toISOString() }),
		...(entry.tags?.length && { keywords: entry.tags.join(", ") }),
		url: pageUrl.href,
		mainEntityOfPage: pageUrl.href,
		image: image.href,
		author: person,
	} as WithContext<BlogPosting | Article>;
}
