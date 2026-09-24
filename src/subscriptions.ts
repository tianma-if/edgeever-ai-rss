import { CATEGORIES, FEEDS, type FeedSource } from "./catalog";
import type { PluginContext } from "./edgeever";

const STORAGE_KEY = "subscriptions-v1";
export const MAX_PERSONAL_SOURCES = 30;

export interface PersonalSource {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  language: "zh" | "en";
}

export interface Subscriptions {
  featuredIds: string[];
  personal: PersonalSource[];
}

const hashUrl = (url: string): string => {
  let hash = 2166136261;
  for (const char of url) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
};

export const normalizePublicFeedUrl = (value: string): string | null => {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443") return null;
    if (!host.includes(".") || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (/^\d+(?:\.\d+){3}$/.test(host) || host.startsWith("[")) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
};

export const createPersonalSource = (urlValue: string, nameValue: string, categoryId: string, language: "zh" | "en"): PersonalSource | null => {
  const url = normalizePublicFeedUrl(urlValue);
  if (!url || !CATEGORIES.some((category) => category.id === categoryId)) return null;
  return {
    id: `personal-${hashUrl(url)}`,
    name: nameValue.trim().slice(0, 100) || new URL(url).hostname,
    url,
    categoryId,
    language,
  };
};

export const cleanSubscriptions = (value: unknown): Subscriptions => {
  if (!value || typeof value !== "object") return { featuredIds: [], personal: [] };
  const record = value as Record<string, unknown>;
  const optionalIds = new Set(FEEDS.filter((feed) => feed.optional).map((feed) => feed.id));
  const featuredIds = Array.isArray(record.featuredIds)
    ? [...new Set(record.featuredIds.filter((id): id is string => typeof id === "string" && optionalIds.has(id)))]
    : [];
  const personal: PersonalSource[] = [];
  const seen = new Set(FEEDS.map((feed) => normalizePublicFeedUrl(feed.url)));
  if (Array.isArray(record.personal)) for (const item of record.personal.slice(0, MAX_PERSONAL_SOURCES)) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const source = createPersonalSource(
      typeof candidate.url === "string" ? candidate.url : "",
      typeof candidate.name === "string" ? candidate.name : "",
      typeof candidate.categoryId === "string" ? candidate.categoryId : "",
      candidate.language === "en" ? "en" : "zh",
    );
    if (!source || seen.has(source.url)) continue;
    seen.add(source.url);
    personal.push(source);
  }
  return { featuredIds, personal };
};

export const loadSubscriptions = async (context: PluginContext): Promise<Subscriptions> =>
  cleanSubscriptions(await context.storage.get<unknown>(STORAGE_KEY));

export const saveSubscriptions = async (context: PluginContext, value: Subscriptions): Promise<void> =>
  context.storage.set(STORAGE_KEY, cleanSubscriptions(value));

export const selectSources = (selectedCategoryIds: string[], subscriptions: Subscriptions): FeedSource[] => {
  const categories = new Set(selectedCategoryIds);
  const featured = new Set(subscriptions.featuredIds);
  return [
    ...FEEDS.filter((feed) => categories.has(feed.categoryId) && (!feed.optional || featured.has(feed.id))),
    ...subscriptions.personal.filter((feed) => categories.has(feed.categoryId)).map((feed) => ({
      ...feed,
      siteUrl: new URL(feed.url).origin,
    })),
  ];
};
