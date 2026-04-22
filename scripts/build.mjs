import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const rootDir = process.cwd();
const contentDir = path.join(rootDir, "content", "articles");
const outputDir = path.join(rootDir, "docs");
const assetsOutDir = path.join(outputDir, "assets");
const articlesOutDir = path.join(outputDir, "articles");
const stylesSource = path.join(rootDir, "src", "styles.css");
const logoSource = path.join(rootDir, "src", "assets", "logo.svg");
const blogTitle = "My Blog";

marked.setOptions({
  breaks: true
});

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
  fs.mkdirSync(articlesOutDir, { recursive: true });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
        html,
        url: `articles/${slug}/`
      };
    })
    .sort((a, b) => b.date - a.date);
}

function renderLayout({ pageTitle, rootPath, bodyClass = "", mainMarkup }) {
  const homeHref = rootPath || "./";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="${rootPath}assets/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="${bodyClass}">
    <div class="site-shell">
      <header class="topbar">
        <a href="${homeHref}" class="logo-link" aria-label="Go to homepage">
          <img class="logo" src="${rootPath}assets/logo.svg" alt="Blog logo" />
        </a>
        <h1 class="blog-title">${escapeHtml(blogTitle)}</h1>
      </header>
      ${mainMarkup}
    </div>
  </body>
</html>`;
}

function articleCard(article, index) {
  return `
    <article class="article-card" id="${article.slug}" style="animation-delay: ${index * 65}ms">
      <h2><a class="article-link" href="${article.url}">${escapeHtml(article.title)}</a></h2>
      <p class="article-meta">${article.dateText}</p>
      <p class="article-summary">${escapeHtml(article.summary)}</p>
      <a class="read-more" href="${article.url}" aria-label="Read ${escapeHtml(article.title)}">Read article</a>
    </article>
  `;
}

function renderHomePage(articles) {
  const feedMarkup =
    articles.length > 0
      ? articles.map(articleCard).join("\n")
      : '<div class="empty">No articles found yet. Add Markdown files to <strong>content/articles</strong> and run <code>npm run build</code>.</div>';

  return renderLayout({
    pageTitle: blogTitle,
    rootPath: "",
    bodyClass: "home-page",
    mainMarkup: `
      <main class="feed-wrap">
        <section class="feed" aria-label="Article feed">
          ${feedMarkup}
        </section>
      </main>
    `
  });
}

function renderArticlePage(article) {
  return renderLayout({
    pageTitle: `${article.title} | ${blogTitle}`,
    rootPath: "../../",
    bodyClass: "article-page-body",
    mainMarkup: `
      <main class="article-page-wrap">
        <article class="article-page">
          <a class="back-link" href="../../">← Back to all articles</a>
          <h2 class="article-page-title">${escapeHtml(article.title)}</h2>
          <p class="article-meta">${article.dateText}</p>
          <div class="article-content">${article.html}</div>
        </article>
      </main>
    `
  });
}

function build() {
  ensureDirs();

  const articles = readArticles();
  const homePageHtml = renderHomePage(articles);

  fs.copyFileSync(stylesSource, path.join(assetsOutDir, "styles.css"));
  fs.copyFileSync(logoSource, path.join(assetsOutDir, "logo.svg"));
  fs.writeFileSync(path.join(outputDir, "index.html"), homePageHtml, "utf8");

  for (const article of articles) {
    const articleDir = path.join(articlesOutDir, article.slug);
    fs.mkdirSync(articleDir, { recursive: true });
    fs.writeFileSync(path.join(articleDir, "index.html"), renderArticlePage(article), "utf8");
  }

  console.log(`Built ${articles.length} article(s) and pages into docs/`);
}

build();
