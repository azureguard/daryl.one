# Decisions log

Standing decisions behind the site's design and build, with the reasoning.
If you are about to "fix" something on this list, read the entry first: most
of these look like oversights and are not.

The newest section is first. Sections below it record the `design-system-full`
branch that preceded the rebuild. Where the rebuild superseded a decision, the
section says so; everything else still stands. The audit and verification
reports those sections cite lived on that branch and were not carried over.

## Night Shift rebuild (2026-09-26)

`design-system-full` had gone through React + React Aria, back out, then
UnoCSS, and was hard to follow. The Claude Design project "Daryl Wong Design
System" had meanwhile moved to its 2026-09 "Night Shift" direction. The site was
rebuilt on a fresh branch from `main`, carrying across only what that branch had
settled (IA, heading levels, the ATS print layout, the theme script, CopyEmail's
live region, blog helpers).

- **Headless behaviour is Zag.js, through its vanilla adapter.** The DS's
  `CONVENTIONS.md` rule 6 asks for Ark UI anatomy with CSS recipes keyed on
  `data-scope` / `data-part` / `data-state`. Every Ark UI package is a framework
  binding (React, Solid, Vue, Svelte), and the framework entry below records
  why React is not coming back. Zag is the state-machine layer Ark wraps, and
  `@zag-js/vanilla` binds it to plain DOM: same machines, same anatomy, same
  recipes, no framework runtime. Solid and Svelte islands were the
  alternatives; both add a runtime to hydrate two controls.
- **Library behaviour over hand-written behaviour.** CopyEmail is Zag's
  clipboard machine and the Timeline highlights are its collapsible, replacing
  a hand-rolled click handler and native `<details>` with a `beforeprint`
  fallback.
  - Trade-off: without JavaScript a collapsed role's highlights stay hidden on
    screen, where `<details>` opened natively. Print is unaffected (the print
    sheet shows all content), and the current role renders open.
- **ThemeSwitch was the one hand-written control** (superseded in the
  follow-up below: the DS moved it to a Select, which Zag models).
- **No utility engine.** The DS ships its styling as tokens plus CSS recipes,
  so a utility layer would only restate them. Tailwind is removed; UnoCSS was
  not reintroduced. Components use scoped `<style>`. This supersedes "CSS
  engine: UnoCSS" below, including its icon masks, preflights and blocklist.
- **Icons are astro-icon again.** Mask icons were a UnoCSS preset. astro-icon
  renders inline SVG at build time and now depends on `@iconify/utils` v3, so
  the old v2 pin is gone.
- **Fonts stay self-hosted.** The DS loads Big Shoulders Display and IBM Plex
  from the Google Fonts CDN, which `style-src 'self'` forbids; fontsource
  serves the same families.
- **The print CV stays in Plex Sans and ink.** The print sheet points
  `--font-display` at the sans and collapses the accent to black. Big Shoulders
  is a condensed signage face; on paper it reads as a poster, and the
  ATS-tested print layout was built around the sans.
- **Reveal order is an attribute.** The DS writes `style="--i:N"`, which CSP
  blocks; `data-i="N"` maps onto `--i` in `tokens/motion.css`. The DS's
  reduced-motion block also left `animation-delay` in place, so a staggered
  reveal stayed invisible for its delay; ours zeroes it.
- **The blog appears only with content.** Routes, nav link and homepage card
  key off `getPublishedPosts()`; with nothing published, `/blog` is the site
  404. Placeholder posts for rendering checks stay untracked.
- **Firefox print findings** (printed from Firefox over WebDriver BiDi):
  - A running CSS animation prints at its current frame, and the print sheet's
    `animation: none` does not stop it. Printing within a second of load put
    every mid-reveal element on paper blank. A `beforeprint` handler finishes
    finite animations. The collapsible's own entrance animation was dropped
    rather than protected, per the DS's "micro-interactions stay quiet".
  - With "print backgrounds" on, chamfered cards printed as solid black
    blocks. Paper drops every background image.
- **Declined: enforcing the CSP on HTML in this pass.** `public/_headers`
  reaches static assets only; the SSR HTML carries no CSP. Injecting the header
  in Playwright shows three pre-existing sources that would break: the inline
  `<style>` from `transition:animate` on `<html>`, Shiki's per-token `style`
  attributes, and ClientRouter's runtime styles. None are new. Fixing them is
  its own piece of work.

