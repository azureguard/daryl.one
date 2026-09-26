/**
 * CVSS metadata for blog posts. A post states only its vector string; the
 * version, score and severity are derived from it, so they can never
 * disagree. Parsing and scoring use the {metæffekt} calculator
 * (ae-cvss-calculator), which implements CVSS 2.0, 3.0, 3.1 and 4.0 as FIRST
 * specifies them. This runs in the content layer at build time: the library
 * never reaches the Worker or the browser.
 */
import * as calculator from "ae-cvss-calculator";

// The package ships a UMD bundle. Vite's module runner exposes a CommonJS
// module's exports only as its default export, so named imports fail there.
const { fromVector } = (calculator as { default?: typeof calculator }).default ?? calculator;

/** The DS SeverityBadge levels (recipes/badge.css `data-severity`). */
export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Cvss {
	/** The vector as written, e.g. "CVSS:3.1/AV:N/AC:L/…". */
	vector: string;
	/** "CVSS:3.1", "CVSS:4.0", … */
	version: string;
	/** Overall score, 0.0–10.0. */
	score: number;
	severity: Severity;
	/**
	 * The metrics the vector sets, named by the specification and grouped by
	 * its subcategories ("Exploitability Metrics", "Vulnerable System Impact",
	 * …). The grouping matters for 4.0, which names Confidentiality, Integrity
	 * and Availability once per impacted system.
	 */
	groups: Array<{ name: string; metrics: Array<{ name: string; value: string }> }>;
}

/**
 * FIRST's qualitative rating scale (identical for 3.x and 4.0). "None" (0.0)
 * maps onto the DS's `info` level, its lowest.
 */
function severityOf(score: number): Severity {
	if (score >= 9) return "critical";
	if (score >= 7) return "high";
	if (score >= 4) return "medium";
	if (score > 0) return "low";
	return "info";
}

/** Scores a vector, or returns `undefined` if it is not a valid CVSS vector. */
export function parseCvss(vector: string): Cvss | undefined {
	const parsed = fromVector(vector.trim());
	if (!parsed) return undefined;
	const score = parsed.calculateScores().overall;
	if (!Number.isFinite(score)) return undefined;

	// The parsed vector carries every metric of its version; keep the ones the
	// string actually sets, in specification order, with their full names.
	const stated = new Set(vector.trim().split("/"));
	const groups: Cvss["groups"] = [];
	for (const [component, value] of parsed.getComponents()) {
		if (!stated.has(`${component.shortName}:${value.shortName}`)) continue;
		const name = component.subCategory ?? "Metrics";
		let group = groups.find((existing) => existing.name === name);
		if (!group) {
			group = { name, metrics: [] };
			groups.push(group);
		}
		group.metrics.push({ name: component.name, value: value.name });
	}

	return { vector: vector.trim(), version: parsed.getVectorName(), score, severity: severityOf(score), groups };
}
