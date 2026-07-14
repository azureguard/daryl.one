# [daryl.one](https://daryl.one)

![Cloudflare Pages Deployment](https://img.shields.io/github/actions/workflow/status/azureguard/daryl.one/pages-deployment.yaml?branch=main&logo=githubactions)

![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff&style=flat)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-000000?logo=cloudflarepages)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-0F172A?&logo=tailwindcss)

## 🛠️ Stack

- [**Astro**](https://astro.build/)
- [**Cloudflare Pages**](https://pages.cloudflare.com/)
- [**JSON Resume Schema**](https://jsonresume.org/schema/)
  - Edit `cv.json` to update content

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

## 🚀 Deployment

Commits to the main branch updates the **_production_** deployment.

Commits on development branches creates a **_preview_** deployment.

This is driven by a [**GitHub Action**](.github/workflows/pages-deployment.yaml) to invoke [**Cloudflare Wrangler**](https://github.com/cloudflare/wrangler-action)

## 🧞 Commands

| Command           | Action                                                         |
| :---------------- | :------------------------------------------------------------- |
| `aube dev`        | Launches a local development server at `localhost:4321`.       |
| `aube build`      | Checks for errors and creates a production build in `./dist/`. |
| `aube preview`    | Local preview at `localhost:4321`                              |
| `aube preview:cf` | Cloudflare Pages local preview at `localhost:8788`             |

## 📣 Thanks

Bootstrapped using Astro CLI from [Smilesharks/dev-portfolio](https://github.com/Smilesharks/dev-portfolio/tree/d8e66f5c994c24682bb88a541cfa7e74c0ee8ff6)
