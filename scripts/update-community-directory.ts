import { readFile, writeFile } from "node:fs/promises";
import { COMMUNITY_DIRECTORY_URL, parseCommunityDirectory } from "../src/discovery";

const licenseResponse = await fetch("https://raw.githubusercontent.com/timqian/chinese-independent-blogs/master/LICENSE");
if (!licenseResponse.ok) throw new Error(`Community directory license fetch failed: HTTP ${licenseResponse.status}`);
const currentLicense = (await licenseResponse.text()).trim();
const reviewedLicense = (await readFile(new URL("../LICENSES/chinese-independent-blogs-MIT.txt", import.meta.url), "utf8")).trim();
if (currentLicense !== reviewedLicense) throw new Error("Community directory license changed. Review it before updating the snapshot.");

const response = await fetch(COMMUNITY_DIRECTORY_URL);
if (!response.ok) throw new Error(`Community directory fetch failed: HTTP ${response.status}`);
const xml = await response.text();
if (xml.length > 500_000) throw new Error("Community directory exceeds 500 KB.");
const entries = parseCommunityDirectory(xml);
if (entries.length < 600) throw new Error(`Only ${entries.length} public HTTPS feeds found; refusing to replace the snapshot.`);

const source = [
  "// Generated from timqian/chinese-independent-blogs feed.opml.",
  `// Source: ${COMMUNITY_DIRECTORY_URL}`,
  "// License: MIT, copyright 2019 Tim Qian. See LICENSES/chinese-independent-blogs-MIT.txt.",
  `// Refreshed: ${new Date().toISOString().slice(0, 10)}. Public HTTPS feeds: ${entries.length}.`,
  "import type { DirectorySource } from \"./discovery\";",
  "export const COMMUNITY_DIRECTORY: DirectorySource[] = [",
  ...entries.map((entry) => `  ${JSON.stringify(entry)},`),
  "];",
  "",
].join("\n");
await writeFile(new URL("../src/community-directory.ts", import.meta.url), source);
console.log(`Wrote ${entries.length} public HTTPS feeds to src/community-directory.ts`);
