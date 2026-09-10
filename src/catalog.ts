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
  /** Access path on an RSSHub instance when the publisher has no first-party feed. */
  rsshubRoute?: string;
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

// Sources are first-party publishers. RSS, Atom, and RSSHub routes are only access
// methods for the same publisher pages. AI candidates were informed by QMReader's
// MIT-licensed registry, then checked independently rather than copied wholesale.
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
  { id: "rundown-ai", categoryId: "ai", name: "The Rundown AI", url: "https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml", siteUrl: "https://www.therundown.ai", language: "en", digestRole: "briefing" },
  { id: "why-try-ai", categoryId: "ai", name: "Why Try AI", url: "https://www.whytryai.com/feed", siteUrl: "https://www.whytryai.com", language: "en", digestRole: "briefing" },
  { id: "geoffrey-litt", categoryId: "ai", name: "Geoffrey Litt", url: "https://www.geoffreylitt.com/feed.xml", siteUrl: "https://www.geoffreylitt.com", language: "en", digestRole: "practitioner" },
  { id: "tyler-folkman", categoryId: "ai", name: "Tyler Folkman", url: "https://tylerfolkman.substack.com/feed", siteUrl: "https://tylerfolkman.substack.com", language: "en", digestRole: "practitioner" },
  { id: "qiaomu-blog", categoryId: "ai", name: "乔木博客", url: "https://blog.qiaomu.ai/feed.xml", siteUrl: "https://blog.qiaomu.ai", language: "zh", digestRole: "practitioner" },
  { id: "lex-fridman", categoryId: "ai", name: "Lex Fridman Podcast", url: "https://lexfridman.com/feed/podcast/", siteUrl: "https://lexfridman.com/podcast", language: "en", digestRole: "interview" },
  { id: "lilian-weng", categoryId: "ai", name: "Lilian Weng", url: "https://lilianweng.github.io/index.xml", siteUrl: "https://lilianweng.github.io", language: "en", digestRole: "research" },
  { id: "google-research", categoryId: "ai", name: "Google Research", url: "https://research.google/blog/rss/", siteUrl: "https://research.google/blog/", language: "en", digestRole: "research" },
  { id: "nvidia-ai", categoryId: "ai", name: "NVIDIA AI", url: "https://blogs.nvidia.com/blog/category/generative-ai/feed/", siteUrl: "https://blogs.nvidia.com/blog/category/generative-ai/", language: "en", digestRole: "official" },
  { id: "meta-ml", categoryId: "ai", name: "Meta Engineering ML", url: "https://engineering.fb.com/category/ml-applications/feed/", siteUrl: "https://engineering.fb.com/category/ml-applications/", language: "en", digestRole: "official" },
  { id: "microsoft-research", categoryId: "ai", name: "Microsoft Research", url: "https://www.microsoft.com/en-us/research/blog/feed/", siteUrl: "https://www.microsoft.com/en-us/research/blog/", language: "en", digestRole: "research" },
  { id: "together-ai", categoryId: "ai", name: "Together AI", url: "https://www.together.ai/blog/rss.xml", siteUrl: "https://www.together.ai/blog", language: "en", digestRole: "official" },
  { id: "the-gradient", categoryId: "ai", name: "The Gradient", url: "https://thegradient.pub/rss/", siteUrl: "https://thegradient.pub/", language: "en", digestRole: "analysis" },
  { id: "sebastian-raschka", categoryId: "ai", name: "Sebastian Raschka", url: "https://magazine.sebastianraschka.com/feed", siteUrl: "https://magazine.sebastianraschka.com", language: "en", digestRole: "research" },
  { id: "semianalysis", categoryId: "ai", name: "SemiAnalysis", url: "https://newsletter.semianalysis.com/feed", siteUrl: "https://www.semianalysis.com", language: "en", digestRole: "analysis" },
  { id: "mit-tech-review-ai", categoryId: "ai", name: "MIT Technology Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/", siteUrl: "https://www.technologyreview.com/topic/artificial-intelligence/", language: "en", digestRole: "analysis" },
  { id: "ars-technica-ai", categoryId: "ai", name: "Ars Technica AI", url: "https://arstechnica.com/ai/feed/", siteUrl: "https://arstechnica.com/ai/", language: "en", digestRole: "briefing" },
  { id: "the-verge-ai", categoryId: "ai", name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", siteUrl: "https://www.theverge.com/ai-artificial-intelligence", language: "en", digestRole: "briefing" },
  { id: "alignment-forum", categoryId: "ai", name: "Alignment Forum", url: "https://www.alignmentforum.org/feed.xml", siteUrl: "https://www.alignmentforum.org/", language: "en", digestRole: "analysis" },
  { id: "eleutherai", categoryId: "ai", name: "EleutherAI", url: "https://blog.eleuther.ai/index.xml", siteUrl: "https://blog.eleuther.ai/", language: "en", digestRole: "research" },
  { id: "cursor-blog", categoryId: "ai", name: "Cursor", url: "https://cursor.com/atom.xml", siteUrl: "https://cursor.com", language: "en", digestRole: "practitioner" },
  { id: "arxiv-cs-ai", categoryId: "ai", name: "arXiv cs.AI", url: "https://rss.arxiv.org/rss/cs.AI", siteUrl: "https://arxiv.org/list/cs.AI/recent", language: "en", digestRole: "research" },
  { id: "huggingface-papers", categoryId: "ai", name: "Hugging Face Papers", url: "https://rsshub.ktachibana.party/huggingface/daily-papers", siteUrl: "https://huggingface.co/papers", language: "en", digestRole: "research", rsshubRoute: "/huggingface/daily-papers" },
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

export const feedSiteHost = (siteUrl: string): string =>
  new URL(siteUrl).hostname.replace(/^www\./, "");

export const RSSHUB_PUBLIC_ORIGINS = [
  "https://rsshub.ktachibana.party",
  "https://rsshub.rssforever.com",
  "https://rsshub.app",
] as const;

const isRsshubHost = (value: string): boolean => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "rsshub.app" || host.startsWith("rsshub.") || host.includes("rsshub");
  } catch {
    return false;
  }
};

export const resolveFeedUrls = (source: FeedSource): string[] => {
  const urls: string[] = [];
  const seen = new Set<string>();
  const add = (url: string) => {
    if (!url.startsWith("https://") || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };
  if (!isRsshubHost(source.url)) add(source.url);
  if (source.rsshubRoute?.startsWith("/")) {
    for (const origin of RSSHUB_PUBLIC_ORIGINS) add(`${origin}${source.rsshubRoute}`);
  }
  add(source.url);
  return urls;
};

export const topicSourceList = (categoryId: string) => {
  const category = CATEGORIES.find((candidate) => candidate.id === categoryId);
  if (!category) throw new Error(`Unknown feed category: ${categoryId}`);
  return {
    title: `${category.name}信源`,
    actionLabel: "查看信源",
    items: FEEDS.filter((feed) => feed.categoryId === category.id).map((feed) => ({
      title: feed.name,
      description: feedSiteHost(feed.siteUrl),
    })),
  };
};
