import { describe, expect, test } from "bun:test";
import { cleanSubscriptions, createPersonalSource, normalizePublicFeedUrl, selectSources } from "../src/subscriptions";
import { parseCommunityDirectory } from "../src/discovery";

describe("subscription selection", () => {
  test("adds only opted-in featured sources in enabled topics", () => {
    const sources = selectSources(["engineering"], { featuredIds: ["ruanyifeng", "appinn"], personal: [] });
    expect(sources.some((source) => source.id === "ruanyifeng")).toBe(true);
    expect(sources.some((source) => source.id === "codingnow")).toBe(false);
    expect(sources.some((source) => source.id === "appinn")).toBe(false);
  });

  test("normalizes saved subscriptions and removes duplicates", () => {
    const value = cleanSubscriptions({
      featuredIds: ["ruanyifeng", "ruanyifeng", "unknown"],
      personal: [
        { url: "https://example.com/feed.xml#fragment", categoryId: "chinese", name: "示例" },
        { url: "https://example.com/feed.xml", categoryId: "chinese", name: "重复" },
        { url: "https://localhost/feed", categoryId: "chinese" },
      ],
    });
    expect(value.featuredIds).toEqual(["ruanyifeng"]);
    expect(value.personal).toEqual([expect.objectContaining({ name: "示例", url: "https://example.com/feed.xml" })]);
    expect(selectSources(["chinese"], value).some((source) => source.id.startsWith("personal-"))).toBe(true);
  });

  test("rejects credentialed and local network addresses", () => {
    for (const url of ["http://example.com/feed", "https://user:pass@example.com/feed", "https://localhost/feed", "https://192.168.1.3/feed", "https://site.local/feed", "https://[::1]/feed"]) {
      expect(normalizePublicFeedUrl(url)).toBeNull();
    }
    expect(createPersonalSource("https://example.com/feed", "", "chinese", "zh")?.name).toBe("example.com");
  });

  test("filters the community OPML to unique public HTTPS sources", () => {
    const xml = '<opml><body><outline title="A" xmlUrl="https://a.example/feed" htmlUrl="https://a.example"/><outline title="B" xmlUrl="http://b.example/feed"/><outline title="A2" xmlUrl="https://a.example/feed"/></body></opml>';
    expect(parseCommunityDirectory(xml)).toEqual([{ name: "A", url: "https://a.example/feed", siteUrl: "https://a.example/" }]);
  });
});
