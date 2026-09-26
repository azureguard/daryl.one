import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import cv from "./cv.json";
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

// Project case studies: one per cv.json project at most, linked from that
// project's card on /cv. `project` must name a cv.json project exactly, so a
// renamed project fails the build instead of silently losing its link. The
// fact sheet fields render as the page's header <dl>.
const projectNames = cv.projects.map(({ name }) => name);

const projects = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		project: z.string().refine((name) => projectNames.includes(name), {
			message: `Must name a cv.json project: ${projectNames.join(", ")}`,
		}),
		role: z.string(),
		scope: z.string(),
		stack: z.array(z.string()),
		/** Free text, e.g. "2024 – Present". */
		period: z.string(),
		outcomes: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
		tags: z.array(z.string()).optional(),
		/** Orders case studies; newest first. */
		date: z.coerce.date(),
		draft: z.boolean().optional().default(false),
	}),
});

export const collections = { blog, projects, uses };