### Follow-up: layers, the theme select, dock clearance (2026-09-26)

- **Cascade layers replace the specificity rules.** With no utility engine
  left, the DS tokens, element defaults and recipes sit in `tokens` / `base` /
  `recipes` layers; components and `print.css` are unlayered. The print sheet's
  `:root` prefixes and its `background-image` `!important` are gone, and the
  print sheet moved out of `Layout.astro` into `src/styles/print.css`.
- **The chamfered corner-marks on cards were dropped.** They were not in the
  DS: its Card is a flat surface with a hairline border. `recipes/card.css`
  expresses that Card as a recipe, so no component writes a gradient.
- **ThemeSwitch follows the DS's new Select.** The DS replaced the cycling
  button with an Ark Select: auto-compact in the nav at a ≤520px container, and
  a floating dock with back-to-top once the nav scrolls away. It runs on Zag's
  select machine, so the "one hand-written control" exception above no longer
  applies. Settings are the DS card's defaults: ghost trigger, compact auto,
  floating with back-to-top, `srHidden`.
  - Kept as the DS specifies, but flagged: `srHidden` removes the theme
    control from the tab order and the accessibility tree. Keyboard-only users
    cannot change the theme, and the trigger is focused while aria-hidden after
    a mouse pick. `srHidden={false}` is the one-line switch.
- **Dock clearance, synced back to the DS.** On phones the fixed dock covered
  the footer links at full scroll. Hiding the dock near the footer would drop
  back-to-top exactly where it is used, so the page reserves the dock's
  footprint instead: `--dock-clearance` and a `body:has([data-floating])`
  padding rule in `recipes/select.css`. Written to the Claude Design project
  (`recipes/select.css`, `ThemeSwitch.prompt.md`) on 2026-09-26.

### Theme labels in the shift register (2026-09-26)

- **Follow the Sun / Night Shift / Day Shift** replace System / Dark / Light;
  the values stay `system` / `dark` / `light`. Synced to the DS.
- **Measured before and after, 320-1280px.** The longer labels needed the
  revealed value's cap raised from 8em to 9em ("Follow the Sun" plus chevron
  is ~118px). Below the nav's compact width, the trigger used to slide its
  label out on hover, focus and open; that grew it over the links (9px with
  "System" at 360px, 62px with "Follow the Sun"). The nav trigger now stays
  icon-only there, since the open menu shows every label; the floating dock
  keeps its slide-out. The compact threshold moved from 520px to 560px, the
  width at which the full label clears the links by the grid's own 24px gap.
- **The menu sizes to its longest label.** Its positioner is absolutely placed
  inside the narrow trigger, so it shrink-wrapped to its 176px minimum and
  wrapped "Follow the Sun" onto two lines. It is now `width: max-content` with
  `white-space: nowrap` rows.

### DS consistency sweep (2026-09-26)

A sweep of the Claude Design project against the site after several two-way
syncs. The site held the settled decisions; the DS templates still showed the
pre-Night-Shift layout.

- **The portrait moves right, and a placeholder stands in for it.** The story
  leads and the portrait supports it, as in the DS About template: on phones
  the text comes first instead of 260px of photo. The formal studio portrait
  was off the DS brief ("a plain, naturally-lit headshot"), so it is gone
  until a plain one exists; a `lucide:user-round` glyph in a card-surface
  frame keeps the composition. Supersedes the portrait placement below.
- **The About era strip uses the ACTIVE badge**, as the Timeline does, in
  place of "–Present". One mark for "current" across the site.
- **Ongoing technical leadership is a duty, not an era.** Daryl still gives
  architectural guidance from the security side. Marking the Technical
  leadership era as still active would contradict the CV's 2026 end date, so
  it goes in the About prose and as a highlight on the current role.
- **Case studies are a Markdown collection,** like the blog (no MDX: nothing
  needs components in content yet). Fact sheet in frontmatter, rendered as a
  `<dl>` in condensed caps rather than the DS template's mono block, since mono
  is for code and logs only. `project` must name a `cv.json` project, and the
  CV card links to it. No listing page and no nav entry: the CV's Projects
  section is the index. Supersedes "CaseStudy routes are deferred" below.
