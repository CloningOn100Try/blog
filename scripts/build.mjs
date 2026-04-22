import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "content", "articles");
const outputDir = path.join(rootDir, "docs");
const assetsOutDir = path.join(outputDir, "assets");
const stylesSource = path.join(rootDir, "src", "styles.css");
const logoSource = path.join(rootDir, "src", "assets", "logo.svg");
const blogTitle = "My Blog";

function toSlug(fileName) {
  return fileName
    .replace(/\.md$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function safeDate(input) {
  if (!input) {
    return new Date();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function ensureDirs() {
  fs.mkdirSync(assetsOutDir, { recursive: true });
}

function readArticles() {
  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));

  return files
    .map((fileName) => {
      const filePath = path.join(contentDir, fileName);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);

      const slug = toSlug(fileName);
      const title = String(data.title || titleFromSlug(slug));
      const date = safeDate(data.date);
      const html = marked.parse(content);
      const summary = data.summary
        ? String(data.summary)
        : content.replace(/[#>*_`\[\]\-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);

      return {
        slug,
        title,
        date,
        dateText: formatDate(date),
        summary,
        html
      };
    })
    .sort((a, b) => b.date - a.date);
}

function articleCard(article) {
  return `
    <article class="article-card" id="${article.slug}">
      <h2>${article.title}</h2>
      <p class="article-meta">${article.dateText}</p>
      <div class="article-content">${article.html}</div>
    </article>
  `;
}

function renderPage(articles) {
  const feedMarkup =
    articles.length > 0
      ? articles.map(articleCard).join("\n")
      : '<div class="empty">No articles found yet. Add Markdown files to <strong>content/articles</strong> and run <code>npm run build</code>.</div>';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${blogTitle}</title>
    <link rel="stylesheet" href="assets/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div class="site-shell">
      <header class="topbar">
        <img class="logo" src="assets/logo.svg" alt="Blog logo" />
        <h1 class="blog-title">${blogTitle}</h1>
      </header>

      <main class="feed-wrap">
        <section class="feed" aria-label="Article feed">
          ${feedMarkup}
        </section>
      </main>
    </div>
  </body>
</html>`;
}

function build() {
  ensureDirs();

  const articles = readArticles();
  const html = renderPage(articles);

  fs.copyFileSync(stylesSource, path.join(assetsOutDir, "styles.css"));
  fs.copyFileSync(logoSource, path.join(assetsOutDir, "logo.svg"));
  fs.writeFileSync(path.join(outputDir, "index.html"), html, "utf8");

  console.log(`Built ${articles.length} article(s) into docs/`);
}

build();
