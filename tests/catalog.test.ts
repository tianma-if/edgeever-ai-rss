import { describe, expect, test } from "bun:test";
import { CATEGORIES, FEEDS } from "../src/catalog";

interface ManifestSettingField {
  key: string;
  description?: string;
}

interface PluginManifest {
  settings?: { fields?: ManifestSettingField[] };
}

const manifest = await Bun.file(new URL("../manifest.json", import.meta.url)).json() as PluginManifest;

describe("feed catalog", () => {
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
    expect(aiFeeds.length).toBeGreaterThanOrEqual(18);
    expect(aiFeeds.every((feed) => feed.digestRole)).toBe(true);
    expect(new Set(aiFeeds.map((feed) => feed.digestRole))).toEqual(new Set(["official", "briefing", "research", "analysis", "practitioner", "interview"]));
    for (const category of CATEGORIES) {
      expect(FEEDS.filter((feed) => feed.categoryId === category.id).length).toBeGreaterThanOrEqual(2);
    }
  });

  test("discloses every bundled source on its topic setting", () => {
    const fields = manifest.settings?.fields ?? [];
    for (const category of CATEGORIES) {
      const description = fields.find((field) => field.key === `topics.${category.id}`)?.description;
      expect(description).toBeString();
      for (const feed of FEEDS.filter((candidate) => candidate.categoryId === category.id)) {
        expect(description).toContain(feed.name);
        expect(description).toContain(new URL(feed.siteUrl).hostname.replace(/^www\./, ""));
      }
    }
  });
});
