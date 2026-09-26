import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		draft: z.boolean().optional().default(false),
	}),
});

// One entry per tool/item rather than a single data doc, so /uses can grow by
// dropping in a file (matches the blog's authoring model) and each item can
// carry its own category/link.
const uses = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/uses" }),
	schema: z.object({
		title: z.string(),
		category: z.string(),
		description: z.string(),
		url: z.url().optional(),
		// Manual sort weight within a category; lower sorts first. Items
		// without one fall back to alphabetical by title.
		order: z.number().optional(),
	}),
});

export const collections = { blog, uses };
