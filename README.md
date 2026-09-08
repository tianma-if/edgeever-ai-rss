# EdgeEver AI RSS

以 AI 为核心的 EdgeEver RSS / Atom 阅读插件。使用 EdgeEver 工作区已经配置的默认 AI Provider，为精选订阅提供翻译、总结、相关性筛选和推荐，并把有价值的内容沉淀为笔记。

AI-first RSS and Atom reading for EdgeEver. The plugin reuses the workspace's configured AI provider to translate, summarize, filter, recommend, and capture useful reading as notes.

## 当前能力 / Features

- 首次默认启用“AI 前沿”，并提供开发与开源、中文阅读、科学与研究、产品与设计、商业与创业、安全与隐私等可选主题。
- 并发读取精选 RSS / Atom，缓存最近文章；网络或 AI 失败时仍可阅读已有原文。
- 用户主动触发单篇翻译、结构化总结，或对当前文章列表进行 AI 推荐。
- 将原文链接、摘要、AI 结果保存为 EdgeEver 笔记。
- Provider、模型和密钥完全由 EdgeEver 管理；插件不保存或复制凭据。

- Defaults to an AI-focused feed set, with optional engineering, Chinese reading, science, design, business, and security topics.
- Fetches curated RSS/Atom feeds concurrently and keeps a local article cache.
- Provides user-triggered translation, structured summaries, and list recommendations.
- Saves source links, excerpts, and AI output to EdgeEver notes.
- Provider configuration and credentials remain inside EdgeEver.

## 开发 / Development

```sh
bun install
bun run check
```

构建生成 EdgeEver GitHub 插件需要的 `main.js` 与 `styles.css`。仓库根目录的 `manifest.json`、`main.js`、`styles.css` 应作为同一版本的 GitHub Release 资产发布。

The build produces the `main.js` and `styles.css` assets required by EdgeEver. Publish those files together with the root `manifest.json` in a matching GitHub Release.

目前 EdgeEver 插件权限使用静态域名白名单，因此首版只读取清单中的精选来源。任意自定义 RSS 域名需要 EdgeEver 提供运行时域名授权后再开放。

EdgeEver currently uses a static network-host allowlist for plugins, so this first version reads curated sources only. Arbitrary feed URLs will require runtime host authorization in EdgeEver.

## Acknowledgements / 致谢

本项目的 RSS 阅读、订阅管理与文章收藏等产品思路受到 [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss) 启发。

EdgeEver AI RSS 是面向 EdgeEver Plugin API 独立设计和实现的插件，与原项目及其作者不存在隶属、授权或官方合作关系。

The product concepts of this project were inspired by [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss).

EdgeEver AI RSS is independently designed and implemented for the EdgeEver Plugin API. It is not affiliated with or endorsed by the original project or its author.

## License

MIT
