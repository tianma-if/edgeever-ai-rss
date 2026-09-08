import { describe, expect, test } from "bun:test";
import { FEEDS } from "../src/catalog";
import { parseFeed, plainText } from "../src/feed";

const source = FEEDS[0]!;

describe("feed parser", () => {
  test("parses RSS items", () => {
    const articles = parseFeed(`<?xml version="1.0"?><rss version="2.0"><channel><item><guid>a</guid><title>First &amp; best</title><link>https://example.com/a</link><pubDate>Mon, 08 Sep 2026 01:00:00 GMT</pubDate><description><![CDATA[<p>Hello <strong>world</strong></p>]]></description></item></channel></rss>`, source);
    expect(articles).toHaveLength(1);
    expect(articles[0]?.title).toBe("First & best");
    expect(articles[0]?.summary).toBe("Hello world");
    expect(articles[0]?.publishedAt).toBe("2026-09-08T01:00:00.000Z");
  });

  test("parses Atom alternate links", () => {
    const articles = parseFeed(`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><id>x</id><title>Atom post</title><link rel="alternate" href="https://example.com/x"/><updated>2026-09-08T02:00:00Z</updated><summary>Summary</summary></entry></feed>`, source);
    expect(articles[0]?.url).toBe("https://example.com/x");
    expect(articles[0]?.summary).toBe("Summary");
  });

  test("removes executable markup in text fallback", () => {
    expect(plainText("<p>Safe</p><script>alert(1)</script>")).toBe("Safe");
  });
});
