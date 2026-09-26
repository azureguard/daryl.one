import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { parseCvss } from "./lib/cvss";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		// A CVSS vector string (2.0, 3.x or 4.0). Scored at build time into
		// { vector, version, score, severity }; an invalid vector fails the build.
		cvss: z
			.string()
			.optional()
			.transform((vector, ctx) => {
				if (vector === undefined) return undefined;
				const cvss = parseCvss(vector);
				if (!cvss) ctx.addIssue({ code: "custom", message: `Not a valid CVSS vector: "${vector}"` });
				return cvss;
			}),
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
