import { CATEGORIES, FEEDS, type FeedSource } from "./catalog";
import { fetchCommunityDirectory, type DirectorySource } from "./discovery";
import type { PluginContext } from "./edgeever";
import { fetchFeed } from "./feed";
import { createPersonalSource, loadSubscriptions, MAX_PERSONAL_SOURCES, saveSubscriptions, type PersonalSource, type Subscriptions } from "./subscriptions";

const PANEL_ID = "explore-subscriptions";
type Tab = "featured" | "community" | "personal";

const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, label?: string): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
};

const button = (label: string, click: () => void, disabled = false): HTMLButtonElement => {
  const node = element("button", "edgeever-rss-button", label);
  node.type = "button";
  node.disabled = disabled;
  node.addEventListener("click", click);
  return node;
};

export const registerSubscriptionPanel = (context: PluginContext): (() => void) => {
  const disposePanel = context.ui.panels.register({
    id: PANEL_ID,
    title: "探索 RSS 订阅",
    purpose: "workflow",
    presentation: "fullscreen",
    async mount(container, panel) {
      let alive = true;
      let tab: Tab = "featured";
      let query = "";
      let shown = 50;
      let busy = false;
      let message = "";
      let subscriptions: Subscriptions = await loadSubscriptions(context);
      let directory: DirectorySource[] | null = null;
      let directoryLoading = false;
      let customUrl = "";
      let customName = "";
      let customCategory = "chinese";
      let customLanguage: "zh" | "en" = "zh";

      const syncChrome = () => panel.shell.set({
        header: { title: "探索 RSS 订阅", description: "精选源、中文独立博客与我的订阅" },
        toolbar: [
          { type: "tabs", key: "tab", value: tab, options: [
            { value: "featured", label: "精选" },
            { value: "community", label: "中文独立博客" },
            { value: "personal", label: "我的订阅" },
          ] },
          { type: "search", key: "query", value: query, placeholder: "搜索名称或地址" },
        ],
        onChange: (key, value) => {
          if (key === "tab" && (value === "featured" || value === "community" || value === "personal")) {
            tab = value;
            query = "";
            shown = 50;
            message = "";
            if (tab === "community") void loadDirectory();
          } else if (key === "query") {
            query = value;
            shown = 50;
          }
          render();
        },
      });

      const save = async (next: Subscriptions) => {
        busy = true;
        render();
        try {
          await saveSubscriptions(context, next);
          subscriptions = next;
          message = "订阅已保存。下次生成日报时生效。";
        } catch (error) {
          message = error instanceof Error ? error.message : "订阅保存失败。";
        } finally {
          busy = false;
          render();
        }
      };

      const loadDirectory = async () => {
        if (directory || directoryLoading) return;
        directoryLoading = true;
        render();
        try {
          directory = await fetchCommunityDirectory(context);
          message = `已加载 ${directory.length} 个公开 HTTPS 博客源。`;
        } catch (error) {
          message = error instanceof Error ? error.message : "目录读取失败。";
        } finally {
          directoryLoading = false;
          render();
        }
      };

      const subscribePersonal = async (source: PersonalSource) => {
        if (busy) return;
        if (subscriptions.personal.length >= MAX_PERSONAL_SOURCES) {
          message = `最多订阅 ${MAX_PERSONAL_SOURCES} 个个人源。`;
          render();
          return;
        }
        if (subscriptions.personal.some((item) => item.url === source.url) || FEEDS.some((item) => item.url === source.url)) {
          message = "这个地址已订阅或已内置。";
          render();
          return;
        }
        busy = true;
        message = `正在验证 ${source.name}…`;
        render();
        try {
          await fetchFeed(context, { ...source, siteUrl: new URL(source.url).origin });
          await saveSubscriptions(context, { ...subscriptions, personal: [...subscriptions.personal, source] });
          subscriptions = await loadSubscriptions(context);
          customUrl = "";
          customName = "";
          message = `已订阅 ${source.name}。请在插件设置中启用对应主题，之后生成日报时生效。`;
        } catch (error) {
          message = error instanceof Error ? error.message : "订阅源验证失败。";
        } finally {
          busy = false;
          render();
        }
      };

      const matches = (name: string, url: string) => `${name} ${url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim());

      const sourceRow = (name: string, url: string, subtitle: string, actionLabel: string, action: () => void, disabled = false) => {
        const row = element("div", "edgeever-rss-row");
        const details = element("div", "edgeever-rss-row-details");
        details.append(element("div", "edgeever-rss-row-title", name), element("div", "edgeever-rss-row-subtitle", subtitle));
        row.append(details, button(actionLabel, action, disabled || busy));
        return row;
      };

      const renderFeatured = (root: HTMLElement) => {
        const feeds = FEEDS.filter((feed) => feed.optional && matches(feed.name, feed.url));
        root.append(element("p", "edgeever-rss-muted", "这些精选源经独立验证，默认关闭。选中后仍需启用对应主题。"));
        if (!feeds.length) root.append(element("p", "edgeever-rss-muted", "没有匹配的精选源。"));
        for (const feed of feeds) {
          const selected = subscriptions.featuredIds.includes(feed.id);
          const category = CATEGORIES.find((item) => item.id === feed.categoryId)?.name ?? feed.categoryId;
          root.append(sourceRow(feed.name, feed.url, `${category} · ${new URL(feed.siteUrl).hostname}`, selected ? "取消订阅" : "订阅", () => {
            void save({ ...subscriptions, featuredIds: selected
              ? subscriptions.featuredIds.filter((id) => id !== feed.id)
              : [...subscriptions.featuredIds, feed.id] });
          }));
        }
      };

      const renderCommunity = (root: HTMLElement) => {
        root.append(element("p", "edgeever-rss-muted", "目录按需从 timqian/chinese-independent-blogs 获取（MIT）；订阅时只验证所选源。目录中的旧地址可能失效。"));
        if (!directory) {
          root.append(element("p", "edgeever-rss-muted", directoryLoading ? "正在读取目录…" : "目录未载入。"));
          if (!directoryLoading) root.append(button("重新读取目录", () => void loadDirectory()));
          return;
        }
        const feeds = directory.filter((source) => matches(source.name, source.url));
        root.append(element("p", "edgeever-rss-muted", `匹配 ${feeds.length} 个，当前显示 ${Math.min(shown, feeds.length)} 个。`));
        for (const source of feeds.slice(0, shown)) {
          const selected = subscriptions.personal.some((item) => item.url === source.url) || FEEDS.some((item) => item.url === source.url);
          root.append(sourceRow(source.name, source.url, source.siteUrl ?? new URL(source.url).hostname, selected ? "已订阅" : "订阅到中文阅读", () => {
            const personal = createPersonalSource(source.url, source.name, "chinese", "zh");
            if (personal) void subscribePersonal(personal);
          }, selected));
        }
        if (shown < feeds.length) root.append(button("显示更多", () => { shown += 50; render(); }));
      };

      const renderPersonal = (root: HTMLElement) => {
        const form = element("form", "edgeever-rss-form");
        const url = element("input", "edgeever-rss-input");
        url.type = "url";
        url.placeholder = "https://example.com/feed.xml";
        url.value = customUrl;
        url.setAttribute("aria-label", "RSS 或 Atom 地址");
        url.addEventListener("input", () => { customUrl = url.value; });
        const name = element("input", "edgeever-rss-input");
        name.type = "text";
        name.placeholder = "名称（可选）";
        name.value = customName;
        name.setAttribute("aria-label", "订阅名称");
        name.addEventListener("input", () => { customName = name.value; });
        const category = element("select", "edgeever-rss-input");
        category.setAttribute("aria-label", "日报主题");
        for (const item of CATEGORIES) {
          const option = element("option");
          option.value = item.id;
          option.textContent = item.name;
          category.append(option);
        }
        category.value = customCategory;
        category.addEventListener("change", () => { customCategory = category.value; });
        const language = element("select", "edgeever-rss-input");
        language.setAttribute("aria-label", "内容语言");
        for (const [value, label] of [["zh", "中文"], ["en", "英语"]] as const) {
          const option = element("option");
          option.value = value;
          option.textContent = label;
          language.append(option);
        }
        language.value = customLanguage;
        language.addEventListener("change", () => { customLanguage = language.value === "en" ? "en" : "zh"; });
        const submit = button("添加订阅", () => undefined, busy);
        submit.type = "submit";
        form.append(url, name, category, language, submit);
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const source = createPersonalSource(customUrl, customName, customCategory, customLanguage);
          if (!source) {
            message = "请输入公开 HTTPS RSS / Atom 地址，并选择有效主题。";
            render();
            return;
          }
          void subscribePersonal(source);
        });
        root.append(form, element("p", "edgeever-rss-muted", `已添加 ${subscriptions.personal.length}/${MAX_PERSONAL_SOURCES} 个个人源。只读取公开源，不支持账号、令牌或本地网络。`));
        const sources = subscriptions.personal.filter((source) => matches(source.name, source.url));
        if (!sources.length) root.append(element("p", "edgeever-rss-muted", "没有匹配的个人订阅。"));
        for (const source of sources) {
          const topic = CATEGORIES.find((item) => item.id === source.categoryId)?.name ?? source.categoryId;
          root.append(sourceRow(source.name, source.url, `${topic} · ${source.url}`, "取消订阅", () => {
            void save({ ...subscriptions, personal: subscriptions.personal.filter((item) => item.id !== source.id) });
          }));
        }
      };

      const render = () => {
        if (!alive) return;
        syncChrome();
        const root = element("div", "edgeever-rss-panel");
        if (message) root.append(element("p", "edgeever-rss-message", message));
        if (tab === "featured") renderFeatured(root);
        else if (tab === "community") renderCommunity(root);
        else renderPersonal(root);
        container.replaceChildren(root);
      };
      render();
      return () => { alive = false; };
    },
  });
  const disposeCommand = context.commands.register({
    id: PANEL_ID,
    title: "探索和管理 RSS 订阅",
    run: () => context.ui.panels.open(PANEL_ID),
  });
  return () => { disposeCommand(); disposePanel(); };
};
