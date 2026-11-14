# CLAUDE.md

Guidance for Claude Code in this repository. The reasoning behind decisions
(including what was declined) is in `plans/decisions-log.md`.

## Commands

- `aube dev` - dev server at localhost:4321. Runs in Cloudflare's **workerd**
  (via `@cloudflare/vite-plugin`), not Node.
- `aube build` - generates `src/cv.d.ts`, runs `astro check`, then `astro build`
  into `dist/server/` (Worker + generated `wrangler.json`) and `dist/client/`
  (static assets). **Check the exit code, not the log**: it prints
  "✓ Completed" for intermediate steps even when a later one fails.
- `aube exec astro preview` - serve the built Worker in workerd, with
  `public/_headers` applied (the way to test CSP). Stop with
  `astro preview stop`; `pkill` does not match, and a stale server keeps
  serving the previous build.
- `aube format` / `aube format:fix` - Biome (lefthook runs it pre-commit).
- Node and aube are pinned by mise (`mise install`).

## Architecture

A personal portfolio deployed as a **Cloudflare Worker** with static assets.
Every page is **prerendered** (`build.format: "file"`, `trailingSlash:
"never"`) and served from Cloudflare's asset cache; only the 404 renders on
demand in the Worker, for its real status and the requested path.

- **Astro, no UI framework** (no React, islands or `client:*`; React + React
  Aria were removed deliberately). Interactive controls are **Zag.js** machines
  (`@zag-js/vanilla`, the state machines behind Ark UI): the server renders the
  Ark anatomy (`data-scope` / `data-part` / `data-state`, ids), styled before
  any script runs, and the machine adopts it. In use: `clipboard` (CopyEmail),
  `collapsible` (Timeline), `select` (ThemeSwitch), `popover` (SeverityBadge).
- **Plain CSS in cascade layers**: `tokens` → `base` → `recipes` are layered in
  `global.css`; component `<style>` blocks and `print.css` are unlayered, so
  they beat every layer without specificity games.
- **Content**: `src/cv.json` (JSON Resume, typed by the generated `cv.d.ts`,
  imported as `@cv`; under `src/` because a root `cv.json` shadows the `/cv`
  route in dev). Collections in `src/content/`: `blog/`, `projects/` (case
  studies), `uses/`. Glyphs looked up from `cv.json` data are mapped in
  `src/icons.ts`.
- **TypeScript 6**, `astro/tsconfigs/strictest` (held at 6: `@astrojs/check`
  peers on `^5 || ^6`, and TS 7 has no JS API for the language server).

### Where things are

```
src/
├── layouts/Layout.astro       # <head> (astro-seo, JSON-LD), theme script, beforeprint handler
├── layouts/SiteLayout.astro   # skip link, nav, <main> measure, footer; pages pass title/description/gap
├── components/                # PageHeader (eyebrow prop/slot, lede, `after` slot), Section, Timeline,
│                              # ProjectCards (CV + /projects), LogBlock (404), SiteNav, ThemeSwitch, ...
├── pages/[blog].astro         # /blog index; [uses].astro likewise (see Content gating)
├── pages/og/[...route].ts     # preview images (astro-og-canvas); data in lib/og.ts
├── pages/rss.xml.ts           # @astrojs/rss
├── lib/content.ts             # getPublished(blog|projects), getAdjacentPosts, readTime, formatDate
├── lib/structured-data.ts     # JSON-LD (schema-dts types)
├── lib/url.ts                 # pagePath(): a page's public path (see gotchas)
├── scripts/zag.ts             # onEachPage(): mounts Zag machines per page, stops them per swap
└── styles/                    # global.css, print.css, tokens/, recipes/ (DS copies), atmosphere/
public/_headers                # CSP and cache headers (apply to prerendered HTML too)
```

### Design system

Source of truth: the Claude Design project **"Daryl Wong Design System"**
("Night Shift": sodium amber on pine-black, atmosphere backgrounds, square
shapes with a chamfered corner, Big Shoulders Display for headings and labels,
IBM Plex Sans for prose, Plex Mono for code only).

- `src/styles/tokens/` and `recipes/` are verbatim copies of the project's
  (each header notes its deviations). Re-sync by diffing, not rewriting.
- Recipes key on Ark anatomy, so a native element takes one by attribute:
  `<a data-scope="button" data-part="root" data-variant="secondary" data-size="sm">`,
  `<span data-scope="badge" data-tone="accent">`. `.label` in `global.css` is
  the one shared class (condensed-caps labels).
- The DS's `data:` atmosphere tiles are forbidden by `default-src 'self'`;
  they live as files in `src/styles/atmosphere/`.
- The DS templates mirror the live pages; when a page changes here, update its
  template. The landing page's reference is `brand/night-shift.card.html`.
  Gallery is parked as future scope; unused DS components (forms, Tabs, Alert,
  Divider, IconLink, the security set) are kept on purpose.
