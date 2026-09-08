import { CATEGORIES, DEFAULT_CATEGORY_IDS } from "./catalog";
import type { PluginContext, PluginSettingValue } from "./edgeever";

export const SETTINGS_MIGRATION_KEY = "settings-schema-v1-migrated";
export const categorySettingKey = (categoryId: string): string => `topics.${categoryId}`;
export const DIGEST_WINDOW_HOURS_KEY = "digest.window-hours";
export const DIGEST_MAX_ARTICLES_KEY = "digest.max-articles";
export const AUTO_REFRESH_KEY = "reader.auto-refresh";
export const AUTO_DIGEST_KEY = "digest.auto-enabled";
export const DIGEST_GENERATION_TIME_KEY = "digest.generation-time";

export interface ReaderPreferences {
  selectedCategoryIds: string[];
  digestWindowHours: number;
  digestMaxArticles: number;
  autoRefresh: boolean;
  autoDigest: boolean;
  digestGenerationTime: string;
}

const boundedNumber = (value: PluginSettingValue | null, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

export const resolveReaderPreferences = (values: Record<string, PluginSettingValue | null>): ReaderPreferences => ({
  selectedCategoryIds: CATEGORIES
    .filter((category) => values[categorySettingKey(category.id)] === true)
    .map((category) => category.id),
  digestWindowHours: boundedNumber(values[DIGEST_WINDOW_HOURS_KEY], 24, 1, 168),
  digestMaxArticles: boundedNumber(values[DIGEST_MAX_ARTICLES_KEY], 20, 1, 40),
  autoRefresh: values[AUTO_REFRESH_KEY] !== false,
  autoDigest: values[AUTO_DIGEST_KEY] === true,
  digestGenerationTime: typeof values[DIGEST_GENERATION_TIME_KEY] === "string" && /^(?:[01]\d|2[0-3]):00$/.test(values[DIGEST_GENERATION_TIME_KEY])
    ? values[DIGEST_GENERATION_TIME_KEY]
    : "08:00",
});

export const loadReaderPreferences = async (context: PluginContext): Promise<ReaderPreferences> => {
  const keys = [
    ...CATEGORIES.map((category) => categorySettingKey(category.id)),
    DIGEST_WINDOW_HOURS_KEY,
    DIGEST_MAX_ARTICLES_KEY,
    AUTO_REFRESH_KEY,
    AUTO_DIGEST_KEY,
    DIGEST_GENERATION_TIME_KEY,
  ];
  const entries = await Promise.all(keys.map(async (key) => [key, await context.settings.get(key)] as const));
  return resolveReaderPreferences(Object.fromEntries(entries));
};

export const digestCronExpression = (generationTime: string): string =>
  `0 ${Number(generationTime.slice(0, 2))} * * *`;

export const migrateLegacyCategorySettings = async (
  context: PluginContext,
  selectedCategoryIds: string[] | null,
  legacyAutoDigestEnabled = false,
): Promise<void> => {
  if (await context.storage.get<boolean>(SETTINGS_MIGRATION_KEY)) return;
  const selected = new Set(selectedCategoryIds ?? DEFAULT_CATEGORY_IDS);
  await Promise.all(CATEGORIES.map((category) => context.settings.set(categorySettingKey(category.id), selected.has(category.id))));
  await context.settings.set(AUTO_DIGEST_KEY, legacyAutoDigestEnabled);
  await context.storage.set(SETTINGS_MIGRATION_KEY, true);
};
