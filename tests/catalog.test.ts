import { describe, expect, test } from "bun:test";
import { CATEGORIES, DEFAULT_CATEGORY_IDS, FEEDS, RSSHUB_PUBLIC_ORIGINS, resolveFeedUrls, topicSourceList } from "../src/catalog";
import { selectSources } from "../src/subscriptions";

interface ManifestSettingField {
  key: string;
  description?: string;
  default?: boolean;
  list?: ReturnType<typeof topicSourceList>;
}

interface PluginManifest {
  settings?: { fields?: ManifestSettingField[] };
}

const manifest = await Bun.file(new URL("../manifest.json", import.meta.url)).json() as PluginManifest;

describe("feed catalog", () => {
  test("starts new installs with exactly 60 feeds across three topics", () => {
    expect(DEFAULT_CATEGORY_IDS).toEqual(["ai", "engineering", "chinese"]);
    const sources = selectSources(DEFAULT_CATEGORY_IDS, { featuredIds: [], personal: [] });
    expect(sources.length).toBe(60);
    expect(sources.filter((source) => source.categoryId === "ai").length).toBe(41);
    expect(sources.filter((source) => source.categoryId === "engineering").length).toBe(10);
    expect(sources.filter((source) => source.categoryId === "chinese").length).toBe(9);
    expect(sources.every((source) => !source.optional)).toBe(true);
    for (const category of CATEGORIES) {
      expect(manifest.settings?.fields?.find((field) => field.key === `topics.${category.id}`)?.default).toBe(category.defaultEnabled === true);
    }
  });

  test("keeps identifiers and feed URLs unique", () => {
    expect(new Set(FEEDS.map((feed) => feed.id)).size).toBe(FEEDS.length);
    expect(new Set(FEEDS.map((feed) => feed.url)).size).toBe(FEEDS.length);
  });

  test("uses direct public HTTPS feeds for every bundled source", () => {
    for (const feed of FEEDS) {
      expect(feed.url.startsWith("https://")).toBe(true);
      expect(feed.siteUrl.startsWith("https://")).toBe(true);
    }
  });

  test("provides broad AI coverage and at least two sources per topic", () => {
    const aiFeeds = FEEDS.filter((feed) => feed.categoryId === "ai");
    expect(aiFeeds.length).toBeGreaterThanOrEqual(41);
    expect(aiFeeds.every((feed) => feed.digestRole)).toBe(true);
    expect(new Set(aiFeeds.map((feed) => feed.digestRole))).toEqual(new Set(["official", "briefing", "research", "analysis", "practitioner", "interview"]));
    for (const category of CATEGORIES) {
      expect(FEEDS.filter((feed) => feed.categoryId === category.id).length).toBeGreaterThanOrEqual(2);
    }
  });

  test("uses free public RSSHub instances for publishers without a first-party feed", () => {
    const source = FEEDS.find((feed) => feed.id === "huggingface-papers");
    expect(source?.rsshubRoute).toBe("/huggingface/daily-papers");
    expect(resolveFeedUrls(source!)).toEqual(
      RSSHUB_PUBLIC_ORIGINS.map((origin) => `${origin}/huggingface/daily-papers`),
    );
    expect(resolveFeedUrls(FEEDS[0]!)).toEqual([FEEDS[0]!.url]);
  });

  test("discloses every bundled source on its topic setting list", () => {
    const fields = manifest.settings?.fields ?? [];
    for (const category of CATEGORIES) {
      const field = fields.find((candidate) => candidate.key === `topics.${category.id}`);
      expect(field?.description).toBeUndefined();
      expect(field?.list).toEqual(topicSourceList(category.id));
    }
  });
});
