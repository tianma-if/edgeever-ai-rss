import type { Article } from "./feed";
import type { PluginContext } from "./edgeever";

const PANEL_ID = "save-rss-article";
const STATE_KEY = "reader-state-v1";

const hash = (value: string): string => {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};

const escapeText = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/[\\`*_{}\[\]()#+.!|-]/g, "\\$&");

export const articleSaveTag = (article: Article): string => `AI-RSS-Article-${hash(article.id)}`;

export const buildSavedArticleMarkdown = (article: Article): string => {
  const title = escapeText(article.title);
  const source = escapeText(article.sourceName);
  const author = article.author ? `\n- 作者：${escapeText(article.author)}` : "";
  const published = article.publishedAt ? `\n- 发布时间：${escapeText(article.publishedAt)}` : "";
  const url = /^https?:\/\//i.test(article.url) ? article.url.replace(/[<>\s]/g, (char) => encodeURIComponent(char)) : "";
  const body = escapeText(article.content || article.summary || "订阅源没有提供正文。请打开原文阅读。");
  return `# ${title}\n\n- 来源：${source}${author}${published}${url ? `\n- 原文：<${url}>` : ""}\n\n${body}\n`;
};

export const registerArticleSavePanel = (context: PluginContext): (() => void) => {
  const disposePanel = context.ui.panels.register({
    id: PANEL_ID,
    title: "保存 RSS 文章",
    purpose: "workflow",
    presentation: "fullscreen",
    async mount(container, panel) {
      let alive = true;
      let query = "";
      let message = "";
      let busy = false;
      const state = await context.storage.get<{ articles?: Article[]; selectedNotebookId?: string | null }>(STATE_KEY);
      const articles = Array.isArray(state?.articles) ? state.articles : [];
      const notebooks = await context.notebooks.list();
      const notebook = notebooks.find((item) => item.id === state?.selectedNotebookId) ?? notebooks[0];
      const render = () => {
        if (!alive) return;
        panel.shell.set({
          header: { title: "保存 RSS 文章", description: "从最近抓取的文章中选择，保存为独立 EdgeEver 笔记" },
          toolbar: [{ type: "search", key: "query", value: query, placeholder: "搜索文章或来源" }],
          onChange: (key, value) => { if (key === "query") { query = value; render(); } },
        });
        const root = document.createElement("div");
        root.className = "edgeever-rss-panel";
        if (message) {
          const notice = document.createElement("p");
          notice.className = "edgeever-rss-message";
          notice.textContent = message;
          root.append(notice);
        }
        const matching = articles.filter((article) => `${article.title} ${article.sourceName}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
        const hint = document.createElement("p");
        hint.className = "edgeever-rss-muted";
        hint.textContent = !notebook ? "请先创建一个笔记本。" : !articles.length ? "先生成一次日报，便可在这里保存最近抓取的文章。" : `显示 ${Math.min(100, matching.length)} / ${matching.length} 篇；正文以订阅源提供的内容为准。`;
        root.append(hint);
        for (const article of matching.slice(0, 100)) {
          const row = document.createElement("div");
          row.className = "edgeever-rss-row";
          const details = document.createElement("div");
          details.className = "edgeever-rss-row-details";
          const title = document.createElement("div");
          title.className = "edgeever-rss-row-title";
          title.textContent = article.title;
          const subtitle = document.createElement("div");
          subtitle.className = "edgeever-rss-row-subtitle";
          subtitle.textContent = `${article.sourceName} · ${article.publishedAt?.slice(0, 10) ?? "日期未知"}`;
          details.append(title, subtitle);
          const save = document.createElement("button");
          save.className = "edgeever-rss-button";
          save.type = "button";
          save.textContent = "保存为笔记";
          save.disabled = busy || !notebook;
          save.addEventListener("click", () => {
            if (!notebook || busy) return;
            busy = true;
            message = `正在保存 ${article.title}…`;
            render();
            void (async () => {
              try {
                const tag = articleSaveTag(article);
                const existing = await context.notes.query({ tags: [tag], limit: 1 });
                if (existing.notes.length) message = "这篇文章已经保存过。";
                else {
                  await context.notes.create({
                    notebookId: notebook.id,
                    title: article.title.slice(0, 200),
                    contentMarkdown: buildSavedArticleMarkdown(article),
                    tags: ["AI-RSS-Article", tag],
                  });
                  message = `已保存 ${article.title}。`;
                }
              } catch (error) {
                message = error instanceof Error ? error.message : "文章保存失败。";
              } finally {
                busy = false;
                render();
              }
            })();
          });
          row.append(details, save);
          root.append(row);
        }
        container.replaceChildren(root);
      };
      render();
      return () => { alive = false; };
    },
  });
  const disposeCommand = context.commands.register({ id: PANEL_ID, title: "保存最近 RSS 文章为笔记", run: () => context.ui.panels.open(PANEL_ID) });
  return () => { disposeCommand(); disposePanel(); };
};
