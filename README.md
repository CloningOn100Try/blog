# Jekyll Blog With Minima

This project now uses Jekyll with the Minima theme.

## Structure

- `_config.yml`: Jekyll site config
- `_posts/*.md`: blog articles
- `index.md`: homepage using Minima home layout
- `assets/logo.svg`: logo asset

## Writing Articles

Create files in `_posts` named like:

`YYYY-MM-DD-title.md`

Example:

```md
---
layout: post
title: "My Article"
date: 2026-04-22
---

Your Markdown content here.
```

## Local Run (Optional)

If you have Ruby/Bundler installed:

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000/blog/`.

## GitHub Pages Setup

1. Push your repository to GitHub.
2. Open Settings -> Pages.
3. Under Build and deployment:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
4. Save.

Your site URL is expected at:

- `https://cloningon100try.github.io/blog/`
