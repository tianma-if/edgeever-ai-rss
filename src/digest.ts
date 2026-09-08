import type { FeedCategory } from "./catalog";
import { articleFreshness, clusterRelatedArticles } from "./dedupe";
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

const balanceDigestArticles = (articles: Article[], limit: number): Article[] => {
  if (articles.length <= 1) return articles.slice(0, limit);
  const sourceCount = new Set(articles.map((article) => article.sourceId)).size;
  const maxPerSource = Math.max(3, Math.ceil(limit / Math.max(1, sourceCount)));
  const selected: Article[] = [];
  const selectedIds = new Set<string>();
  const perSource = new Map<string, number>();

  const add = (article: Article): boolean => {
    if (selectedIds.has(article.id) || (perSource.get(article.sourceId) ?? 0) >= maxPerSource) return false;
    selected.push(article);
    selectedIds.add(article.id);
    perSource.set(article.sourceId, (perSource.get(article.sourceId) ?? 0) + 1);
    return true;
  };

  const freshestByRole = new Map<string, Article>();
  for (const article of articles) {
    const role = article.sourceRole ?? "general";
    if (!freshestByRole.has(role)) freshestByRole.set(role, article);
  }
  for (const article of freshestByRole.values()) {
    if (selected.length >= limit) break;
    add(article);
  }
  for (const article of articles) {
    if (selected.length >= limit) break;
    add(article);
  }

  return selected.sort((left, right) => articleFreshness(right).localeCompare(articleFreshness(left)));
};

export const recentCategoryArticles = (
  articles: Article[],
  categoryId: string,
  now: Date,
  limit = MAX_DIGEST_ARTICLES,
  windowHours = DAILY_DIGEST_WINDOW_MS / (60 * 60 * 1_000),
): Article[] => {
  const cutoff = now.getTime() - windowHours * 60 * 60 * 1_000;
  const recent = articles
    .filter((article) => {
      if (article.categoryId !== categoryId || !article.publishedAt) return false;
      const timestamp = new Date(article.publishedAt).getTime();
      return Number.isFinite(timestamp) && timestamp >= cutoff && timestamp <= now.getTime();
    })
    .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""));
  return balanceDigestArticles(clusterRelatedArticles(recent), limit);
};

const markdownEscape = (value: string): string => value.replace(/([\\`*_{}\[\]()#+.!|>])/g, "\\$1");

export const digestArticlePayload = (articles: Article[]) => articles.map((article, index) => ({
  index: index + 1,
  title: article.title,
  source: article.sourceName,
  publishedAt: article.publishedAt,
  excerpt: (article.content || article.summary).slice(0, 3_000),
  relatedCoverage: article.relatedCoverage?.map((coverage) => ({
    source: coverage.sourceName,
    title: coverage.title,
    publishedAt: coverage.publishedAt,
  })),
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
    const related = article.relatedCoverage?.map((coverage) =>
      `   - 同一事件：[${markdownEscape(coverage.title)}](<${coverage.url}>) — ${markdownEscape(coverage.sourceName)}${coverage.publishedAt ? ` · ${coverage.publishedAt}` : ""}`,
    ) ?? [];
    return [`${index + 1}. [${markdownEscape(article.title)}](<${article.url}>) — ${markdownEscape(article.sourceName)}${publishedAt}`, ...related].join("\n");
  });
  return [
    `# ${markdownEscape(input.title)}`,
    `> 分类：${markdownEscape(input.category.name)} · 最近 ${input.windowHours ?? 24} 小时 · ${input.articles.length} 篇 · 生成于 ${generatedAt}`,
    input.aiMarkdown.trim(),
    "## 来源",
    ...sources,
  ].join("\n\n");
};
