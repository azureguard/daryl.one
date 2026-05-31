# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `pnpm dev` - Start development server at localhost:4321
- `pnpm build` - Run Astro check and build for production
- `pnpm preview` - Preview production build locally
- `pnpm preview:cf` - Preview with Cloudflare Pages locally at localhost:8788

### Code Quality

- `pnpm lint` - Run Biome linter
- `pnpm lint:fix` - Run Biome linter with auto-fix
- `pnpm format` - Check formatting with Biome and Prettier
- `pnpm format:fix` - Fix formatting with Biome and Prettier

### Prerequisites

- Node.js 22+ (managed by Volta)
- pnpm 10+ (install with `corepack enable && corepack prepare pnpm@^10 --activate`)

## Architecture

This is a personal portfolio website built with Astro and deployed on Cloudflare Pages.

### Key Technologies

- **Astro** - Static site generator with server-side rendering
- **Tailwind CSS v4** - Utility-first CSS framework (via `@tailwindcss/vite`) with a CSS-first custom theme
- **JSON Resume Schema** - Content managed via `cv.json`
- **Cloudflare Pages** - Deployment platform with SSR adapter

### Project Structure

```
src/
├── components/           # Reusable Astro components
│   ├── Section.astro    # Base section wrapper
│   ├── ThemeSwitch.astro # Dark/light mode toggle
│   └── sections/        # Page sections (Hero, About, Experience, etc.)
├── layouts/
│   └── Layout.astro     # Main layout with SEO and styling
├── pages/
│   └── index.astro      # Single-page portfolio
├── styles/
│   └── global.css      # Tailwind v4 entry + theme tokens (light/dark)
├── cv.d.ts             # TypeScript definitions for CV data
└── types.d.ts          # Global type definitions
```

### Content Management

- **Primary content**: Edit `cv.json` following JSON Resume Schema
- **Styling**: Tailwind v4 theme tokens (CSS custom properties for light/dark) in `src/styles/global.css`
- **Icons**: Configured in `astro.config.ts` using astro-icon with Iconify collections

### Deployment

- **Production**: Commits to `main` branch trigger automatic deployment
- **Preview**: Development branches create preview deployments
- **Build process**: Astro check runs before build to catch errors

## Code Style

### Formatting

- **Biome**: Primary linter and formatter (120 character line width)
- **Prettier**: Handles Astro files and specific overrides
- **Tabs**: Used for indentation (spaces for YAML/TOML/Markdown)

### Architecture Patterns

- **Single-page application**: All content rendered on index page
- **Component-based**: Sections are modular Astro components
- **Theme system**: CSS custom properties for dark/light mode
- **Responsive design**: Mobile-first with print styles
- **Type safety**: TypeScript throughout with proper CV data typing
