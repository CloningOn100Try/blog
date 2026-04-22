# Simple Blog (GitHub Pages)

A small static blog generator that reads Markdown files from `content/articles` and builds a GitHub Pages-ready website into `docs`.

## Features

- Blog title at the top.
- Round logo on the left of the top bar.
- Scrollable feed of articles.
- Markdown + frontmatter support.

## Structure

- `content/articles/*.md`: your articles
- `scripts/build.mjs`: build script
- `src/styles.css`: site styles
- `src/assets/logo.svg`: default round logo
- `docs/`: generated website output for GitHub Pages

## Article format

Each article is a Markdown file with optional frontmatter:

```md
---
title: "My Article"
date: "2026-04-22"
summary: "Short summary"
---

# Heading

Your content...
```

If `title` is omitted, the filename is used. If `date` is omitted, today is used.

## Build

```bash
npm install
npm run build
```

Build using conda helper (env defaults to `blog-site`):

```bash
npm run build:conda
```

Optional: build with a different conda environment name:

```bash
bash scripts/build-conda.sh my-other-env
```

## Publish To GitHub Pages

1. Create a GitHub repository and connect this folder to it (if not already):

```bash
git init
git add .
git commit -m "Initial blog site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

2. Open GitHub -> your repo -> Settings -> Pages.
3. Under "Build and deployment", choose:
	- Source: "Deploy from a branch"
	- Branch: `main`
	- Folder: `/docs`
4. Save and wait for deployment.
5. Your site URL will be:
	- `https://<your-username>.github.io/<your-repo>/`

If your repository is named `<your-username>.github.io`, then your site URL is:

- `https://<your-username>.github.io/`
