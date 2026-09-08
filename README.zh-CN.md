# EdgeEver AI RSS

[English](README.md)

这是 [EdgeEver](https://github.com/tianma-if/edgeever) 官方插件。

以 AI 为核心的 EdgeEver RSS / Atom 阅读插件。它使用 EdgeEver 工作区已经配置的默认 AI Provider，为订阅内容提供翻译、总结、相关性筛选和推荐，并将有价值的内容沉淀为笔记。

## 功能

- 首次默认启用“AI 前沿”，并提供开发与开源、中文阅读、科学与研究、产品与设计、商业与创业、安全与隐私等可选主题。
- 并发读取精选 RSS / Atom 并缓存最近文章；网络或 AI 请求失败时仍可阅读已有内容。
- 支持由用户主动触发的单篇翻译、结构化总结和当前文章列表推荐。
- 按所选主题分别生成最近 24 小时的 RSS 日报，标题采用 `YYYY-MM-DD · 分类 · RSS 日报`；同日同分类再次生成时更新原笔记，没有新内容的分类会跳过。每个有内容的主题调用一次 AI。
- 可由用户明确开启桌面端每日 08:00 自动日报；默认关闭，界面会在启用前说明 AI 调用方式，也可随时暂停。
- 将原文链接、摘要和 AI 结果保存为 EdgeEver 笔记。
- Provider、模型和凭据完全由 EdgeEver 管理。

## 开发

```sh
bun install
bun run check
```

构建会生成 EdgeEver 所需的 `main.js` 与 `styles.css`。发布 GitHub Release 时，应将它们与仓库根目录的 `manifest.json` 一同上传，并确保版本与标签一致。

插件通过 EdgeEver 的匿名只读网络传输获取公开订阅，不携带 Cookie、账号凭据或敏感请求头。当前界面提供经过验证的精选来源；后续可增加对任意公开 HTTPS RSS / Atom 地址的支持。

## 致谢

本项目的 RSS 阅读、订阅管理与文章收藏等产品思路受到 [Qiaomu AI RSS](https://github.com/joeseesun/qiaomu-ai-rss) 启发。

## 许可

MIT
