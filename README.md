# EdgeEver AI RSS

[简体中文](README.zh-CN.md)

An official plugin for [EdgeEver](https://github.com/tianma-if/edgeever).

An AI-first RSS and Atom digest plugin for EdgeEver. It uses the default AI provider configured in your workspace to organize curated feeds into topic digests saved directly as notes.

## Features

- Starts with an 18-source AI feed set spanning official labs, daily briefings, research analysis, practitioner writing, Chinese-language ML, and long-form interviews. Optional topics cover engineering and open source, Chinese-language reading, science and research, product and design, business and entrepreneurship, and security and privacy.
- Fetches curated RSS and Atom feeds concurrently and caches recent articles, so one feed or AI failure does not prevent other categories from completing. Cross-source event clustering collapses normalized-link, normalized-title, and high-confidence near-title matches while retaining every corroborating source.
- Before generating digests, translates titles and summaries in batches to the configured target language. Unchanged translations are reused from cache, disabling automatic translation skips these AI calls, and an individual translation failure does not block the digest.
- Generates a separate digest for each selected topic, covering the previous 24 hours by default and titled `YYYY-MM-DD · Topic · RSS 日报`. The body normally contains 7–10 independent sections whose numbered headings are concise summaries of the stories themselves; each hotspot has brief bullet points and direct source links. When fewer candidates are available, the digest does not repeat or invent hotspots to reach the minimum. Candidate selection removes normalized URL/title duplicates, represents available source roles, and caps any single source before AI synthesis. Regenerating the same topic on the same day updates its existing note, while topics without new articles are skipped. Each non-empty topic uses one AI request.
- Offers an explicitly opt-in desktop schedule at any whole hour in the device timezone. It is off by default, explains the per-topic AI usage before activation, and can be paused at any time.
- Uses EdgeEver's official declarative plugin settings page for topics, automatic digest time, digest window, and per-category article limits. Each topic exposes a small source entry; EdgeEver shows the bundled source names and site domains as a list, and owns layout, validation, responsive behavior, and save feedback.
- Registers no standalone reader page. Manual and scheduled digests are written directly to a workspace notebook, reusing a valid previous target or falling back to the first notebook.
- Keeps provider configuration, models, and credentials entirely within EdgeEver.

## Development

```sh
bun install
bun run check
bun run check:feeds # optional live health check for bundled feeds
```

The build produces the `main.js` and `styles.css` assets required by EdgeEver. Publish them together with the root `manifest.json` in a GitHub Release whose version matches the tag.

The plugin fetches public feeds through EdgeEver's anonymous, read-only network transport. Requests do not include cookies, account credentials, or sensitive headers. The bundled sources are verified; support for arbitrary public HTTPS RSS and Atom URLs may be added later.

## Acknowledgements

Product concepts such as RSS reading, subscription management, and article collection were inspired by [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss). Candidates for the expanded AI source set were informed by the MIT-licensed [QMReader source registry](https://github.com/joeseesun/qmreader/blob/main/lib/sources.js); included feeds were independently checked for relevance, direct HTTPS access, and parser compatibility rather than copying the upstream catalog wholesale.

## License

MIT
