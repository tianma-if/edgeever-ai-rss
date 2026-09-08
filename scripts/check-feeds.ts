import { FEEDS } from "../src/catalog";
import { parseFeed } from "../src/feed";

interface FeedCheck {
  name: string;
  status: "ok" | "failed";
  detail: string;
}

const results: FeedCheck[] = new Array(FEEDS.length);
let cursor = 0;

const worker = async (): Promise<void> => {
  while (cursor < FEEDS.length) {
    const index = cursor++;
    const source = FEEDS[index]!;
    try {
      const response = await fetch(source.url, {
        headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9" },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const articles = parseFeed(await response.text(), source);
      if (!articles.length) throw new Error("no parseable articles");
      const latest = articles
        .map((article) => article.publishedAt)
        .filter((publishedAt): publishedAt is string => Boolean(publishedAt))
        .sort((left, right) => right.localeCompare(left))[0];
      results[index] = {
        name: source.name,
        status: "ok",
        detail: `${articles.length} articles${latest ? `, latest ${latest}` : ", no article dates"}`,
      };
    } catch (error) {
      results[index] = {
        name: source.name,
        status: "failed",
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  }
};

await Promise.all(Array.from({ length: Math.min(4, FEEDS.length) }, worker));

for (const result of results) {
  console.log(`${result.status === "ok" ? "PASS" : "FAIL"} ${result.name}: ${result.detail}`);
}

const failures = results.filter((result) => result.status === "failed");
console.log(`\n${FEEDS.length - failures.length}/${FEEDS.length} feeds healthy.`);
if (failures.length) process.exitCode = 1;
