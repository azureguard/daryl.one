// Applies the theme class before first paint, so there is no flash of the
// wrong theme (and no colour transitions running from it). It is a classic
// inline script because a bundled one is a deferred module, which runs after
// first paint. The CSP allows it by hash, added to `_headers` at build
// (astro.config.ts). ThemeSwitch.astro owns changes after load; both read the
// same "theme" localStorage key.
//
// Astro's swap copies the NEW document's <html> attributes over the old one,
// which drops the class this script added, and head scripts do not re-run
// after a navigation. So the class is also applied to `newDocument` in
// astro:before-swap, which fires before the swap and before paint. The
// listener sits on `document`, which persists.
{
	const resolveTheme = () => {
		// Storage access throws where it is blocked; fall back to the system theme.
		try {
			const stored = localStorage.getItem("theme");
			if (stored === "dark" || stored === "light") return stored;
		} catch {}
		return matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	};

	const applyTheme = (target) => {
		target.documentElement.classList.remove("light", "dark");
		target.documentElement.classList.add(resolveTheme());
	};

	applyTheme(document);

	document.addEventListener("astro:before-swap", (event) => {
		applyTheme(event.newDocument);
	});
}