- **`PageHeader` gained slots rather than a second header.** The post page had
  copied its header, h1 and lede styles to put a meta row where the eyebrow
  goes. An `eyebrow` slot (readable, unlike the aria-hidden prop) and an
  `after` slot let the post and the case study share it. `getPublishedPosts`
  became `getPublished(collection)` in `lib/content.ts` for the same reason.
- **Gallery is parked,** not built and not deleted: the DS keeps the template
  as future scope, and it is out of every nav.
- **The DS drops its duplicates.** `ui_kits/portfolio/` re-implemented CV,
  Blog and Gallery in React on retired tokens; the templates cover each page
  once. `scraps/` and `uploads/` were working leftovers. The templates import
  the DS `SiteNav` and a new `Footer` instead of nine inlined copies.
- **One landing reference: the Brand card.** The DS's Homepage template and
  its "Night Shift — direction" card described the same page. The card stays
  (it carries the direction and the load replay) and now shows the real
  landing: DW nav, real routes, footer. The template is gone.
- **The DW monogram replaces the lime logo mark everywhere,** including the
  favicon, which was still the retired circuit glyph. The favicon is the
  monogram outlined from Big Shoulders 900 (a favicon cannot load the web
  font), sodium on pine-black with the chamfered corner. The DS's unused
  Avatar card and photo went with the logo mark.
- **The 404's log block is the DS LogBlock.** It had been shaped for one;
  `LogBlock.astro` ports the component with its props, writing tones as
  `data-tone` rather than the DS's inline styles (CSP).
- **Projects is in the nav, with its own page.** Superseding "no listing page"
  above: `/projects` lists every cv.json project with the same cards as the
  CV section, linking to case studies where they exist. It is never empty, so
  it is not gated like the blog. Nav order: CV, Projects, Blog, About, Uses.
- **Print treatment is for the CV only.** The CV is the document people
  print; other pages print with the browser's defaults plus the global sheet.
  Print switches on posts, case studies, PostNav and the About portrait were
  removed, and new non-CV components get none.
- **Declined: pruning DS components the site does not render.** Forms, Tabs,
  Alert, Divider, IconLink and the security set stay, for future pages and a
  possible Storybook.

## Framework: none (React and React Aria were removed)

**The site ships no UI framework.** `design-system-full-plan.md` Phase A had
locked in React Aria with one unargued line — "best-in-class a11y with low
overhead" — and no document ever compared it against an alternative. Measuring
the built output showed the overhead claim was false.

Measured from `dist/client/_astro`, gzip: React DOM runtime 106.0 KB +
`react-dom` 9.5 KB + the SiteNav island (SiteNav + ThemeSwitch + RAC) 16.1 KB =
**131.6 KB**. What it bought: exactly two rendered elements, a RAC `Link` that
emits `<a href>` and a RAC `Button` that emits `<button>`. Native HTML already
gives the full keyboard and AT contract for both. After removal the site ships
**7.9 KB gzip** of JS in total (ClientRouter 6.2 KB plus four small scripts) —
a 94% reduction, with no visual or behavioural change.

**Swapping the primitives library was considered and rejected as pointless.**
React itself is ~87% of that cost and React Aria only ~13%, so Radix, Base UI,
and Ark UI — all React libraries — could save at most ~10–16 KB of 131.6 KB.
Base UI is in fact larger than Radix; Ark UI is the smallest of the three. The
library was never the problem.

**React Aria was also a net negative on reliability.** Its `usePress` calls
`stopPropagation()`, so clicks never reached `document` where `<ClientRouter />`
listens — every nav link fell back to a full page load except the plain-`<a>`
brand link. That needed an `onPress={(e) => e.continuePropagation()}` workaround
in two places, with no test guarding it. Plain `<a>` has the bug by
construction impossible.

**The a11y argument didn't survive contact either.** Every accessibility feature
on this site is hand-written HTML and CSS: the skip link, `<nav
aria-label="Primary">`, `aria-current="page"`, the 2px dashed `:focus-visible`
signature in `global.css`, `sr-only`, `motion-reduce`. React Aria contributed
none of it, and `audit-a11y.md`'s real findings were in vanilla components it
could not have helped with. RAC earns its weight on comboboxes, date pickers,
menus, and modals — patterns this site does not have. If one is ever needed,
reconsider *for that component*, and hydrate only it.

