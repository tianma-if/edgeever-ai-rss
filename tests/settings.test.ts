import { describe, expect, test } from "bun:test";
import { digestCronExpression, resolveReaderPreferences } from "../src/settings";

describe("digest settings", () => {
  test("resolves host-rendered settings into bounded runtime preferences", () => {
    const preferences = resolveReaderPreferences({
      "topics.ai": true,
      "topics.science": true,
      "digest.window-hours": 999,
      "digest.max-articles": 0,
      "translation.auto-enabled": false,
      "translation.target-language": "ja",
      "digest.auto-enabled": true,
      "digest.generation-time": "21:00",
    });
    expect(preferences.selectedCategoryIds).toEqual(["ai", "science"]);
    expect(preferences.digestWindowHours).toBe(168);
    expect(preferences.digestMaxArticles).toBe(1);
    expect(preferences.autoTranslate).toBe(false);
    expect(preferences.translationTarget).toBe("ja");
    expect(preferences.autoDigest).toBe(true);
    expect(preferences.digestGenerationTime).toBe("21:00");
    expect(digestCronExpression(preferences.digestGenerationTime)).toBe("0 21 * * *");
  });

  test("uses safe runtime fallbacks when settings are absent", () => {
    const preferences = resolveReaderPreferences({});
    expect(preferences.selectedCategoryIds).toEqual([]);
    expect(preferences.digestWindowHours).toBe(24);
    expect(preferences.digestMaxArticles).toBe(20);
    expect(preferences.autoTranslate).toBe(true);
    expect(preferences.translationTarget).toBe("zh-CN");
    expect(preferences.autoDigest).toBe(false);
    expect(preferences.digestGenerationTime).toBe("08:00");
  });
});
