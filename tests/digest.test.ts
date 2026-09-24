import { describe, expect, test } from "bun:test";
import { CATEGORIES, FEEDS } from "../src/catalog";
import {
  buildDigestMarkdown,
  digestArticlePayload,
  digestDateKey,
  digestTags,
  digestTitle,
  renderDigestBody,
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
      aiMarkdown: "## 01 | 重要更新\n\n- **核心进展**：要点\n\n> 🔗 **信源**：〔1〕",
      windowHours: 48,
    });
    expect(markdown).toContain("2026-09-08");
    expect(markdown).toContain("AI 前沿");
    expect(markdown).toContain("## 01 | 重要更新");
    expect(markdown).not.toContain("# 2026-09-08 · AI 前沿 · RSS 日报");
    expect(markdown).not.toContain("## 热点一");
    expect(markdown).not.toContain("## 来源");
    expect(markdown).not.toContain("今日速览");
    expect(markdown).toContain("最近 48 小时");
    expect(markdown).toContain("[OpenAI News](<https://example.com/update>)");

    // Also verify any residual 速览 block from older/cached responses is stripped cleanly
    const cleaned = renderDigestBody("> 💡 **今日速览**：行业重要更新。\n\n---\n\n## 01 | 重要更新", [article()]);
    expect(cleaned).not.toContain("今日速览");
    expect(cleaned).toContain("## 01 | 重要更新");
  });

  test("renders valid citations with corroborating sources and leaves invalid ones unchanged", () => {
    const markdown = renderDigestBody("## 01 | 模型能力升级\n\n热点〔1〕〔1〕，标点。〔1〕，无效〔2〕。", [article({
      sourceName: "Source [one]",
      url: "https://example.com/a>b",
      relatedCoverage: [{
        articleId: "related",
        sourceId: "related-source",
        sourceName: "Related",
        title: "Related story",
        url: "https://related.example.com/story",
        publishedAt: null,
      }],
    })]);
    expect(markdown).toContain("[Source \\[one\\]](<https://example.com/a%3Eb>)");
    expect(markdown).toContain("[佐证 · Related](<https://related.example.com/story>)");
    expect(markdown).toContain(" · [Source \\[one\\]]");
    expect(markdown).toContain("标点。 [Source \\[one\\]]");
    expect(markdown).toContain("无效〔2〕");
  });

  test("includes translated summaries in the AI payload", () => {
    expect(digestArticlePayload([article({ summary: "翻译后的摘要", content: "Original body" })])[0]).toMatchObject({
      title: "A useful [update]",
      summary: "翻译后的摘要",
      excerpt: "Original body",
    });
  });

  test("keeps a full digest request within the host AI prompt limit", () => {
    const articles = Array.from({ length: 20 }, (_, index) => article({
      id: `oversized-${index}`,
      title: "题".repeat(2_000),
      sourceName: "源".repeat(500),
      summary: "摘要".repeat(1_000),
      content: "正文".repeat(25_000),
      relatedCoverage: Array.from({ length: 20 }, (_, coverageIndex) => ({
        articleId: `${index}-${coverageIndex}`,
        sourceId: "other",
        sourceName: "源".repeat(500),
        title: "标题".repeat(1_000),
        url: "https://example.com/related",
        publishedAt: null,
      })),
    }));
    const prompt = JSON.stringify({ category: "AI 前沿", articles: digestArticlePayload(articles) });
    expect(prompt.length).toBeLessThan(90_000);
  });
});
