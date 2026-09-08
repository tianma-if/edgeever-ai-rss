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
  });

  test("builds a traceable note with deterministic sources", () => {
    const category = CATEGORIES[0]!;
    const markdown = buildDigestMarkdown({
      title: "2026-09-08 · AI 前沿 · RSS 日报",
      category,
      generatedAt: new Date("2026-09-08T12:00:00.000Z"),
      articles: [article()],
      aiMarkdown: "## 今日概览\n\n重要更新〔1〕",
    });
    expect(markdown).toContain("# 2026-09-08 · AI 前沿 · RSS 日报");
    expect(markdown).toContain("## 来源");
    expect(markdown).toContain("[A useful \\[update\\]](<https://example.com/update>)");
  });
});
