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

  test("extracts only HTTPS article images from feed media or content", () => {
    const media = parseFeed(`<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><item><title>Media</title><link>https://example.com/post</link><media:thumbnail url="https://cdn.example.com/thumb.jpg"/><description>Summary</description></item></channel></rss>`, source);
    const content = parseFeed(`<?xml version="1.0"?><rss version="2.0"><channel><item><title>Content</title><link>https://example.com/posts/item</link><description><![CDATA[<img src="/cover.png"><p>Summary</p>]]></description></item></channel></rss>`, source);
    const insecure = parseFeed(`<?xml version="1.0"?><rss version="2.0"><channel><item><title>Insecure</title><link>https://example.com/post</link><enclosure type="image/jpeg" url="http://example.com/cover.jpg"/></item></channel></rss>`, source);
    const local = parseFeed(`<?xml version="1.0"?><rss version="2.0"><channel><item><title>Local</title><link>https://example.com/post</link><enclosure type="image/jpeg" url="https://127.0.0.1/cover.jpg"/></item></channel></rss>`, source);
    expect(media[0]?.imageUrl).toBe("https://cdn.example.com/thumb.jpg");
    expect(content[0]?.imageUrl).toBe("https://example.com/cover.png");
    expect(insecure[0]?.imageUrl).toBeUndefined();
    expect(local[0]?.imageUrl).toBeUndefined();
  });

  test("removes executable markup in text fallback", () => {
    expect(plainText("<p>Safe</p><script>alert(1)</script>")).toBe("Safe");
  });
});
