# Decisions log

Standing decisions and why. If something here looks like an oversight, it
isn't: read the entry before "fixing" it. How to work with the code is in
`CLAUDE.md`; this file only records reasons and what was declined.

## Stack

- **No UI framework.** React + React Aria cost 131.6 KB gzip for two elements
  native HTML already covers; removing them left 7.9 KB of JS in total. React
  Aria's `usePress` also stopped click propagation, breaking ClientRouter
  navigation. Swapping to another React primitives library would save little,
  since React itself was ~87% of the cost. Reconsider only for a component that
  needs one (a combobox, a date picker), and hydrate just that.
- **Behaviour comes from Zag.js via its vanilla adapter.** The DS asks for Ark
  UI anatomy, but every Ark package is a framework binding; Zag is the machine
  layer Ark wraps, so we get the same anatomy and recipes with no runtime.
  Solid or Svelte islands would add a runtime to hydrate a handful of controls.
  Trade-off accepted: without JavaScript, a collapsed Timeline role stays
  collapsed on screen (print shows everything).
- **No utility engine** (Tailwind removed, UnoCSS not reintroduced). The DS
  ships tokens and CSS recipes; utilities would only restate them. Cascade
  layers replace specificity rules.
- **Component kits declined.** Most of the surface (Timeline, the ATS print
  sheet, CopyEmail, ThemeSwitch) has no kit equivalent, and the DS rules out
  "kit filler".
- **Fonts self-hosted through fontsource**, since the DS's Google Fonts CDN is
  forbidden by the CSP.

## Delivery

- **Prerendered, with an on-demand 404.** Pages are served from Cloudflare's
  asset cache; the 404 renders in the Worker for its real status and path.
  Prerendering is also what lets the sitemap list posts and case studies.
  File output with no trailing slash keeps canonical and sitemap URLs
  identical.
- **CSP: `'unsafe-inline'` for styles only.** Static HTML carries `_headers`'
  CSP, which blocked ClientRouter's transition style and Shiki's token styles.
  The site accepts no user input, so inline styles carry little risk;
  `script-src` stays strict. Declined: nonces (they need the Worker on every
  request, can't cover style attributes, and break ClientRouter navigation)
  and Astro's own CSP (it supports neither ClientRouter nor Shiki).
- **SEO through libraries** (astro-seo, astro-seo-schema, astro-og-canvas,
  @astrojs/rss, @astrojs/sitemap, astro-robots-txt). Fixed pages share one
  preview card built from `cv.json`, rather than a registry that restates each
  page's copy.
- **The head theme script is inline, allowed by its CSP hash.** As a bundled
  module it ran after first paint (dark-preference visitors saw light, then
  every colour transition). Declined: an external classic script (a
  render-blocking request) and a CSS-only system default (duplicates the DS's
  dark tokens and still flashes a stored choice). Also declined: sharing its
  code with ThemeSwitch, which an inline script can't import.
- **Stylesheets inline into every page.** Linked, they were a render-blocking
  round trip ahead of the fonts; brotli'd, the inlined CSS costs ~7KB per page
  and mobile FCP fell by ~0.3–0.5s.

## Information architecture

- **`/` is a router, `/about` is terminal.** The landing page is built to be
  left; `/about` is first-person. The split is register, not subject.
- **Nav order: CV, Projects, Blog, About, Uses.** `/projects` lists every
  `cv.json` project and is never empty, so it isn't gated. The blog appears
  only once a post is published: an empty "Audit trail" is a dead end.
- **The footer is site-wide.** It's the only place the contact links live, so
  a reader arriving on a post from search still has a route to them.
- **Case studies are Markdown, like the blog** (nothing needs MDX yet),
  linked from their project's card. The fact sheet is a condensed-caps `<dl>`,
  since mono is for code and logs only.
- **Gallery is parked as future scope**: in the DS, not on the site, and in no
  nav.

## CV and print

- **Print is for the CV only.** The CV is the document people print; other
  pages get browser defaults.
- **On paper: Plex Sans and ink.** Big Shoulders reads as a poster on a
  printed CV, and the ATS-tested layout was built around the sans.
- **Dates differ between screen and print.** On paper the date sits in flow
  on the title row, because ATS parsers read the PDF in DOM order. On screen,
  Experience keeps its left date rail (the Timeline's whole idea), while
  Education stays right-aligned (a two-item list doesn't need timeline
  furniture).
- **No photo on `/cv`.** Singapore, UK and US recruiters don't expect one, and
  it adds nothing to ATS extraction. An application that wants one (common in
  German-speaking Europe, Japan and Korea) should get a print variant with a
  passport crop, not a web avatar.
- **Eyebrows are classifiers** ("Audit log" over Experience), never
  restatements. They are aria-hidden and print-hidden, so the wordplay never
  reaches a screen reader or paper.
- **The employer line is sans body text, not a label.** It's the most
  scannable fact on a CV.

## Components

- **The active nav link is an underline, not a chip.** Chips are Badge's
  language, and "you are here" would read as a tag.
- **The nav is not `transition:persist`-ed**, which would freeze
  `aria-current` at the first page rendered.
- **The floating dock reserves its footprint** (`--dock-clearance`) instead of
  hiding near the footer, where back-to-top is actually used.
- **In the nav below ~560px, the theme trigger stays icon-only.** Sliding its
  label out grew it over the links; the open menu shows every label.
- **Post navigation is two stacked rows:** "previous" is the older post and
  "next" the newer one, matching the newest-first index. Full-width rows keep
  titles from wrapping, and the arrows sit on the label row, never beside a
  title that might wrap.
- **Inline code wraps mid-token and code blocks scroll.** Declined
  `box-decoration-break: clone`, which makes one wrapped identifier look like
  two.
- **The About portrait sits right of the story**, as in the DS; phones show
  the text first. A placeholder glyph stands in until a plain, naturally-lit
  headshot exists (the studio portrait was off the DS brief).
- **Ongoing technical leadership is a duty, not an era** on About: marking the
  Technical leadership era as still active would contradict the CV's end date.

## Accessibility

- **Heading levels are structural.** The Hero tagline is a `<p>`: as an `h2`
  it pushed every real section down a level.
- **The copy-email live region starts empty.** A live region only announces
  when its content changes; the script writes "copied" in and clears it.
- **Declined: moving focus to `<main>` on navigation.** ClientRouter already
  announces the route, auto-moving focus is contested practice, and the skip
  link covers keyboard users.
- **Declined: trimming fontsource to latin-only subsets.** `unicode-range`
  already limits downloads to the subsets a page uses, and the per-subset
  entrypoints drop glyphs for accented names.

## Design system

- **The Claude Design project is the source of truth**; settled site
  decisions are synced back to it, not left to drift.
- **One reference per page**: the DS templates mirror the live pages, and the
  Brand card is the landing page's. The DS's duplicate UI kit was dropped.
- **The DW monogram is the brand mark**, favicon included; the lime circuit
  logo is retired.
- **DS components the site doesn't render are kept** (forms, Tabs, Alert,
  Divider, IconLink, the security set), for future pages and a possible
  Storybook.

## Known gaps

- **Volunteer, Interests and References never render**: `cv.json` has no data
  for them. The components are wired.
- **The 2018–2019 Ensign internship is left out** of About's three-era
  narrative, deliberately.
