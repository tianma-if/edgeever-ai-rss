export interface FeedCategory {
  id: string;
  name: string;
  description: string;
  defaultEnabled?: boolean;
}

export interface FeedSource {
  id: string;
  categoryId: string;
  name: string;
  url: string;
  siteUrl: string;
  language: "zh" | "en";
}

export const CATEGORIES: FeedCategory[] = [
  { id: "ai", name: "AI 前沿", description: "模型、研究、工具与 AI 产品", defaultEnabled: true },
  { id: "engineering", name: "开发与开源", description: "工程实践、平台更新与开源生态" },
  { id: "chinese", name: "中文阅读", description: "中文科技、产品与独立写作" },
  { id: "science", name: "科学与研究", description: "自然科学、数学与航天" },
  { id: "design", name: "产品与设计", description: "产品方法、Web 与交互设计" },
  { id: "business", name: "商业与创业", description: "创业、公司与科技商业" },
  { id: "security", name: "安全与隐私", description: "漏洞、安全工程与隐私" },
];

export const FEEDS: FeedSource[] = [
  { id: "openai-news", categoryId: "ai", name: "OpenAI News", url: "https://openai.com/news/rss.xml", siteUrl: "https://openai.com/news/", language: "en" },
  { id: "google-ai", categoryId: "ai", name: "Google AI", url: "https://blog.google/innovation-and-ai/technology/ai/rss/", siteUrl: "https://blog.google/innovation-and-ai/technology/ai/", language: "en" },
  { id: "hugging-face", categoryId: "ai", name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", siteUrl: "https://huggingface.co/blog", language: "en" },
  { id: "github-changelog", categoryId: "engineering", name: "GitHub Changelog", url: "https://github.blog/changelog/feed/", siteUrl: "https://github.blog/changelog/", language: "en" },
  { id: "cloudflare-blog", categoryId: "engineering", name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/", siteUrl: "https://blog.cloudflare.com/", language: "en" },
  { id: "sspai", categoryId: "chinese", name: "少数派", url: "https://sspai.com/feed", siteUrl: "https://sspai.com/", language: "zh" },
  { id: "yitianshijie", categoryId: "chinese", name: "一天世界", url: "https://blog.yitianshijie.net/feed/atom/", siteUrl: "https://blog.yitianshijie.net/", language: "zh" },
  { id: "nasa", categoryId: "science", name: "NASA", url: "https://www.nasa.gov/feed/", siteUrl: "https://www.nasa.gov/", language: "en" },
  { id: "quanta", categoryId: "science", name: "Quanta Magazine", url: "https://www.quantamagazine.org/feed/", siteUrl: "https://www.quantamagazine.org/", language: "en" },
  { id: "smashing", categoryId: "design", name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/", siteUrl: "https://www.smashingmagazine.com/", language: "en" },
  { id: "a-list-apart", categoryId: "design", name: "A List Apart", url: "https://alistapart.com/main/feed/", siteUrl: "https://alistapart.com/", language: "en" },
  { id: "yc", categoryId: "business", name: "Y Combinator", url: "https://www.ycombinator.com/blog/rss", siteUrl: "https://www.ycombinator.com/blog", language: "en" },
  { id: "stripe", categoryId: "business", name: "Stripe Blog", url: "https://stripe.com/blog/feed.rss", siteUrl: "https://stripe.com/blog", language: "en" },
  { id: "krebs", categoryId: "security", name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", siteUrl: "https://krebsonsecurity.com/", language: "en" },
  { id: "project-zero", categoryId: "security", name: "Google Project Zero", url: "https://projectzero.google/feed.xml", siteUrl: "https://projectzero.google/", language: "en" },
];

export const DEFAULT_CATEGORY_IDS = CATEGORIES.filter((category) => category.defaultEnabled).map((category) => category.id);
