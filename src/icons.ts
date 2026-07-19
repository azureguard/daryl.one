const Icons: Record<string, string> = {
	// Skill domains (looked up by name from cv.json skills)
	"Backend Development": "lucide:server",
	"CI/CD & Delivery": "lucide:workflow",
	"Cloud Architecture": "lucide:cloud-cog",
	"Cloud Security": "lucide:shield-check",
	"Data Engineering & MLOps": "lucide:database",
	"Frontend Development": "lucide:app-window",
	"Governance, Risk & Compliance": "lucide:scale",
	"Identity & Access Management": "lucide:key-round",
	// Profiles (looked up by network from cv.json basics.profiles)
	GitHub: "simple-icons:github",
	LinkedIn: "simple-icons:linkedin",
	// UI glyphs
	Certificate: "charm:certificate",
	Email: "charm:mail",
	Globe: "charm:globe",
	Graduate: "charm:graduate-cap",
	Link: "charm:link-external",
	ThemeSwitch: "lucide:sun-moon",
};

export default Icons;
