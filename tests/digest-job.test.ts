import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { PluginContext } from "../src/edgeever";
import { generateDigestText, runCategoryDigestJob } from "../src/main";

const rss = () => `<?xml version="1.0"?><rss version="2.0"><channel><item><title>Engineering update</title><link>https://example.com/update</link><pubDate>${new Date().toUTCString()}</pubDate><description>Useful change</description></item></channel></rss>`;

const contextWith = (generate: PluginContext["ai"]["generate"], autoTranslate = false, saveSucceeds = false): PluginContext => ({
  ai: { status: async () => ({ configured: true }), generate },
  network: { fetch: async () => new Response(rss(), { status: 200 }) },
  storage: { get: async () => null, set: async () => undefined },
  notebooks: { list: async () => [{ id: "notebook", parentId: null, name: "Notes", memoCount: 0 }] },
  notes: {
    query: async () => ({ notes: [], totalCount: 0, nextOffset: null }),
    create: async () => {
      if (!saveSucceeds) throw new Error("disk is full");
      return { id: "created", notebookId: "notebook", title: "Digest", contentMarkdown: "Digest", tags: [] };
    },
    update: async () => { throw new Error("unused"); },
  },
  settings: { get: async (key: string) => key === "topics.engineering" ? true : key === "translation.auto-enabled" ? autoTranslate : null, set: async () => undefined, remove: async () => undefined },
} as unknown as PluginContext);

describe("digest job failures", () => {
  let errorLog: ReturnType<typeof spyOn>;
  beforeEach(() => { errorLog = spyOn(console, "error").mockImplementation(() => undefined); });
  afterEach(() => errorLog.mockRestore());

  test("reports an AI error with its category and stage", async () => {
    const result = await runCategoryDigestJob(contextWith(async () => { throw new Error("model unavailable"); }));
    expect(result.failed).toBe(1);
    expect(result.failureDetails).toEqual(["开发与开源 · AI 生成：model unavailable"]);
  });

  test("reports a note write error separately from AI generation", async () => {
    const result = await runCategoryDigestJob(contextWith(async () => ({ text: "## 01 | Engineering update\n\n> 🔗 **信源**：〔1〕" })));
    expect(result.failed).toBe(1);
    expect(result.failureDetails).toEqual(["开发与开源 · 保存笔记：disk is full"]);
  });

  test("keeps translation requests within the host output token limit", async () => {
    const limits: number[] = [];
    await runCategoryDigestJob(contextWith(async (input) => {
      limits.push(input.maxOutputTokens ?? 0);
      return { text: limits.length === 1 ? "## 01 | Engineering update\n\n> 🔗 **信源**：〔1〕" : "[]" };
    }, true, true));
    expect(limits).toEqual([3_000, 1_500]);
  });

  test("retries once when the provider reports an affordable token ceiling", async () => {
    const limits: number[] = [];
    const context = contextWith(async (input) => {
      limits.push(input.maxOutputTokens ?? 0);
      if (limits.length === 1) throw new Error("can only afford 2200");
      return { text: "Digest" };
    });
    expect(await generateDigestText(context, "system", "prompt")).toBe("Digest");
    expect(limits).toEqual([3_000, 1_870]);
  });

  test("omits provider account URLs from the visible failure", async () => {
    const result = await runCategoryDigestJob(contextWith(async () => {
      throw new Error("Need credits: https://openrouter.ai/workspaces/default/keys/secret-id");
    }));
    expect(result.failureDetails[0]).toContain("[链接已省略]");
    expect(result.failureDetails[0]).not.toContain("secret-id");
  });
});