**This did not violate the design system.** The DS reference components in
`design-system/components/**/*.jsx` import only `React` — JSX as spec notation,
with zero React Aria. `CONVENTIONS.md` rule 6 explicitly frames the a11y
backing as a swappable implementation detail behind a stable prop API.

Consequences worth knowing:

- `src/components/ui/` is gone. `SiteNav`, `ThemeSwitch`, `Badge`, and `Prose`
  are now `.astro` in `src/components/`. `Button`, `Card`, `Divider`, and
  `IconLink` were deleted outright — all four were dead code, never imported.
- ThemeSwitch stays a **cycling button** (System → Dark → Light), matching the
  DS reference. It is a native `<button>`, so Enter and Space work for free. Its
  state lives in `localStorage`, not component state, and it re-syncs on
  `astro:page-load` because the nav re-mounts on every navigation.
- Its three glyphs come from the icon system rather than hand-copied SVG path
  data. The inline paths only existed because an icon component couldn't be
  imported into a `.tsx` island — a constraint that no longer applies.
- Removing React disabled Biome's React-only `useJsxKeyInIterable` rule, which
  made 27 `biome-ignore` comments across the `.astro` files dead. They were
  removed; `biome check` is clean. The one remaining suppression
  (`noUnusedVariables` in `NotFound.astro`) is unrelated and still needed.

## CSS engine: UnoCSS

*Superseded by the Night Shift rebuild: there is no utility engine. Kept for
the reasoning, which still explains several print rules.*

The site uses UnoCSS (`presetWind4` + `presetTypography`), configured in
`uno.config.ts`. Four things about the shape of that config are deliberate.

**Token values stay in CSS.** `src/styles/global.css` holds every token as a
plain custom property; the config only maps those names onto utility namespaces
by referencing `var(--…)`. The palette therefore re-resolves at runtime when
`ThemeSwitch` toggles `.dark`, and the values stay readable as CSS rather than
migrating into a JS object.

**Base styles are preflights, not a global `<style>` block.** UnoCSS emits
preflights before utilities, so a document-level rule can never out-rank a
utility. That ordering is guaranteed by the engine, where previously it had to
be hand-maintained with `@layer base` — and was got wrong twice
(`ul { list-style: none }` beating `list-disc`, and a heading rule losing to a
preset reset). What remains in `Layout.astro` is the print sheet, which is the
opposite case: it must beat utilities, so it stays unlayered.

**The vocabulary is declared, not repeated.** `shortcuts` name the two mono
recipes the system uses repeatedly — `meta` for content metadata, `chrome` for
uppercase UI chrome — collapsing eleven copies of a five-class string. A `rule`
declares the named durations, because the preset ships numeric `duration-<ms>`
only and the token names generate nothing on their own; without it
`duration-fast` silently resolved to the preset default rather than 120ms.

**The `blocklist` makes drift inert, not loud.** It refuses any `tracking-*`
outside the two tiers. Know precisely what that buys: a blocked class is never
generated, so `tracking-wide` renders as nothing rather than as a third tier. It
does **not** fail the build — verified — and the message surfaces to tooling
rather than to `astro build`. `tracking-normal` is allowed on purpose; it is an
explicit opt-out used by `Section`'s meta span and `Hero`'s print override, and
a naive rule rejected it.

### Icons are CSS masks

`presetIcons` renders an icon as a mask-image from a class like
`i-lucide-moon`, so glyphs inherit `currentColor` and are coloured by the same
`text-skin-*` utilities as text. `src/components/Icon.astro` is a thin wrapper
that translates an Iconify id into that class, so call sites keep naming icons
semantically (`Icons.Email`) and the translation lives in one place.

This replaced `astro-icon`, and with it three workarounds: the `@iconify/utils`
pin to `^2` (needed only because `astro-icon` required v2), the
`vite.optimizeDeps.include` entry that stopped the icon chain desyncing the
workerd dev runner, and a 17-entry `include` allowlist in `astro.config.ts`. The
three `@iconify-json/*` collections stay; only referenced icons are emitted.

Two constraints worth knowing before changing this:

- **Size with a utility, never an inline `style`.** `public/_headers` sets
  `style-src 'self'` with no `unsafe-inline`, so a `style` attribute would be
  blocked in production.
