# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `aube dev` - Start the dev server at localhost:4321. Note: with the Cloudflare
  adapter (Astro 6+) the dev server runs in Cloudflare's **workerd** runtime via
  `@cloudflare/vite-plugin`, not Node.
- `aube build` - Run `astro check` (type-check) then `astro build`. Output is a
  Cloudflare **Worker**: `dist/server/` (worker + generated `wrangler.json`) and
  `dist/client/` (static assets).
- `aube preview` - Preview the built Worker locally in workerd (`astro preview`).
- `aube preview:cf` - Run the built Worker under `wrangler dev` (builds first).

### Code Quality

- `aube lint` / `aube lint:fix` - Biome linter
- `aube format` / `aube format:fix` - Biome + Prettier

### Prerequisites

- **Node.js LTS+** and **aube+**, both managed by **mise** (`mise.toml`). Run
  `mise install` to provision them.
- `devEngines` in `package.json` pins `node` to match.

## Architecture

A personal portfolio: an Astro site rendered on-demand (`output: "server"`) and
deployed as a **Cloudflare Worker** (with static assets). It is functionally
static content, but uses the SSR adapter rather than a static export.

### Key Technologies

- **Astro 6** - SSR via the `@astrojs/cloudflare` adapter (Cloudflare Workers
  target; the adapter dropped Pages support in v13).
- **Tailwind CSS v4** - Utility-first CSS via the `@tailwindcss/vite` plugin.
  CSS-first config — there is **no `tailwind.config`**; theme tokens live in
  `src/styles/global.css`.
- **TypeScript 6** - `tsconfig.json` extends `astro/tsconfigs/strictest`. It uses
  relative `paths` and no `baseUrl`, so it's valid under both TS 6 and the TS 7
  native compiler.
- **JSON Resume Schema** - all content lives in `cv.json` (typed via `src/cv.d.ts`).
- **Cloudflare Workers** - deployment target; GitHub Actions handles CI/CD.

### Project Structure

```
src/
├── components/
│   ├── Section.astro      # Base section wrapper
│   ├── ThemeSwitch.astro  # System/dark/light <select> switcher
│   └── sections/          # Hero, About, Experience, Projects, Skills, Education
├── layouts/
│   └── Layout.astro       # SEO <head> + global base styles (see @layer note)
├── pages/
│   └── index.astro        # Single-page portfolio
├── styles/
│   └── global.css         # Tailwind v4 entry + theme tokens (light/dark)
├── icons.ts               # Name → Iconify icon id map
├── cv.d.ts / types.d.ts   # CV + global type definitions
astro.config.ts            # Integrations, adapter, vite/optimizeDeps
wrangler.toml              # Worker config (adapter reads it to emit dist/server/wrangler.json)
public/_headers            # Security/cache headers applied at the edge
.github/workflows/deploy.yaml  # CI/CD (build + deploy/preview)
```

### Content & Styling

- **Content**: edit `cv.json` (JSON Resume Schema). Icons are mapped in
  `src/icons.ts` and the Iconify collections are declared in `astro.config.ts`.
- **Theme system**: `src/styles/global.css` defines semantic CSS custom
  properties (`--color-text-base`, `--color-fill`, `--color-accent`,
  `--color-edge`, …) for `:root` (light) and `.dark` (dark). `@theme inline`
  maps them to Tailwind color tokens (`skin-base`, `skin-muted`, `skin-edge`,
  `skin-hue`, …) so utilities like `text-skin-hue`, `bg-skin-fill`,
  `ring-skin-edge` resolve at runtime. Dark mode is class-based via
  `@custom-variant dark (&:where(.dark, .dark *))`, toggled by `ThemeSwitch`.
  - `skin-muted` = muted **text** colour; `skin-edge` = the green-tinted
    surface/line colour used by rings, the timeline line and its dots. Keep them
    distinct — collapsing them removes the timeline's colour.

### Deployment

CI/CD lives in `.github/workflows/deploy.yaml` (runs on every push):

- **Production** (`main`): `wrangler deploy --config dist/server/wrangler.json`
  publishes the `cv` Worker.
- **Preview** (other branches): `wrangler versions upload … --assets ./dist/client`
  uploads a per-commit version and prints a preview URL
  (`<prefix>-cv.<subdomain>.workers.dev`) without touching production.
- A `concurrency` group cancels superseded preview runs but never interrupts a
  `main` deploy. Cloudflare steps only run when `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` secrets are present.
- **Manual step**: the `daryl.one` custom domain must be attached to the Worker
  in the Cloudflare dashboard.

## Code Style

- **Biome**: primary linter/formatter (120-char line width).
- **Prettier**: Astro files + YAML/Markdown overrides; sorts Tailwind classes
  (configured via `tailwindStylesheet` → `src/styles/global.css`).
- **Tabs** for indentation (spaces for YAML/TOML/Markdown).
- **lefthook** runs Biome + Prettier on staged files pre-commit.

## Important notes / gotchas

These are non-obvious and have bitten before:

- **Dev server is workerd.** A CJS dep re-optimized mid-request desyncs the
  workerd module runner ("module is not defined"). `astro.config.ts` pre-bundles
  the icon chain via `vite.optimizeDeps.include: ["astro-icon/components",
"@iconify/utils"]` to prevent it. `wrangler.toml` sets
  `compatibility_flags = ["nodejs_compat"]`.
- **Global CSS resets must be in `@layer base`.** In Tailwind v4 utilities live
  in `@layer utilities`, and _unlayered_ CSS beats any layer. The base resets in
  `Layout.astro`'s `<style is:global>` are wrapped in `@layer base` so they don't
  override utilities (e.g. `ul { list-style: none }` was killing `list-disc`).
- **`@apply` in component `<style>`** needs `@reference "../../styles/global.css"`
  (v4 requirement) — see Hero/Projects/Experience/Layout.
- **`wrangler versions upload` does not upload config-declared assets** (only
  `wrangler deploy` reads `assets.directory`). Previews must pass
  `--assets ./dist/client` explicitly, or they 404 with "assets have not been
  deployed yet". The adapter still emits the `ASSETS` binding either way.
- **`@iconify/utils` is pinned to `^2`** because `astro-icon` requires v2; v3
  would be a dead duplicate.
- **No dependency `overrides`.** Bump transitive deps with
  `aube update <pkg> --depth Infinity` / `aube dedupe` instead.
- **Sessions/Images bindings are intentionally off** (`session.driver` = an
  in-memory unstorage driver; `imageService: "passthrough"`) so the Worker only
  has the `ASSETS` binding.

## Architecture Patterns

- **Single page**: everything renders on `index.astro` from modular section
  components.
- **Responsive + print**: mobile-first with dedicated print styles.
- **Type safety**: TypeScript throughout, with CV data typed against `cv.d.ts`.
