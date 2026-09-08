# Changelog

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