- **Dynamic lookups need the safelist.** `Skills` and `Hero` resolve their icon
  from `cv.json` data (`Icons[skillName]`, `Icons[network]`), which no static
  scan can see. `uno.config.ts` safelists every value in `src/icons.ts`, so
  adding an entry there is sufficient — but building an id any other way will
  silently render nothing.

Print was checked rather than assumed: no icon reaches paper. `Projects` and the
screen `Skills` variant are `print:hidden`, the print `Skills` variant is plain
text, and the Education, Timeline-link and Hero-footer glyphs are all
`print:hidden` — so mask-based icons not printing is moot here.

The remaining inline SVGs are deliberate: CopyEmail's checkmark and Timeline's
`<summary>` chevron both have behaviour attached (JS toggling, open-state
rotation) and are hand-authored, not icon-system glyphs.

### The print sheet has to state its own precedence

Utilities are emitted unlayered, so the print sheet no longer outranks them
implicitly the way it did when they sat in a cascade layer. Two consequences,
both load-bearing for the CV:

- `details > summary { display: none }` cannot beat `.flex` on specificity
  (0,0,2 vs 0,1,0), so it carries `!important`. Without it the show-more/less
  toggles print. This is the only `!important` in the sheet: the `p` rule stays
  unimportant on purpose, so a paragraph that states its own print size — Skills'
  10px ATS run, Timeline's `print:text-xs` — keeps it. Where a screen-only size
  would otherwise win, the element carries an explicit `print:` override instead
  (see `About.astro`).
- Container-query rules are emitted **after** media-query ones, so `@lg:` beat
  `print:` on paper and the entry kept its 12-column grid with content boxed into
  `col-span-10` — about 83% of the page, wrapping lines early. The sheet resets
  `container-type: normal` on the `@container` element, disabling every `@lg:*`
  at once. The layout falls back to its stacked form: full measure, single
  column, plain DOM order. Verified against the live site by diffing printed
  PDFs — same two pages, same page-1 break.

### Component kits were considered and declined

Component by component, ~85% of the hand-written surface has no kit equivalent:
`Timeline` (CV timeline with date rail, container queries, `<details>`
highlights, print collapse), `CopyEmail`, the ATS print sheet, `ThemeSwitch`,
and the layout components. The design system had already settled this —
`CONVENTIONS.md`: *"Bespoke over generic… Avatar/Spinner/Switch were removed as
kit filler"* — and the roadmap (Tabs plus five security components) is
overwhelmingly things no kit ships. Bulma is also ~24 KB gzip against this
site's entire ~9 KB stylesheet, and would overwrite a deliberately-argued visual
language.

`normalize.css` and PureCSS are not alternatives to a utility engine: they
replace the reset only, roughly a fifth of the output. Choosing one means
hand-writing the other four-fifths.

## Information architecture

- **`/` is a router, `/about` is terminal.** The homepage has nothing you're
  meant to stop at; every block is designed to be left. `/about` is
  first-person, carries the portrait and the off-duty material. The split is
  *register*, not subject matter.
- **The footer is site-wide, not homepage-only.** The DS only shows it on the
  landing template, but that's an authoring artifact — every template also
  re-embeds the nav inline and we hoisted that. The footer is the only place
  GitHub/LinkedIn/Email live, so homepage-only would leave someone arriving on a
  blog post from search with no route to contact.
- **Gallery is deferred**, not forgotten (drift report §1.1/§1.3). CaseStudy
  was built on 2026-09-26 (see the consistency sweep above).

## Components and styling

- **Eyebrows are classifiers, not restatements.** They label the *kind* of thing
  a section is (`Audit log` over Experience, `Toolbox` over Skills), never
  repeat the heading. Full approved mapping in drift report §2.7b. All are
  `print:hidden` and `aria-hidden` — which is what makes the GRC-register
  wordplay safe: none of it can reach a printed CV or a screen reader.
- **The active nav link is an underline, not a bordered chip.** The chip is
  `Badge`'s language; reusing it for nav state makes "you are here" read as a
  *tag* rather than a position.
