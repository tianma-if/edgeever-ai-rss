import { describe, expect, test } from "bun:test";
import { clusterRelatedArticles } from "../src/dedupe";
import type { Article } from "../src/feed";

const article = (overrides: Partial<Article> = {}): Article => ({
  id: "briefing-story",
  sourceId: "briefing",
  sourceName: "AI Briefing",
  categoryId: "ai",
  title: "OpenAI launches GPT-6 coding model",
  url: "https://example.com/gpt-6?utm_source=digest",
  publishedAt: "2026-09-08T10:00:00.000Z",
  author: null,
  summary: "A model launch.",
  content: "A model launch with details.",
  language: "en",
  sourceRole: "briefing",
  ...overrides,
});

describe("cross-source event clustering", () => {
  test("groups canonical links and keeps the higher-authority representative", () => {
    const clustered = clusterRelatedArticles([
      article(),
      article({
        id: "official-story",
        sourceId: "official",
        sourceName: "OpenAI News",
        title: "Introducing GPT-6",
        url: "https://example.com/gpt-6",
        publishedAt: "2026-09-08T09:00:00.000Z",
        sourceRole: "official",
      }),
    ]);
    expect(clustered).toHaveLength(1);
    expect(clustered[0]?.id).toBe("official-story");
    expect(clustered[0]?.relatedCoverage?.map((coverage) => coverage.articleId)).toEqual(["briefing-story"]);
  });

  test("clusters sufficiently similar cross-source titles within 72 hours", () => {
    const clustered = clusterRelatedArticles([
      article(),
      article({
        id: "analysis-story",
        sourceId: "analysis",
        sourceName: "Model Analysis",
        title: "OpenAI launches its new GPT-6 coding model",
        url: "https://analysis.example/gpt6",
        publishedAt: "2026-09-08T08:00:00.000Z",
        sourceRole: "analysis",
      }),
    ]);
    expect(clustered).toHaveLength(1);
    expect(clustered[0]?.relatedCoverage).toHaveLength(1);
  });

  test("does not merge similar posts from one source or events outside the time window", () => {
    const clustered = clusterRelatedArticles([
      article(),
      article({ id: "same-source", title: "OpenAI launches GPT-6 coding model", url: "https://example.com/follow-up" }),
      article({
        id: "old-source",
        sourceId: "old",
        title: "OpenAI launches its new GPT-6 coding model",
        url: "https://old.example/gpt6",
        publishedAt: "2026-09-04T08:00:00.000Z",
      }),
    ]);
    expect(clustered).toHaveLength(3);
  });
});
