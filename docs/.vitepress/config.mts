import { defineConfig } from "vitepress";

const base = "/explain-to-customer/";
const site = "https://projects.halit.org/explain-to-customer/";
const description = "A Claude Code skill that turns a code change into a short explainer video, slides, Mermaid diagrams and a message your client understands, rendered locally.";

const posts = [
  ["mermaid-sequence-diagram", "Mermaid sequence diagram"],
  ["release-notes-template", "Release notes template"],
  ["mermaid-to-png", "Mermaid to PNG"],
  ["mermaid-diagram-confluence-google-docs", "Mermaid in Confluence and Docs"],
  ["mermaid-er-diagram", "Mermaid ER diagram"],
  ["claude-code-plugins-vs-skills", "Plugins vs skills"],
  ["product-update-video-from-pull-request", "Update video from a PR"],
  ["explain-code-changes-to-clients", "Explain changes to clients"],
];

/** BlogPosting, breadcrumbs and, when the post shows an FAQ, FAQPage data for a blog post. */
function postJsonLd(fm: Record<string, any>, url: string) {
  const person = { "@type": "Person", name: "Halit Sever", url: "https://halit.org" };
  const graph: object[] = [
    {
      "@type": "BlogPosting",
      headline: fm.headline ?? fm.title,
      description: fm.description,
      url,
      mainEntityOfPage: url,
      datePublished: fm.date,
      dateModified: fm.date,
      inLanguage: "en",
      image: `${site}brand/social-preview-1280x640.png`,
      keywords: fm.keyword,
      author: person,
      publisher: person,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "explain-to-customer", item: site },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site}blog/` },
        { "@type": "ListItem", position: 3, name: fm.headline ?? fm.title, item: url },
      ],
    },
  ];
  if (fm.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: fm.faq.map((f: { q: string; a: string }) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export default defineConfig({
  /** keeps the page hash map out of every page's HTML, which Semrush reads as a low text-to-HTML ratio */
  metaChunk: true,
  base,
  lang: "en-US",
  title: "explain-to-customer",
  titleTemplate: ":title | explain-to-customer",
  description,
  cleanUrls: true,
  appearance: "dark",
  sitemap: { hostname: site },
  markdown: { theme: { light: "vitesse-light", dark: "vitesse-dark" } },
  head: [
    /** Cloudflare Web Analytics, one token for every page on projects.halit.org. */
    ["script", { defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": '{"token": "dd7e54d3f48841c187d72d9dbb92a6b6"}' }],
    ["link", { rel: "icon", type: "image/svg+xml", href: `${base}brand/logo-mark-dark.svg` }],
    ["link", { rel: "apple-touch-icon", href: `${base}brand/avatar-512.png` }],
    ["meta", { name: "theme-color", content: "#1F1D1A" }],
    ["meta", { property: "og:site_name", content: "explain-to-customer" }],
    ["meta", { property: "og:image", content: `${site}brand/social-preview-1280x640.png` }],
    ["meta", { property: "og:image:width", content: "1280" }],
    ["meta", { property: "og:image:height", content: "640" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${site}brand/social-preview-1280x640.png` }],
  ],
  /** Per-page canonical and Open Graph tags, so shared guide links preview their own page. */
  transformPageData(pageData) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, "");
    const url = site + path;
    const fm = pageData.frontmatter;
    const title = path === "" ? "explain-to-customer" : fm.titleTemplate === false ? fm.title : `${fm.title ?? pageData.title} | explain-to-customer`;
    const desc = pageData.frontmatter.description || pageData.description || description;
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:type", content: fm.date ? "article" : "website" }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: desc }],
    );
    if (fm.date) pageData.frontmatter.head.push(["script", { type: "application/ld+json" }, JSON.stringify(postJsonLd(fm, url))]);
    if (path === "") {
      const code = {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "explain-to-customer",
        description,
        url: site,
        codeRepository: "https://github.com/halitsever/explain-to-customer",
        programmingLanguage: "JavaScript",
        runtimePlatform: "Node.js",
        license: "https://opensource.org/licenses/MIT",
        author: { "@type": "Person", name: "Halit Sever", url: "https://github.com/halitsever" },
      };
      pageData.frontmatter.head.push(["script", { type: "application/ld+json" }, JSON.stringify(code)]);
    }
  },
  themeConfig: {
    logo: { light: "/brand/logo-mark.svg", dark: "/brand/logo-mark-dark.svg", alt: "" },
    siteTitle: "explain-to-customer",
    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Styles", link: "/guide/styles" },
      { text: "AI explainer video", link: "/ai-explainer-video/" },
      { text: "Blog", link: "/blog/", activeMatch: "/blog/" },
    ],
    sidebar: {
      "/blog/": [
        {
          text: "Blog",
          items: [{ text: "All posts", link: "/blog/" }, ...posts.map(([slug, text]) => ({ text, link: `/blog/${slug}` }))],
        },
      ],
      "/guide/": [
        {
          text: "Start here",
          items: [
            { text: "Getting started", link: "/guide/getting-started" },
            { text: "Install a Claude Code skill", link: "/guide/install-claude-code-skill" },
            { text: "Usage", link: "/guide/usage" },
          ],
        },
        {
          text: "What you get",
          items: [
            { text: "Outputs", link: "/guide/outputs" },
            { text: "Styles", link: "/guide/styles" },
          ],
        },
        {
          text: "Under the hood",
          items: [
            { text: "How it works", link: "/guide/how-it-works" },
            { text: "Privacy and honesty", link: "/guide/privacy" },
            { text: "Troubleshooting", link: "/guide/troubleshooting" },
          ],
        },
        {
          text: "More",
          items: [
            { text: "AI explainer video", link: "/ai-explainer-video/" },
            { text: "Blog", link: "/blog/" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/halitsever/explain-to-customer" }],
    search: { provider: "local" },
    editLink: {
      pattern: "https://github.com/halitsever/explain-to-customer/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    outline: { level: [2, 3] },
    docFooter: { prev: "Previous", next: "Next" },
  },
});
