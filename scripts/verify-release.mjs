import { readFile, stat } from "node:fs/promises";

const tag = process.argv[2] ?? "";
const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
const expectedTag = `v${manifest.version}`;

if (tag !== expectedTag) {
  throw new Error(`Release tag ${tag || "<missing>"} does not match manifest version ${manifest.version}; expected ${expectedTag}.`);
}

for (const [name, maximum] of [["main.js", 5 * 1024 * 1024], ["styles.css", 1024 * 1024]]) {
  const size = (await stat(new URL(`../${name}`, import.meta.url))).size;
  if (size > maximum) throw new Error(`${name} exceeds the EdgeEver asset limit.`);
}
