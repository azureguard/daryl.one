import { OGImageRoute } from "astro-og-canvas";
import { ogPages } from "@/lib/og";

// The 1200×630 preview images (src/lib/og.ts: a shared site card, and one per
// post and case study), rendered at build time by astro-og-canvas (CanvasKit)
// and served as static assets at /og/<key>.png.
// Layout.astro points og:image and twitter:image at it. The Night Shift field:
// pine-black ground, a sodium edge, the headline in Big Shoulders at 900
// (upper-case, as on the site), the description in Plex Sans. The fonts are
// static instances cut from the fontsource variable files (both OFL), because
// CanvasKit reads TTF, not woff2.
export const prerender = true;

const pineBlack: [number, number, number] = [6, 17, 12];
const sodium: [number, number, number] = [255, 171, 46];

export const { getStaticPaths, GET } = await OGImageRoute({
	pages: await ogPages(),
	getImageOptions: (_path, page) => ({
		title: page.heading.toUpperCase(),
		description: page.description,
		logo: { path: "./src/assets/og/dw.png", size: [96] },
		bgGradient: [pineBlack],
		border: { color: sodium, width: 12, side: "inline-start" },
		padding: 72,
		fonts: ["./src/assets/og/big-shoulders-display-900.ttf", "./src/assets/og/ibm-plex-sans-400.ttf"],
		font: {
			title: { families: ["Big Shoulders Display"], weight: "Black", size: 96, lineHeight: 1, color: [214, 237, 225] },
			description: { families: ["IBM Plex Sans"], weight: "Normal", size: 34, lineHeight: 1.4, color: [134, 168, 152] },
		},
	}),
});