- **`duration-*` is a declared rule, not a free token.** The preset ships numeric
  `duration-<ms>` only, so naming the durations in the theme emits the custom
  properties but generates no `.duration-fast` / `.duration-base` class. That is
  how twelve usages across CopyEmail, PostNav, ThemeSwitch, SiteNav, Timeline,
  Projects, Hero and the homepage came to be inert — `transition-*` fell through
  to the preset default and every one of those ran at 150ms instead of the
  system's 120ms and 200ms. Nothing looked broken, which is presumably how it
  survived four audits. The `rules` entry in `uno.config.ts` sets `--un-duration`
  as well as `transition-duration`, so it composes regardless of class order.
  Keep it in sync with the `--duration-*` tokens.
- **`Badge` declares `font-medium` explicitly — don't remove it as redundant.**
  The DS spec (`components/feedback/Badge.jsx:19`) has always said
  `fontWeight: 500`, but the component set no weight, so the chip inherited its
  parent's: **700** inside Timeline's role `<h3>` (via `Layout.astro`'s global
  heading rule) and **400** everywhere else. The same component rendered at two
  weights, neither the spec, and the discrepancy was invisible in the class
  string because it came from inheritance. Only the 400 and 500 mono faces are
  loaded, so the 700 case also pulled the 500 file as a nearest-weight match and
  synthesised the remaining boldness. Declaring the weight fixes all three.
- **The nav is deliberately not `transition:persist`-ed.** Persisting it would
  freeze `aria-current` at whichever pathname first rendered it. A fresh mount
  per navigation is correct; `ThemeSwitch` re-syncs from `localStorage` on mount
  anyway.
- **The org line is sans `text-sm`, not mono.** The mono metadata rule covers
  dates, tags and labels. An employer name is content, and demoting it to
  0.72rem mono buries the most scannable fact on a CV.
- **Dates: a screen treatment and a print treatment, deliberately different.**
  - *Print* — right-aligned on the title row, in normal flow, for both
    Experience and Education. This is the ATS-critical case: parsers read
    extracted text from the PDF in DOM order, so the date must sit adjacent to
    the title it belongs to. Education's old `md:absolute` was the worst
    offender, since A4 is ~794px — past the `md` breakpoint — so it took the
    date out of flow in the printed CV too.
  - *Screen* — Experience keeps its **left date rail** at `@lg`. The rail is
    the timeline's whole idea and the original design intent; it was briefly
    removed in the name of matching Education and then restored deliberately.
    It is `print:hidden`, because a two-column date gutter is exactly what
    confuses ATS parsers. Below `@lg` it collapses to a stacked in-flow row
    above the title.
  - *Education stays right-aligned on screen* (decided 2026-07-26). Experience
    is a timeline and earns the rail; Education is a two-item list and would be
    carrying timeline furniture for no reason. The asymmetry is screen-only —
    the two match in print, which is where it matters.
- **No photo on `/cv` at all — a deliberate DS divergence** (decided
  2026-07-26). The DS resume template does place an 84px circular avatar in that
  header (`templates/portfolio-resume/PortfolioResume.dc.html:31`), so this is an
  override, not a correction. Reasons: the printed CV never carried one, since
  Singapore, UK and US recruiters don't expect it and an image contributes
  nothing to ATS text extraction; and the site's IA already assigns the portrait
  to `/about`, so keeping it on both duplicated the only photographic asset on
  the site and blurred the `/cv`-is-the-document / `/about`-is-the-person split.
  Regional note: photos remain conventional in German-speaking Europe, France,
  Spain, Italy, Japan, Korea and much of Latin America, and Europass merely
  *offers* a photo slot rather than requiring one — so an application that
  genuinely wants one should get a print variant with a passport-style crop,
  not a re-enabled web avatar.
- **Inline code wraps mid-token; code blocks scroll** (decided 2026-07-26,
  `src/components/ui/Prose.tsx`). A wrapped identifier keeps the default
  `box-decoration-break: slice`, so the break edge is left open and the two
  fragments read as one continuous token. `box-decoration-clone` was rejected:
  closing a border around each fragment makes one identifier look like two.
  The mechanism is in CLAUDE.md — it's a whole-document overflow bug, not a
  paragraph one.
