# [daryl.one](https://daryl.one)

![Cloudflare Workers Deployment](https://img.shields.io/github/actions/workflow/status/azureguard/daryl.one/deploy.yaml?branch=main&logo=githubactions)
![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff&style=flat)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-FF4A03?logo=Cloudflare-Workers&logoColor=white)

## 🛠️ Stack

- [**Astro**](https://astro.build/): every page prerendered, served from Cloudflare's cache
- [**Cloudflare Workers**](https://www.cloudflare.com/products/workers/): static assets plus an on-demand 404
- [**Zag.js**](https://zagjs.com/): the Ark UI state machines, without a UI framework
- Plain CSS: tokens and recipes from the "Night Shift" design system
- [**JSON Resume Schema**](https://jsonresume.org/schema/)
  - Edit `src/cv.json` to update the CV
  - Posts, case studies and uses entries are Markdown in `src/content/`

## 📜 Getting Started

Setup environment

```bash
mise install
```

Start developing!

```bash
aube install
aube dev
```

Open [**http://localhost:4321**](http://localhost:4321/) in your browser to view the result 🚀

`aube dev` also serves on your local network (Astro's `--host` flag), so you can preview from a phone or tablet using the network URL it prints. Prefer `aube start` to stay localhost-only.

## 🚀 Deployment

Commits to the main branch update the **_production_** deployment.

Commits on other branches create a **_preview_** deployment.

This is driven by a [**GitHub Action**](.github/workflows/deploy.yaml) that invokes [**Cloudflare Wrangler**](https://github.com/cloudflare/wrangler-action).

## 🧞 Commands

| Command            | Action                                                                                                           |
| :----------------- | :--------------------------------------------------------------------------------------------------------------- |
| `aube dev`         | Launches the dev server at `localhost:4321` and on the local network (`--host`), for testing from other devices. |
| `aube start`       | Launches the dev server at `localhost:4321` only.                                                                |
| `aube build`       | Checks for errors and creates a production build in `./dist/`.                                                   |
| `aube preview`     | Builds, then previews the production Worker at `localhost:4321`.                                                 |
| `aube format:fix`  | Lints and formats staged files with Biome.                                                                       |
