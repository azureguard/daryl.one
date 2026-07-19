// Generates src/cv.d.ts from @jsonresume/schema's schema.json (the JSON
// Resume spec: https://jsonresume.org/schema). The package ships the schema
// but no TypeScript types, so this compiles them with json-schema-to-typescript.
//
// The array-of-object sections below have no `title`, so json-schema-to-typescript
// would otherwise inline them anonymously instead of emitting the named types
// (Work, Volunteer, ...) that components import by name. Everything else is
// left as the schema defines it, so upstream schema changes flow straight
// through instead of silently drifting from hand-tuned overrides here.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { compile } from "json-schema-to-typescript";

const outFile = fileURLToPath(new URL("../src/cv.d.ts", import.meta.url));

const schemaUrl = import.meta.resolve("@jsonresume/schema/schema.json");
const schema = JSON.parse(await readFile(fileURLToPath(schemaUrl), "utf-8"));

schema.definitions.iso8601.title = "ISODate";

const { properties } = schema;
for (const [key, title] of Object.entries({
	work: "Work",
	volunteer: "Volunteer",
	languages: "Language",
	interests: "Interest",
	references: "Reference",
	projects: "Project",
})) {
	properties[key].items.title = title;
}

const ts = await compile(schema, "CV", {
	bannerComment: [
		"/**",
		" * Generated from @jsonresume/schema's schema.json (https://jsonresume.org/schema).",
		" * Run `aube generate:cv-types` to regenerate. Do not edit by hand.",
		" */",
	].join("\n"),
});

await writeFile(outFile, ts);
