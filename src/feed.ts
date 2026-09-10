import { XMLParser } from "fast-xml-parser";
import { resolveFeedUrls, type FeedSource } from "./catalog";
import type { PluginContext } from "./edgeever";

export interface Article {
  id: string;
  sourceId: string;
  sourceName: string;
  categoryId: string;
  title: string;
  url: string;
  publishedAt: string | null;
  author: string | null;
  summary: string;
  content: string;
  language: "zh" | "en";
  sourceRole?: FeedSource["digestRole"];
  relatedCoverage?: RelatedCoverage[];
}

export interface RelatedCoverage {
  articleId: string;
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  trimValues: true,
  processEntities: true,
});

const asArray = <T>(value: T | T[] | null | undefined): T[] => value == null ? [] : Array.isArray(value) ? value : [value];

const text = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  return text(record["#text"] ?? record["#cdata"] ?? record.value ?? record.name ?? "");
};

export const plainText = (value: unknown): string => {
  const raw = text(value);
  if (!raw) return "";
  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = raw;
    return (template.content.textContent ?? "").replace(/\s+/g, " ").trim();
  }
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const atomLink = (value: unknown): string => {
  for (const candidate of asArray(value)) {
    if (typeof candidate === "string") return candidate;
    if (candidate && typeof candidate === "object") {
      const record = candidate as Record<string, unknown>;
      const href = text(record["@_href"]);
      const rel = text(record["@_rel"]);
      if (href && (!rel || rel === "alternate")) return href;
    }
  }
  return "";
};

const stableId = (sourceId: string, item: Record<string, unknown>, url: string, title: string): string => {
  const supplied = text(item.guid ?? item.id);
  return `${sourceId}:${supplied || url || title}`;
};

const validDate = (value: unknown): string | null => {
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeItem = (item: Record<string, unknown>, source: FeedSource, atom: boolean): Article | null => {
  const title = plainText(item.title) || "Untitled";
  const url = atom ? atomLink(item.link) : text(item.link) || atomLink(item.link);
  if (!/^https?:\/\//i.test(url)) return null;
  const rawContent = item["content:encoded"] ?? item.content ?? item.description ?? item.summary ?? "";
  const content = plainText(rawContent).slice(0, 50_000);
  const summary = plainText(item.summary ?? item.description ?? rawContent).slice(0, 800);
  return {
    id: stableId(source.id, item, url, title),
    sourceId: source.id,
    sourceName: source.name,
    categoryId: source.categoryId,
    title,
    url,
    publishedAt: validDate(item.pubDate ?? item.published ?? item.updated ?? item.date),
    author: plainText(item.author ?? item["dc:creator"] ?? item.creator) || null,
    summary,
    content,
    language: source.language,
    sourceRole: source.digestRole,
  };
};

export const parseFeed = (xml: string, source: FeedSource): Article[] => {
  const document = parser.parse(xml) as Record<string, unknown>;
  const rss = document.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  const atomFeed = document.feed as Record<string, unknown> | undefined;
  const rdf = (document["rdf:RDF"] ?? document.RDF) as Record<string, unknown> | undefined;
  const atom = Boolean(atomFeed);
  const items = atomFeed?.entry ?? channel?.item ?? rdf?.item;
  return asArray(items)
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => normalizeItem(item, source, atom))
    .filter((item): item is Article => item !== null)
    .slice(0, 40);
};

const readWithRedirects = async (context: PluginContext, initialUrl: string): Promise<Response> => {
  let url = initialUrl;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await context.network.fetch(url, {
      method: "GET",
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9" },
      redirect: "manual",
      transport: "public",
    });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location) throw new Error(`Feed redirected without a location (${response.status})`);
    const next = new URL(location, url);
    if (next.protocol !== "https:") throw new Error("Feed redirected to a non-HTTPS URL");
    url = next.toString();
  }
  throw new Error("Feed redirected too many times");
};

export const fetchFeed = async (context: PluginContext, source: FeedSource): Promise<Article[]> => {
  const errors: string[] = [];
  for (const url of resolveFeedUrls(source)) {
    try {
      const response = await readWithRedirects(context, url);
      if (!response.ok) {
        errors.push(`${url} HTTP ${response.status}`);
        continue;
      }
      const articles = parseFeed(await response.text(), source);
      if (articles.length) return articles;
      errors.push(`${url} returned no parseable articles`);
    } catch (error) {
      errors.push(`${url} ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`${source.name} failed: ${errors.join("; ") || "no feed URLs"}`);
};
