# Changelog

## 0.5.3 — 2026-09-09

- 日报热点改用“编号 + 事件概括”作为标题，不再显示“热点一”“热点二”等泛化标题，也不在标题下重复热点名称。
- Use a numbered story summary as each digest heading instead of generic labels such as “Hotspot One,” without repeating the story name below the heading.
- 移除日报配图及相关订阅图片提取逻辑，保留每个热点的简短要点、原文链接与佐证信源。
- Remove digest artwork and feed-image extraction while retaining concise bullet points, original-story links, and corroborating sources for each hotspot.

## 0.5.2 — 2026-09-09

- 将每篇日报重构为 7 至 10 个独立热点，每个热点包含具体名称、简短要点，以及直接指向原文和同事件佐证报道的信源链接；候选不足时不重复或虚构内容。
- Restructure each digest into 7–10 independent hotspots with a specific title, concise bullet points, and direct links to the original source and corroborating coverage; never repeat or invent stories when fewer candidates are available.
- 从 RSS/Atom 媒体字段或正文首图中提取公开 HTTPS 配图并展示在对应热点中，同时拒绝不安全协议与本地网络地址。
- Extract public HTTPS artwork from RSS/Atom media fields or the first article image and display it with the corresponding hotspot while rejecting unsafe protocols and local-network addresses.

## 0.5.1 — 2026-09-08

- 精简宿主设置页文案，移除重复说明文字，并将 Token 消耗和设备时区提示直接并入字段标题。
- Streamline the host-rendered settings copy by removing repetitive descriptions and moving Token-usage and device-timezone cues directly into field labels.
- 手动生成与桌面定时计划复用同一个日报命令，插件卡片只保留一个执行按钮。
- Reuse one digest command for manual runs and the desktop schedule so the plugin card exposes only one run button.

## 0.5.0 — 2026-09-08

- 移除“打开 EdgeEver AI RSS”命令、独立阅读面板及其专属样式；保留统一设置页中的翻译设置。日报直接写入已有目标笔记本，目标失效或尚未选择时使用工作区首个笔记本。
- Remove the “Open EdgeEver AI RSS” command, standalone reader panel, and panel-only styles while preserving translation controls in the unified settings page. Digests now write to the previous valid target notebook or fall back to the workspace's first notebook.
- 将自动翻译与目标语言设置接入手动和自动日报流程，缓存有效译文，并在翻译失败时继续生成日报。
- Apply automatic translation and target-language settings to manual and scheduled digest runs, caching valid translations while allowing digest generation to continue after translation failures.

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
