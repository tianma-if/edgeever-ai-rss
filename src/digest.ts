import type { FeedCategory } from "./catalog";
import type { Article } from "./feed";

export const DAILY_DIGEST_TAG = "AI-RSS-Daily";
export const DAILY_DIGEST_WINDOW_MS = 24 * 60 * 60 * 1_000;
export const MAX_DIGEST_ARTICLES = 20;

export const digestDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const digestTitle = (dateKey: string, categoryName: string): string =>
  `${dateKey} · ${categoryName} · RSS 日报`;

export const digestTags = (dateKey: string, categoryId: string): string[] => [
  "RSS",
  "AI-RSS",
  DAILY_DIGEST_TAG,
  `AI-RSS-Category-${categoryId}`,
  `AI-RSS-Date-${dateKey}`,
];

export const recentCategoryArticles = (
  articles: Article[],
  categoryId: string,
  now: Date,
  limit = MAX_DIGEST_ARTICLES,
  windowHours = DAILY_DIGEST_WINDOW_MS / (60 * 60 * 1_000),
): Article[] => {
  const cutoff = now.getTime() - windowHours * 60 * 60 * 1_000;
  return articles
    .filter((article) => {
      if (article.categoryId !== categoryId || !article.publishedAt) return false;
      const timestamp = new Date(article.publishedAt).getTime();
      return Number.isFinite(timestamp) && timestamp >= cutoff && timestamp <= now.getTime();
    })
    .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""))
    .slice(0, limit);
};

const markdownEscape = (value: string): string => value.replace(/([\\`*_{}\[\]()#+.!|>])/g, "\\$1");

export const digestArticlePayload = (articles: Article[]) => articles.map((article, index) => ({
  index: index + 1,
  title: article.title,
  source: article.sourceName,
  publishedAt: article.publishedAt,
  excerpt: (article.content || article.summary).slice(0, 3_000),
}));

export const buildDigestMarkdown = (input: {
  title: string;
  category: FeedCategory;
  generatedAt: Date;
  articles: Article[];
  aiMarkdown: string;
  windowHours?: number;
}): string => {
  const generatedAt = input.generatedAt.toISOString();
  const sources = input.articles.map((article, index) => {
    const publishedAt = article.publishedAt ? ` · ${article.publishedAt}` : "";
    return `${index + 1}. [${markdownEscape(article.title)}](<${article.url}>) — ${markdownEscape(article.sourceName)}${publishedAt}`;
  });
  return [
    `# ${markdownEscape(input.title)}`,
    `> 分类：${markdownEscape(input.category.name)} · 最近 ${input.windowHours ?? 24} 小时 · ${input.articles.length} 篇 · 生成于 ${generatedAt}`,
    input.aiMarkdown.trim(),
    "## 来源",
    ...sources,
  ].join("\n\n");
};
