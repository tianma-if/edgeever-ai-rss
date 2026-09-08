# EdgeEver AI RSS

[简体中文](README.zh-CN.md)

An official plugin for [EdgeEver](https://github.com/tianma-if/edgeever).

An AI-first RSS and Atom reader for EdgeEver. It uses the default AI provider configured in your EdgeEver workspace to translate, summarize, filter, and recommend articles, then save valuable reading as notes.

## Features

- Starts with an AI-focused feed set, with optional topics covering engineering and open source, Chinese-language reading, science and research, product and design, business and entrepreneurship, and security and privacy.
- Fetches curated RSS and Atom feeds concurrently and caches recent articles, so existing content remains readable when a feed or AI request fails.
- Provides user-triggered translation, structured summaries, and recommendations for the current article list.
- Generates a separate digest for each selected topic from the previous 24 hours, titled `YYYY-MM-DD · Topic · RSS 日报`. Regenerating the same topic on the same day updates its existing note, while topics without new articles are skipped. Each non-empty topic uses one AI request.
- Offers an explicitly opt-in desktop schedule at 08:00 local time. It is off by default, explains the per-topic AI usage before activation, and can be paused at any time.
- Saves source links, excerpts, and AI output to EdgeEver notes.
- Keeps provider configuration, models, and credentials entirely within EdgeEver.

## Development

```sh
bun install
bun run check
```

The build produces the `main.js` and `styles.css` assets required by EdgeEver. Publish them together with the root `manifest.json` in a GitHub Release whose version matches the tag.

The plugin fetches public feeds through EdgeEver's anonymous, read-only network transport. Requests do not include cookies, account credentials, or sensitive headers. The current interface provides verified curated sources; support for arbitrary public HTTPS RSS and Atom URLs may be added later.

## Acknowledgements

Product concepts such as RSS reading, subscription management, and article collection were inspired by [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss).

## License

MIT
