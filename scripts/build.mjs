import { copyFile, readFile } from "node:fs/promises";
import { build } from "esbuild";

const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const banner = `/*! ${manifest.name} v${manifest.version} | MIT License | https://github.com/tianma-if/edgeever-ai-rss */`;

await build({
  entryPoints: [new URL("../src/main.ts", import.meta.url).pathname],
  outfile: new URL("../main.js", import.meta.url).pathname,
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  sourcemap: false,
  minify: true,
  banner: { js: banner },
});

await copyFile(new URL("../src/styles.css", import.meta.url), new URL("../styles.css", import.meta.url));
