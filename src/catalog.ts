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
  digestRole?: "official" | "briefing" | "research" | "analysis" | "practitioner" | "interview";
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

// AI source candidates were informed by QMReader's MIT-licensed registry, then
// independently checked for direct HTTPS RSS/Atom access and parser compatibility.
// https://github.com/joeseesun/qmreader/blob/main/lib/sources.js
export const FEEDS: FeedSource[] = [
  { id: "openai-news", categoryId: "ai", name: "OpenAI News", url: "https://openai.com/news/rss.xml", siteUrl: "https://openai.com/news/", language: "en", digestRole: "official" },
  { id: "google-ai", categoryId: "ai", name: "Google AI", url: "https://blog.google/innovation-and-ai/technology/ai/rss/", siteUrl: "https://blog.google/innovation-and-ai/technology/ai/", language: "en", digestRole: "official" },
  { id: "google-deepmind", categoryId: "ai", name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", siteUrl: "https://deepmind.google/discover/blog/", language: "en", digestRole: "research" },
  { id: "apple-ml", categoryId: "ai", name: "Apple Machine Learning Research", url: "https://machinelearning.apple.com/rss.xml", siteUrl: "https://machinelearning.apple.com", language: "en", digestRole: "research" },
  { id: "mit-ai", categoryId: "ai", name: "MIT AI News", url: "https://news.mit.edu/rss/topic/artificial-intelligence2", siteUrl: "https://news.mit.edu/topic/artificial-intelligence2", language: "en", digestRole: "research" },
  { id: "hugging-face", categoryId: "ai", name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", siteUrl: "https://huggingface.co/blog", language: "en", digestRole: "official" },
  { id: "tldr-ai", categoryId: "ai", name: "TLDR AI", url: "https://tldr.tech/api/rss/ai", siteUrl: "https://tldr.tech/ai", language: "en", digestRole: "briefing" },
  { id: "bens-bites", categoryId: "ai", name: "Ben's Bites", url: "https://www.bensbites.com/feed", siteUrl: "https://www.bensbites.com", language: "en", digestRole: "briefing" },
  { id: "import-ai", categoryId: "ai", name: "Import AI", url: "https://importai.substack.com/feed", siteUrl: "https://importai.substack.com", language: "en", digestRole: "analysis" },
  { id: "nlp-newsletter", categoryId: "ai", name: "NLP Newsletter", url: "https://nlp.elvissaravia.com/feed", siteUrl: "https://nlp.elvissaravia.com", language: "en", digestRole: "analysis" },
  { id: "interconnects", categoryId: "ai", name: "Interconnects", url: "https://www.interconnects.ai/feed", siteUrl: "https://www.interconnects.ai", language: "en", digestRole: "analysis" },
  { id: "one-useful-thing", categoryId: "ai", name: "One Useful Thing", url: "https://www.oneusefulthing.org/feed", siteUrl: "https://www.oneusefulthing.org", language: "en", digestRole: "analysis" },
  { id: "science-space", categoryId: "ai", name: "科学空间", url: "https://kexue.fm/feed", siteUrl: "https://kexue.fm", language: "zh", digestRole: "research" },
  { id: "chinai", categoryId: "ai", name: "ChinAI Newsletter", url: "https://chinai.substack.com/feed", siteUrl: "https://chinai.substack.com", language: "en", digestRole: "analysis" },
  { id: "simon-willison", categoryId: "ai", name: "Simon Willison's Weblog", url: "https://simonwillison.net/atom/everything/", siteUrl: "https://simonwillison.net", language: "en", digestRole: "practitioner" },
  { id: "gary-marcus", categoryId: "ai", name: "Gary Marcus", url: "https://garymarcus.substack.com/feed", siteUrl: "https://garymarcus.substack.com", language: "en", digestRole: "practitioner" },
  { id: "dwarkesh", categoryId: "ai", name: "Dwarkesh Patel", url: "https://www.dwarkeshpatel.com/feed", siteUrl: "https://www.dwarkeshpatel.com", language: "en", digestRole: "interview" },
  { id: "latent-space", categoryId: "ai", name: "Latent Space", url: "https://www.latent.space/feed", siteUrl: "https://www.latent.space", language: "en", digestRole: "interview" },
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
