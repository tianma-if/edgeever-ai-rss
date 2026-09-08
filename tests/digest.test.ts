import { describe, expect, test } from "bun:test";
import { CATEGORIES, FEEDS } from "../src/catalog";
import {
  buildDigestMarkdown,
  digestDateKey,
  digestTags,
  digestTitle,
  recentCategoryArticles,
} from "../src/digest";
import type { Article } from "../src/feed";

const article = (overrides: Partial<Article> = {}): Article => ({
  id: "article-1",
  sourceId: FEEDS[0]!.id,
  sourceName: FEEDS[0]!.name,
  categoryId: "ai",
  title: "A useful [update]",
  url: "https://example.com/update",
  publishedAt: "2026-09-08T04:00:00.000Z",
  author: null,
  summary: "Summary",
  content: "Content",
  language: "en",
  ...overrides,
});

describe("category digest", () => {
  test("uses a sortable date-first title and stable identity tags", () => {
    const date = new Date(2026, 8, 8, 12);
    expect(digestDateKey(date)).toBe("2026-09-08");
    expect(digestTitle("2026-09-08", "AI 前沿")).toBe("2026-09-08 · AI 前沿 · RSS 日报");
    expect(digestTags("2026-09-08", "ai")).toContain("AI-RSS-Category-ai");
  });

  test("keeps only recent articles from the requested category", () => {
    const now = new Date("2026-09-08T12:00:00.000Z");
    const result = recentCategoryArticles([
      article(),
      article({ id: "old", publishedAt: "2026-09-07T11:59:59.000Z" }),
      article({ id: "other", categoryId: "science" }),
      article({ id: "undated", publishedAt: null }),
    ], "ai", now);
    expect(result.map((item) => item.id)).toEqual(["article-1"]);
    expect(recentCategoryArticles([
      article(),
      article({ id: "older", title: "An older update", url: "https://example.com/older", publishedAt: "2026-09-07T11:59:59.000Z" }),
    ], "ai", now, 20, 48).map((item) => item.id)).toEqual(["article-1", "older"]);
  });

  test("deduplicates normalized links and titles", () => {
    const now = new Date("2026-09-08T12:00:00.000Z");
    const result = recentCategoryArticles([
      article({ id: "tracking", url: "https://example.com/update/?utm_source=newsletter" }),
      article({ id: "canonical", url: "https://example.com/update" }),
      article({ id: "same-title", sourceId: "other-source", sourceName: "Other source", url: "https://example.com/elsewhere", title: "A useful update!" }),
    ], "ai", now);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("tracking");
    expect(result[0]?.relatedCoverage).toHaveLength(2);
  });

  test("represents available source roles without letting one source dominate", () => {
    const now = new Date("2026-09-08T12:00:00.000Z");
    const result = recentCategoryArticles([
      ...Array.from({ length: 8 }, (_, index) => article({
        id: `loud-${index}`,
        sourceId: "loud",
        sourceRole: "practitioner",
        title: `Loud source ${index}`,
        url: `https://example.com/loud/${index}`,
        publishedAt: `2026-09-08T${String(11 - index).padStart(2, "0")}:00:00.000Z`,
      })),
      article({ id: "official", sourceId: "official", sourceRole: "official", title: "Official", url: "https://example.com/official" }),
      article({ id: "research", sourceId: "research", sourceRole: "research", title: "Research", url: "https://example.com/research" }),
      article({ id: "briefing", sourceId: "briefing", sourceRole: "briefing", title: "Briefing", url: "https://example.com/briefing" }),
    ], "ai", now, 5);
    expect(new Set(result.map((item) => item.sourceRole))).toEqual(new Set(["practitioner", "official", "research", "briefing"]));
    expect(result.filter((item) => item.sourceId === "loud")).toHaveLength(2);
  });

  test("builds a traceable note with deterministic sources", () => {
    const category = CATEGORIES[0]!;
    const markdown = buildDigestMarkdown({
      title: "2026-09-08 · AI 前沿 · RSS 日报",
      category,
      generatedAt: new Date("2026-09-08T12:00:00.000Z"),
      articles: [article()],
      aiMarkdown: "## 今日概览\n\n重要更新〔1〕",
      windowHours: 48,
    });
    expect(markdown).toContain("# 2026-09-08 · AI 前沿 · RSS 日报");
    expect(markdown).toContain("## 来源");
    expect(markdown).toContain("最近 48 小时");
    expect(markdown).toContain("[A useful \\[update\\]](<https://example.com/update>)");
  });
});
