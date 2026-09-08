# Changelog

## 0.4.0 — 2026-09-08

- 将“AI 前沿”扩充至 18 个经在线验证的直连来源，新增 Google DeepMind、Apple Machine Learning Research、MIT AI News 等一手研究来源。
- 阅读列表与日报候选通过规范化链接、规范化标题及限时高置信度相似标题进行跨来源事件聚类，保留其他佐证来源；日报同时覆盖可用来源角色并限制单一来源占比。
- 增加可重复执行的在线订阅源健康检查，以及目录覆盖度、唯一性、HTTPS、去重与来源均衡测试。
- 增加默认开启的标题与摘要批量自动翻译，可配置简体中文、繁体中文、英语、日语或韩语；缓存按原文签名和目标语言复用，正文翻译仍保持手动触发。
- Expand AI coverage to 18 live-verified direct feeds, including first-party research from Google DeepMind, Apple Machine Learning Research, and MIT AI News.
- Cluster cross-source events in the reader and digest by normalized URL, normalized title, and time-bounded high-confidence near-title matches while retaining corroborating sources; also represent available source roles and cap individual sources.
- Add a repeatable live feed health check plus catalog coverage, uniqueness, HTTPS, deduplication, and source-balance tests.
- Add default-on batched translation for article titles and feed summaries with configurable Simplified Chinese, Traditional Chinese, English, Japanese, or Korean targets; cache by source signature and target while keeping full-body translation manual.

## 0.3.0 — 2026-09-08

- Adopt EdgeEver plugin API v2, including the mandatory host-rendered settings policy and explicit dashboard panel purpose.
- 使用 EdgeEver 官方声明式插件设置页统一管理主题、刷新与日报参数，并迁移已有主题选择。
- 支持按设备时区自定义日报生成整点，保存设置后立即更新桌面计划。
- Move topics, refresh behavior, and digest parameters into EdgeEver's official declarative plugin settings page, including legacy topic migration.
- Support a customizable whole-hour digest time in the device timezone with immediate desktop schedule updates.

## 0.2.0 — 2026-09-08

- 添加按分类生成最近 24 小时日报，并支持同日同分类幂等更新。
- 添加默认关闭、由用户明确开启的桌面端每日 08:00 自动日报。
- Add per-category daily digests for the previous 24 hours with idempotent same-day updates.
- Add an opt-in desktop schedule for automatic daily generation at 08:00 local time.

## 0.1.0 — 2026-09-08

- 建立独立的 EdgeEver AI RSS 插件项目。
- 添加分主题精选订阅、RSS/Atom 解析、AI 翻译与总结、AI 推荐及笔记保存。
- Create the standalone EdgeEver AI RSS plugin project.
- Add curated topic feeds, RSS/Atom parsing, AI translation and summaries, recommendations, and note capture.
