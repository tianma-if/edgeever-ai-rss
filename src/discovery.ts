import { XMLParser } from "fast-xml-parser";
import { normalizePublicFeedUrl } from "./subscriptions";
import type { PluginContext } from "./edgeever";

export const COMMUNITY_DIRECTORY_URL = "https://raw.githubusercontent.com/timqian/chinese-independent-blogs/master/feed.opml";

export interface DirectorySource {
  name: string;
  url: string;
  siteUrl: string | null;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

export const parseCommunityDirectory = (xml: string): DirectorySource[] => {
  const parsed = parser.parse(xml) as { opml?: { body?: { outline?: unknown } } };
  const root = parsed.opml?.body?.outline;
  const list = Array.isArray(root) ? root : root ? [root] : [];
  const seen = new Set<string>();
  const sources: DirectorySource[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const url = typeof record["@_xmlUrl"] === "string" ? normalizePublicFeedUrl(record["@_xmlUrl"]) : null;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const name = String(record["@_title"] ?? record["@_text"] ?? new URL(url).hostname).trim().slice(0, 100);
    const siteUrl = typeof record["@_htmlUrl"] === "string" ? normalizePublicFeedUrl(record["@_htmlUrl"]) : null;
    sources.push({ name: name || new URL(url).hostname, url, siteUrl });
  }
  return sources;
};

export const fetchCommunityDirectory = async (context: PluginContext): Promise<DirectorySource[]> => {
  const response = await context.network.fetch(COMMUNITY_DIRECTORY_URL, { method: "GET", transport: "public" });
  if (!response.ok) throw new Error(`目录读取失败：HTTP ${response.status}`);
  const xml = await response.text();
  if (xml.length > 500_000) throw new Error("目录文件过大。");
  return parseCommunityDirectory(xml);
};
