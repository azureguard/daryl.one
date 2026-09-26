/**
 * Iconify ids for glyphs looked up from `cv.json` data at render time: a skill
 * domain name, or a profile network. Fixed UI glyphs are not here; call sites
 * name those directly (`<Icon name="lucide:moon" />`).
 *
 * astro-icon bundles only the ids listed in astro.config.ts, and it cannot see
 * `Icons[skill.name]`, so a new entry here must also be added there.
 */
const Icons: Record<string, string> = {
	// Skill domains, keyed by `skills[].name`.
	"Backend Development": "lucide:server",
	"CI/CD & Delivery": "lucide:workflow",
	"Cloud Architecture": "lucide:cloud-cog",
	"Cloud Security": "lucide:shield-check",
	"Data Engineering & MLOps": "lucide:database",
	"Frontend Development": "lucide:app-window",
	"Governance, Risk & Compliance": "lucide:scale",
	"Identity & Access Management": "lucide:key-round",

	// Profiles, keyed by `basics.profiles[].network`.
	GitHub: "simple-icons:github",
	LinkedIn: "simple-icons:linkedin",
};

export default Icons;
