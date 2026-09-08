import type { Article, RelatedCoverage } from "./feed";

const EVENT_WINDOW_MS = 72 * 60 * 60 * 1_000;
const ROLE_PRIORITY: Record<NonNullable<Article["sourceRole"]>, number> = {
  official: 6,
  research: 5,
  analysis: 4,
  practitioner: 3,
  interview: 2,
  briefing: 1,
};

export const canonicalArticleUrl = (value: string): string => {
  try {
    const url = new URL(value);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || ["ref", "source", "campaign"].includes(key)) url.searchParams.delete(key);
    }
    url.pathname = url.pathname.replace(/\/$/, "") || "/";
    url.searchParams.sort();
    return url.toString();
  } catch {
    return value;
  }
};

export const normalizedTitle = (value: string): string => value
  .normalize("NFKC")
  .toLocaleLowerCase()
  .replace(/[\p{P}\p{S}\s]+/gu, "")
  .trim();

const titleTokens = (value: string): Set<string> => {
  const normalized = value.normalize("NFKC").toLocaleLowerCase();
  const words = normalized.match(/[a-z0-9]+/g)?.filter((word) => word.length >= 3) ?? [];
  const cjk = [...normalized].filter((character) => /\p{Script=Han}/u.test(character));
  const pairs = cjk.slice(0, -1).map((character, index) => character + cjk[index + 1]);
  return new Set([...words, ...pairs]);
};

const jaccard = (left: Set<string>, right: Set<string>): { shared: number; score: number } => {
  const shared = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return { shared, score: union ? shared / union : 0 };
};

const timestamp = (value: string | null): number | null => {
  if (!value) return null;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : null;
};

const sameStory = (
  left: Pick<Article, "sourceId" | "categoryId" | "title" | "url" | "publishedAt">,
  right: Pick<Article, "sourceId" | "categoryId" | "title" | "url" | "publishedAt">,
): boolean => {
  if (left.categoryId !== right.categoryId) return false;
  if (canonicalArticleUrl(left.url) === canonicalArticleUrl(right.url)) return true;
  if (left.sourceId === right.sourceId) return false;
  if (normalizedTitle(left.title) === normalizedTitle(right.title)) return true;
  const leftTime = timestamp(left.publishedAt);
  const rightTime = timestamp(right.publishedAt);
  if (leftTime === null || rightTime === null || Math.abs(leftTime - rightTime) > EVENT_WINDOW_MS) return false;
  const similarity = jaccard(titleTokens(left.title), titleTokens(right.title));
  return similarity.shared >= 3 && similarity.score >= 0.62;
};

const representativeScore = (article: Article): number => {
  const role = article.sourceRole ? ROLE_PRIORITY[article.sourceRole] : 0;
  return role * 1_000_000 + Math.min(999_999, article.content.length + article.summary.length);
};

const coverageKey = (coverage: RelatedCoverage): string =>
  `${canonicalArticleUrl(coverage.url)}\u0000${normalizedTitle(coverage.title)}`;

const asCoverage = (article: Article): RelatedCoverage => ({
  articleId: article.id,
  sourceId: article.sourceId,
  sourceName: article.sourceName,
  title: article.title,
  url: article.url,
  publishedAt: article.publishedAt,
});

export const articleFreshness = (article: Article): string => [
  article.publishedAt,
  ...(article.relatedCoverage ?? []).map((coverage) => coverage.publishedAt),
].filter((value): value is string => Boolean(value)).sort().at(-1) ?? "";

export const clusterRelatedArticles = (articles: Article[]): Article[] => {
  const groups: Article[][] = [];
  for (const article of [...articles].sort((left, right) => articleFreshness(right).localeCompare(articleFreshness(left)))) {
    const group = groups.find((candidates) => candidates.some((candidate) =>
      sameStory(candidate, article) || candidate.relatedCoverage?.some((coverage) => sameStory({
        ...coverage,
        categoryId: candidate.categoryId,
      }, article)),
    ));
    if (group) group.push(article);
    else groups.push([article]);
  }

  return groups.map((group) => {
    const representative = [...group].sort((left, right) => {
      const score = representativeScore(right) - representativeScore(left);
      return score || articleFreshness(right).localeCompare(articleFreshness(left));
    })[0]!;
    const coverage = [...group.flatMap((article) => [asCoverage(article), ...(article.relatedCoverage ?? [])])]
      .filter((item) => item.articleId !== representative.id)
      .filter((item, index, all) => all.findIndex((candidate) => coverageKey(candidate) === coverageKey(item)) === index)
      .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""));
    return { ...representative, relatedCoverage: coverage.length ? coverage : undefined };
  }).sort((left, right) => articleFreshness(right).localeCompare(articleFreshness(left)));
};
