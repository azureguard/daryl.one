import type { ISODate } from "./cv";

/**
 * Section eyebrow metadata for date-ranged entries, e.g. "2018 — present · 6 records".
 * An entry with no endDate marks the range as ongoing.
 */
export const rangeMeta = (entries: Array<{ startDate?: ISODate; endDate?: ISODate }>): string => {
	const startYears = entries.map(({ startDate }) => Number.parseInt(startDate ?? "", 10)).filter(Number.isFinite);
	const endYears = entries.map(({ endDate }) => Number.parseInt(endDate ?? "", 10)).filter(Number.isFinite);
	const firstYear = Math.min(...startYears);
	const lastYear = entries.some(({ endDate }) => !endDate) ? "present" : Math.max(...endYears);
	return `${firstYear} — ${lastYear} · ${entries.length} record${entries.length === 1 ? "" : "s"}`;
};
