import { describe, expect, test } from "bun:test";
import type { Article } from "../src/feed";
import {
  headlineSourceSignature,
  headlineTranslationIsCurrent,
  parseHeadlineTranslations,
  sourceAlreadyMatchesTarget,
} from "../src/translation";

const article: Article = {
  id: "article-1",
  sourceId: "source-1",
  sourceName: "Source",
  categoryId: "ai",
  title: "A model update",
  url: "https://example.com/update",
  publishedAt: "2026-09-08T12:00:00.000Z",
  author: null,
  summary: "The model is faster.",
  content: "",
  language: "en",
};

describe("automatic headline translation", () => {
  test("parses indexed JSON without trusting extra model output", () => {
    const translations = parseHeadlineTranslations(`\`\`\`json
[{"index":0,"title":"模型更新","summary":"该模型速度更快。"},{"index":99,"title":"忽略","summary":"忽略"}]
\`\`\``, [article], "zh-CN");
    expect(translations.size).toBe(1);
    expect(translations.get(article.id)?.title).toBe("模型更新");
    expect(headlineTranslationIsCurrent(article, translations.get(article.id), "zh-CN")).toBe(true);
  });

  test("invalidates cached translations when source text or target changes", () => {
    const translation = {
      targetLanguage: "zh-CN" as const,
      sourceSignature: headlineSourceSignature(article),
      title: "模型更新",
      summary: "该模型速度更快。",
    };
    expect(headlineTranslationIsCurrent({ ...article, summary: "Changed" }, translation, "zh-CN")).toBe(false);
    expect(headlineTranslationIsCurrent(article, translation, "ja")).toBe(false);
  });

  test("skips AI when source language already matches the target", () => {
    expect(sourceAlreadyMatchesTarget(article, "en")).toBe(true);
    expect(sourceAlreadyMatchesTarget({ ...article, language: "zh" }, "zh-CN")).toBe(true);
    expect(sourceAlreadyMatchesTarget(article, "zh-CN")).toBe(false);
  });
});
