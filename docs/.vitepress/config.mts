import { defineConfig } from "vitepress";

const base = "/explain-to-customer/";
const site = "https://projects.halit.org/explain-to-customer/";
const description = "A Claude Code skill that turns a code change into a short explainer video, slides and diagrams your client understands.";

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
    ["meta", { property: "og:type", content: "website" }],
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
    const title = path === "" ? "explain-to-customer" : `${pageData.frontmatter.title ?? pageData.title} | explain-to-customer`;
    const desc = pageData.frontmatter.description || pageData.description || description;
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: desc }],
    );
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
    ],
    sidebar: {
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