- **The DS's `_ds_bundle.js` and `_ds_manifest.json` are build output**, never
  rebuilt by Claude Design: a changed `.jsx` keeps its old render and a deleted
  card 404s in the pane until both are regenerated and uploaded. Tooling lives
  in `../design-sync/` (`npm run build`; `templates.py` generates the page
  templates) against its `mirror/` copy of the project.
- **DS card metadata comes from the files**: the `<!-- @dsCard -->` comment,
  and for a single-component card the first sentence of its `.prompt.md`
  (edit the description, not the subtitle). Guideline cards read live tokens.

### Content rules

- **Theme**: components use the semantic layer (`--surface-*`, `--text-*`,
  `--border-*`), never raw hex. `--color-accent` is for text and lines,
  `--color-signal` for fills (not legible as text on light). `ThemeSwitch`
  toggles `.dark` on `<html>`.
- **CVSS on posts**: `cvss: "CVSS:3.1/…"` is scored at build (`lib/cvss.ts`),
  so SeverityBadge's colour follows the score and a bad vector fails the
  build. Its breakdown is a Popover (not a tooltip, which touch can't reach),
  omitted where the badge sits inside a link.
- **Case studies** (`src/content/projects/`): `project` must name a `cv.json`
  project exactly (build fails otherwise); that project's card links to it on
  `/cv` and `/projects`. Drafts are not built.
- **Content gating**: blog routes, the nav link, the homepage row and the RSS
  `<link rel="alternate">` exist only while `getPublished("blog")` is
  non-empty; `/uses`, its nav link and homepage row only while the `uses`
  collection is. `/blog` and `/uses` are `[blog].astro` / `[uses].astro`,
  dynamic routes so they can yield no path and fall through to the 404 (a
  prerendered page cannot rewrite to the on-demand 404).
- **SEO**: libraries, not hand-built tags. astro-seo (head), astro-seo-schema
  (JSON-LD: WebSite on `/`, Person on `/cv`, BlogPosting/Article), astro-og-canvas
  (a site card from `cv.json` shared by fixed pages, one per post and case
  study), @astrojs/sitemap, @astrojs/rss. `robots.txt` is a static file in
  `public/` (it names the sitemap; crawler policy is Cloudflare's). Pages keep their
  own titles and ledes.
- **External Markdown links** get `target="_blank"`, `rel="noopener
  noreferrer"` and the aria-hidden `charm:link-external` glyph via
  `rehype-external-links`; hand-written external links do the same themselves.

### Patterns

- **One orchestrated load per page**: `data-reveal` (rise), `="declassify"`
  (headline bar wipe), `="scan"` (scanline), ordered with `data-i`. Reduced
  motion is one block in `tokens/interaction.css` that zeroes every duration
  and delay.
- **Print is for the CV only**: `print.css` plus rules in the components `/cv`
  renders. No print rules or `data-print` elsewhere. On paper the display face
  and accent collapse to Plex Sans and ink via token overrides.
- **Heading levels are structural**: page `h1`, `Section.astro`'s `h2`, entries
  `h3`. The Hero tagline is a `<p>` for that reason.

## Deployment

`.github/workflows/deploy.yaml`, on every push:

- `main`: `wrangler deploy --config dist/server/wrangler.json` (the `cv` Worker).
- Other branches: `wrangler versions upload … --assets ./dist/client`, a
  per-commit preview URL. `versions upload` ignores config-declared assets, so
  the `--assets` flag is required or previews 404.
- The repository enforces a workflow lockfile: after changing any `uses:`, run
  `gh actions-lock` and commit `.github/workflows/actions.lock`, or the run
  fails at startup.
- Cloudflare steps need `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`. The
  `daryl.one` domain is attached to the Worker by hand in the dashboard.
- **CI builds without any `src/content`** (untracked: blog, case studies,
  uses). Check changes against empty collections: move `src/content` aside,
  build, move it back.

## Code style

Biome, 120-char lines (it reformats the DS CSS copies; values stay verbatim).
Tabs (spaces in YAML/TOML/Markdown). No dependency `overrides`. To bump
transitive deps (`aube audit`), re-resolve the lockfile: `rm aube-lock.yaml &&
aube install --resolution-mode highest --no-frozen-lockfile` (`aube update`
only refreshes direct deps). Node follows mise's `lts`; `devEngines` in
`package.json` must admit it, or CI's install fails.

## Gotchas

These have bitten before.

**Build and runtime**
- **Prerendered pages see their output file as `Astro.url.pathname`**
  (`/cv.html`). Use `pagePath(Astro.url)` for anything that compares or
  publishes a path (canonical, og:image, JSON-LD, nav active link).
- **Prerendering runs in Node** (`prerenderEnvironment: "node"`) because
  CanvasKit (preview images) can't load in workerd. `canvaskit-wasm` must be a
  direct dependency, or the build dies with "__dirname is not defined".
- **CSP reaches the HTML** (it's a static asset). `script-src 'self'` is strict
  except for one hash: the head's `src/scripts/theme-init.js`, inlined because a
  bundled `<script>` is a deferred module that runs after first paint (a theme
  flash, and every colour transition firing). A build hook in `astro.config.ts`
  adds its hash to the built `_headers`. `_headers` never applies to a Worker
  response, so `404.astro` sets the same `/*` block on itself. `style-src` allows `'unsafe-inline'`
  for the ClientRouter transition and Shiki (reasons in the decisions log). Our
  own code still writes no inline style attributes: reveal order is `data-i`,
  not `style="--i"`.
- **Stylesheets are inlined** (`inlineStylesheets: "always"`); `"auto"` would
  inline nothing, since it keys on `assetsInlineLimit`, which is 0 for scripts.
  Local preview serves HTML uncompressed, so judge Lighthouse there by
  compressed size, not its FCP.
- **Animate `transform` and `opacity` only** (a DS rule, in `tokens/motion.css`).
  Keyframes on `box-shadow` or `top` repaint every frame, and `top` counts as
  layout shift; the severity flash and scanline are the worked examples.
- **Dev is workerd.** A CJS dep re-optimized mid-request desyncs it ("module is
  not defined"); `vite.optimizeDeps.include` pre-bundles the icon deps for that.
- **`aube build` while `aube dev` runs breaks dev** (every route 500s,
  `deps_ssr/... does not exist`). Afterwards: `aube exec astro dev stop && rm -rf
  node_modules/.vite && aube dev`.
- **The content cache doesn't see `content.config.ts` helpers** (e.g.
  `lib/cvss.ts`) or Markdown plugin changes. Stale entries render wrong or die
  mid-stream: stop dev, delete `.astro/data-store.json` and
  `node_modules/.astro/data-store.json`, restart.
- **A CSS `@import` added before its file exists stays broken in dev** (served
  as a 500) until `astro dev` restarts.
- **astro-icon bundles only listed icons**: `astro.config.ts`'s `include` must
  name every glyph, including those `icons.ts` looks up from `cv.json`. Size
  SVGs with a scoped rule, never inline `style`.
- **Sessions and Images bindings are off** (in-memory session driver,
  `imageService: "compile"`), so the Worker has only `ASSETS`.

**Markup and CSS**
- **An author `display` beats the UA's `[hidden]`.** Zag hides closed content
  with `hidden`; restate `[hidden] { display: none }` (screen-only) next to any
  `display` on such an element.
- **`hidden` doesn't hide an `<svg>`**; put it on a wrapping `<span>`.
- **Zag machines mount per page**, not per load: register with `onEachPage()`
  and pass the server-rendered ids via the machine's `ids` prop.
- **Client-side navigation replaces `<html>`'s attributes**; `Layout.astro`
  re-applies the theme class in `astro:before-swap`. Anything else that must
  survive navigation belongs in a listener on `document` / `window`.
- **Zag select's positioner is deliberately not bound**: its inline
  `top`/`left` would fight the recipe's CSS positioning.
- **The floating dock needs clearance**: the select recipe pads `body` by
  `--dock-clearance`, or the footer links sit under it on phones.
- **`scrollbar-gutter: stable` on `<html>` and `overflow-wrap: anywhere` on
  inline `code` are load-bearing** (no ~15px shift between routes; one long
  identifier otherwise scrolls the whole page).
- **Shiki**: `defaultColor: false` makes it emit `--shiki-light` /
  `--shiki-dark`, which `global.css` picks per theme.
- **Biome's Astro parser rejects `{/* … */}` in element-child position**; put
  element-level comments in the frontmatter.
- **`<pre>` keeps the template's indentation**; write its content tight.

**Print (CV)**
- **Firefox prints a running animation at its current frame**, so a t=0 print
  lost every mid-reveal element. `Layout.astro` finishes finite animations on
  `beforeprint`; still check a Firefox print at t=0 (and re-print after a
  dependency change, whose Vite reload also blanks it).
- **Firefox paints chamfer gradients as solid blocks on paper**; the print
  sheet drops every `background-image`, so keep gradients decorative and in the
  layers.
- **Print precedence comes from layers**: `print.css` is unlayered and must
  not reach into components (order would decide); a component's print rules go
  in its own `<style>` after its screen rules. `[data-print="hidden"|"only"]`
  are the only `!important` switches.
- **Container queries are switched off on paper**: Timeline's print block
  resets `container-type: normal` for the stacked, ATS-readable order (Firefox
  also drops a contained block that spans a page break).
