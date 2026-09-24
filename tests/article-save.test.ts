import { expect, test } from "bun:test";
import { articleSaveTag, buildSavedArticleMarkdown } from "../src/article-save";
import type { Article } from "../src/feed";

test("saves feed text as escaped Markdown with stable provenance", () => {
  const article: Article = {
    id: "source:42", sourceId: "source", sourceName: "Example", categoryId: "chinese",
    title: "A [test]", url: "https://example.com/post", publishedAt: "2026-09-24T00:00:00.000Z",
    author: "Writer", summary: "", content: "![remote](https://example.com/pixel) <script>alert(1)</script>", language: "zh",
  };
  const markdown = buildSavedArticleMarkdown(article);
  expect(markdown).toContain("# A \\[test\\]");
  expect(markdown).toContain("- 原文：<https://example.com/post>");
  expect(markdown).not.toContain("![remote]");
  expect(markdown).not.toContain("<script>");
  expect(articleSaveTag(article)).toBe(articleSaveTag({ ...article, title: "Changed" }));
});
