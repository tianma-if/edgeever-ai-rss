import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));

describe("plugin manifest", () => {
  test("ships Simplified Chinese and Japanese marketplace descriptions", () => {
    for (const locale of ["zh-CN", "ja"]) {
      expect(manifest.locales?.[locale]?.description).toBeTruthy();
    }
  });
});