- **Post-to-post navigation is two stacked rows, not two columns** (added
  2026-07-26, `src/components/PostNav.astro`). "Previous" is the **older** post
  and "next" the **newer** one — reading order down the log, matching the
  newest-first index rather than array position. Details worth not undoing:
  - *Stacked, full-width rows.* A side-by-side pair inside `max-w-3xl` gives each
    title ~40ch, which wraps titles that shouldn't wrap. Stacked, each gets the
    whole measure and the left/right alignment alone carries the direction.
  - *The label rows are mirror images.* `flex-row-reverse` on the next row turns
    `← Previous · date` into `date · Next →` from one block of markup, so the
    glyph always sits beside the word it reinforces instead of drifting to the
    far side of the date.
  - *The arrow lives on the mono label row, never beside the title.* A glyph next
    to a wrapping title needs a hanging indent to stay aligned; the label row is
    always one line. `text-balance` handles the two-line title.
  - *No width cap on the title.* An earlier `max-w-[52ch]` was **inert** —
    `text-xl` resolves to 23px here, so 52ch computed to 717.6px against a 704px
    row. The row's own measure decides when a title breaks. Don't reintroduce a
    `ch` cap without measuring it.
  - Drafts are filtered out of the sequence, so unpublishing a post closes the
    gap rather than leaving a link to a 404. (It was also `print:hidden`; print
    treatment is now for the CV only, see the 2026-09-26 sweep.)
- **The portrait stays on `/about`** (placement and photo superseded by the
  2026-09-26 sweep above). It's the one page whose purpose is "who is
  this person". Note the DS asks for "a plain, naturally-lit headshot … no
  stylized color grading" — the current formal studio portrait is off that
  brief, which is a photo-selection question rather than a placement one.
- **CV section icons are `print:hidden`.** The graduate cap and certificate icon
  read as decoration on paper. `print:gap-0` on their rows stops the flex gap
  leaving a phantom indent.
- **`Skills` sits below `Languages`**, and renders twice — a screen variant and
  a `variant="print"` one.

## Accessibility

- **Heading levels are structural.** h1 page title → h2 section (`Section.astro`)
  → h3 entry. The Hero tagline is a `<p>`: as an `h2` it inserted a phantom
  level and pushed every real section to h3.
- **The copy-email toast renders empty.** `role="status"` already implies
  `aria-live="polite"`, but a live region only announces when its *content*
  changes. Shipping it with "copied" already inside and animating opacity
  announced nothing. The script writes the text in and clears it on reset.
- **The skip link targets `<main>`**, which `SiteLayout.astro` owns — one edit
  instead of an `id` threaded through seven page files.

### Declined, with reasons

- **Moving focus to `<main>` on client-side navigation.** Astro's ClientRouter
  already ships a route announcer (`astro-route-announcer` is in the HTML), so
  page changes *are* announced. Auto-moving focus is itself contested practice,
  and the skip link now covers the keyboard case.
- **Trimming the fontsource imports to latin-only subsets.** Looks like an easy
  win — the site pulls Cyrillic, Greek and Vietnamese for English content — but
  it is already optimal and the change would be a regression. `400.css` declares
  every subset *with* `unicode-range`, so browsers download only the subsets a
  page actually needs (verified: a `/cv` load fetches exactly three files, all
  latin). The per-subset entrypoints (`latin-400.css`, `latin-ext-400.css`) carry
  **no `unicode-range`**, so they are meant to be used one at a time; importing
  one drops correct glyphs for every other range, and importing two makes the
  later `@font-face` win for all characters. Net effect of "trimming" would be
  ~1 KB gzip less CSS in exchange for accented characters — an international
  employer or place name in `cv.json` — silently falling back to a system font.
  The variable sans package has no per-subset entrypoint at all; hand-writing
  `@font-face` would add maintenance and break on the next package bump.
- **Dropping `@fontsource/ibm-plex-mono/500.css`.** No `font-medium` appears in
  the source, which looks like the 500 face is dead weight. It isn't: measuring
  the rendered page showed the browser fetching it. See the Badge weight entry
  above — the fix was to declare the weight the DS always specified, which keeps
  500 legitimately in use.

## Cleanup pass (2026-09-14)

A `/simplify` review of the whole branch against `main`, after several rounds of
adding, removing and changing approaches. What changed and why:

- **`SiteLayout.astro` owns `<main>`.** Seven pages carried the same
  `mx-auto flex max-w-3xl flex-col px-6 py-16 md:px-8 md:py-24` string; now the
  layout renders `<main>` with the `measure` shortcut and a page passes only its
  `gap-*`. The print sheet resets `main` to full width, so `cv.astro` no longer
  needs its own `print:` overrides or a `<style>` block beyond `@page`.
