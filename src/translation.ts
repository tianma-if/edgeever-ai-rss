import type { Article } from "./feed";

export const TRANSLATION_TARGETS = ["zh-CN", "zh-TW", "en", "ja", "ko"] as const;
export type TranslationTarget = typeof TRANSLATION_TARGETS[number];

export interface HeadlineTranslation {
  targetLanguage: TranslationTarget;
  sourceSignature: string;
  title: string;
  summary: string;
}

export const isTranslationTarget = (value: unknown): value is TranslationTarget =>
  typeof value === "string" && TRANSLATION_TARGETS.includes(value as TranslationTarget);

export const translationTargetName = (target: TranslationTarget): string => ({
  "zh-CN": "简体中文",
  "zh-TW": "繁体中文",
  en: "英语",
  ja: "日语",
  ko: "韩语",
})[target];

export const headlineSourceSignature = (article: Pick<Article, "title" | "summary">): string =>
  `${article.title}\u0000${article.summary}`;

export const sourceAlreadyMatchesTarget = (article: Pick<Article, "language">, target: TranslationTarget): boolean =>
  (article.language === "zh" && target === "zh-CN") || (article.language === "en" && target === "en");

export const headlineTranslationIsCurrent = (
  article: Pick<Article, "title" | "summary">,
  translation: HeadlineTranslation | undefined,
  target: TranslationTarget,
): boolean => Boolean(
  translation
  && translation.targetLanguage === target
  && translation.sourceSignature === headlineSourceSignature(article),
);

const extractJson = (value: string): unknown => {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? value.slice(value.indexOf("["), value.lastIndexOf("]") + 1);
  return JSON.parse(candidate);
};

export const parseHeadlineTranslations = (
  value: string,
  articles: Article[],
  targetLanguage: TranslationTarget,
): Map<string, HeadlineTranslation> => {
  const parsed = extractJson(value);
  if (!Array.isArray(parsed)) throw new Error("Translation output is not an array");
  const translations = new Map<string, HeadlineTranslation>();
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const index = Number(record.index);
    const article = Number.isInteger(index) ? articles[index] : undefined;
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const summary = typeof record.summary === "string" ? record.summary.trim() : "";
    if (!article || !title) continue;
    translations.set(article.id, {
      targetLanguage,
      sourceSignature: headlineSourceSignature(article),
      title: title.slice(0, 500),
      summary: summary.slice(0, 2_000),
    });
  }
  return translations;
};
