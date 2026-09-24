# EdgeEver AI RSS

[简体中文](README.zh-CN.md)

An official plugin for [EdgeEver](https://github.com/tianma-if/edgeever).

An AI-first RSS and Atom digest plugin for EdgeEver. It uses the default AI provider configured in your workspace to organize curated feeds into topic digests saved directly as notes.

## Features

- Starts with a 41-source AI feed set spanning official labs, daily briefings, research analysis, practitioner writing, Chinese-language ML, and long-form interviews. Optional topics cover engineering and open source, Chinese-language reading, science and research, product and design, business and entrepreneurship, and security and privacy.
- The Explore and Manage RSS Subscriptions command lets users search and subscribe to five independently checked featured Chinese feeds (Ruan Yifeng, Codingnow, TW93 Weekly, Appinn, and Zhang Xinxu), or load and search a community directory of independent Chinese blogs on demand. Users can also add up to 30 custom public HTTPS RSS or Atom feeds with a topic and content language. The plugin validates each selected feed before subscribing, separates featured and personal subscriptions, and keeps existing digests when a subscription is removed.
- After generating a digest, the Save Recent RSS Article as Note command lets users search recently fetched articles and save any article as a separate EdgeEver note. It preserves source, author, date, and original URL and skips duplicate saves. The note contains what the feed provides; summary-only feeds yield summary-only notes.
- Fetches curated RSS and Atom feeds concurrently and caches recent articles, so one feed or AI failure does not prevent other categories from completing. Cross-source event clustering collapses normalized-link, normalized-title, and high-confidence near-title matches while retaining every corroborating source.
- Before generating digests, translates titles and summaries in batches to the configured target language. Unchanged translations are reused from cache, disabling automatic translation skips these AI calls, and an individual translation failure does not block the digest.
- Generates a separate digest for each selected topic, covering the previous 24 hours by default and titled `YYYY-MM-DD · Topic · RSS 日报`. The body opens with a clean metadata badge, followed directly by 7–10 numbered hotspots (`## 01 | ...`) separated by clean dividers; each hotspot features key-takeaway bullet points and dedicated, uncluttered source citations. When fewer candidates are available, the digest does not repeat or invent hotspots to reach the minimum. Candidate selection removes normalized URL/title duplicates, represents available source roles, and caps any single source before AI synthesis. Regenerating the same topic on the same day updates its existing note, while topics without new articles are skipped. Each non-empty topic uses one AI request.
- Offers an explicitly opt-in desktop schedule at any whole hour in the device timezone. It is off by default, explains the per-topic AI usage before activation, and can be paused at any time.
- Uses EdgeEver's official declarative plugin settings page for topics, automatic digest time, digest window, and per-category article limits. Each topic exposes a small source entry; EdgeEver shows the bundled source names and site domains as a list, and owns layout, validation, responsive behavior, and save feedback.
- Registers no standalone reader page. Manual and scheduled digests are written directly to a workspace notebook, reusing a valid previous target or falling back to the first notebook.
- Keeps provider configuration, models, and credentials entirely within EdgeEver.

## Subscriptions

Run Explore and Manage RSS Subscriptions to switch between Featured, Chinese Independent Blogs, and My Subscriptions. The community directory is fetched only when opened from the public OPML in [timqian/chinese-independent-blogs](https://github.com/timqian/chinese-independent-blogs); it is not bundled. Its directory uses the MIT license, and some old addresses may fail. Subscribing validates only the chosen feed. The base bundled feeds remain visible through each topic's source list in settings. A subscription enters digests only when its topic is enabled. The 30-feed personal limit can increase fetch time and AI usage. Scheduled digests remain off until explicitly enabled. Add only public feeds that need no account or token.

## Development

```sh
bun install
bun run check
bun run check:feeds # optional live health check for bundled feeds
```

The build produces the `main.js` and `styles.css` assets required by EdgeEver. Publish them together with the root `manifest.json` in a GitHub Release whose version matches the tag.

The plugin fetches first-party publisher content through EdgeEver's anonymous, read-only public network transport. Requests do not include cookies, account credentials, or sensitive headers. Public RSS and Atom feeds are used when a publisher offers them; a few publishers without a first-party feed are reached through free public RSSHub instances. A single feed failure does not block other sources.

## Acknowledgements

Product concepts such as RSS reading, subscription management, and article collection were inspired by [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss). Candidates for the expanded AI source set were informed by the MIT-licensed [QMReader source registry](https://github.com/joeseesun/qmreader/blob/main/lib/sources.js); included feeds were independently checked for relevance, direct HTTPS access, and parser compatibility rather than copying the upstream catalog wholesale.

## License

MIT