- **The CV keyword chips are `<Badge>`.** Four sections hand-rolled a chip that
  had already drifted from Badge (`py-0.5`, inherited weight). One recipe now.
- **`meta` lost `uppercase`.** The shortcut was meant for dates, tags and
  captions, but almost none of those are uppercase, so it was used three times
  while its expansion was copied seventeen. Sites that want caps say
  `meta uppercase`.
- **Paragraphs inherit the body size.** The preflight `p { text-sm }` was a
  résumé density that every consumer overrode; every CV paragraph already states
  `text-sm`. Dropping it removed eight `text-base leading-normal text-skin-muted`
  copies and About's hand-written print size.
- **One reduced-motion mechanism.** `global.css` already zeroes every transition
  under `prefers-reduced-motion`, so the per-element `motion-reduce:` utilities
  were inert and are gone.
- **Unknown blog slugs `Astro.rewrite("/404")`.** The post route had its own
  404 branch and a `NotFound` component extracted for it. The rewrite lets
  `404.astro` be the only 404, reading `Astro.originPathname` for the resource
  row. Lost: the route-specific "no post matches this slug" cause line.
- **Icons are masks everywhere.** The copy tick and the show-more chevron were
  the last inline `<svg>`s; they are `i-lucide-check` / `i-lucide-chevron-down`.
- **Dead tokens removed.** The status and severity tiers, `--color-text-inverted`,
  `text-5xl`, `leading-display`, the `--motion-*` shorthands and the unused
  easings had no consumer. The values stay in `plans/design-system/tokens/`;
  re-add a tier when something renders it.
- **History comments trimmed.** Narration of the React Aria detour, the theme
  bug hunt, porting notes and stale file references were cut to the facts a
  reader needs; CLAUDE.md holds the gotchas.

- **Print rules beat utilities by specificity, not order.** The build emits
  the print sheet after the UnoCSS sheet; `astro dev` injects UnoCSS last. The
  `@container` reset and the new `main` reset tied with their utilities at
  (0,1,0), so in dev the timeline rail and dots printed and Firefox dropped
  every Experience role (a contained block spanning a page break). Both now
  carry a `:root` prefix. Verified in Chromium print emulation and by printing
  from Firefox 150 over WebDriver BiDi, before and after.

Declined: prerendering every page as a static asset. It would remove the
Worker render per request and let `public/_headers` apply to HTML, but the SSR
choice is deliberate and the reason is not recorded here — log it before
changing it. Also declined: sharing the theme-resolution functions between the
head script and `ThemeSwitch` via an import, because Vite would split the shared
module into its own chunk and add a request before first paint.

## Known gaps

- **`Attestations`, `Service` and `Out of scope` never render.** `src/cv.json`
  has `volunteer: []`, `interests: []` and `references: []`. The eyebrows are
  correctly wired in the components; there's simply no data. Pre-existing, not a
  regression. `cv.json` is hand-maintained.
- **The 2018–2019 Ensign Infosecurity internship is excluded** from `/about`'s
  three-era narrative — deliberate, though mildly ironic given it was security
  work.

## Caveats on the audit reports

The four audits were run by subagents and **two headline findings did not
survive verification**. Treat the reports as leads, not conclusions:

- `audit-ats.md`'s sole HIGH — "~20 role bullets are dropped from the PDF
  because the `beforeprint` handler is missing" — is **false**. It grepped
  inline HTML; Astro bundles module scripts into external files. Verified by
  dispatching `beforeprint` after a client-side nav to `/cv`: all 5 collapsed
  `<details>` expanded.
- `audit-a11y.md`'s HIGH prescribed adding `aria-live="polite"` to the toast —
  redundant, `role="status"` implies it. The conclusion was right, the reasoning
  wrong; the real bug was the unchanging text. Its finding that `<summary>`
  elements lack a focus ring is also **false** — `global.css:245` includes
  `summary` in the focus-visible selector.
- `audit-a11y.md` reported heading order as passing. It was the one real
  structural defect on the site.
- `audit-design-craft.md` and `audit-ds-conformance.md` returned essentially
  clean. Both were reading the markup that contained the heading bug and missed
  it, so read those clean bills as weak evidence rather than assurance.
