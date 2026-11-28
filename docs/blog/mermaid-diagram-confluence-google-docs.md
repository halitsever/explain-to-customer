---
title: "Mermaid Diagrams in Confluence and Google Docs"
titleTemplate: false
description: "How to put a Mermaid diagram into Confluence or Google Docs: paste a rendered PNG or SVG, or use a marketplace app, and where Obsidian and GitHub fit in."
headline: "Getting a Mermaid diagram into Confluence or Google Docs"
date: "2026-11-28"
keyword: "confluence mermaid diagram"
faq: [{"q": "Does Confluence support Mermaid natively?", "a": "Not as of November 2026. Confluence Cloud users add Mermaid through Atlassian Marketplace apps, or paste a rendered image."}, {"q": "How do I add a Mermaid diagram to Google Docs?", "a": "Render it to PNG and insert the image, or install a Mermaid add-on from the Google Workspace Marketplace that renders diagram text into the document."}, {"q": "Does Obsidian support Mermaid?", "a": "Yes. A fenced code block with the language mermaid renders as a diagram in Obsidian's preview without a plugin."}]
---

::: v-pre

# Getting a Mermaid diagram into Confluence or Google Docs

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">GitHub and Obsidian render Mermaid from a code block. Confluence and Google Docs, where many clients read, do not ship a Mermaid renderer of their own as of November 2026. There are two ways around that: paste a rendered image, or install an app that renders the text. This post compares them.</p>

## Where Mermaid renders on its own

| Tool | Mermaid from a code block |
| --- | --- |
| GitHub (Markdown files, issues, pull requests) | Yes, see [GitHub's docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) |
| Obsidian | Yes |
| GitLab | Yes |
| Confluence Cloud | No built-in renderer; Marketplace apps add one |
| Google Docs | No built-in renderer; Workspace add-ons add one |

The last two rows were checked on 28 November 2026. Products change, so check the current state before you plan around it.

## Option 1: paste an image

Works in both tools today, with no admin rights and no app review:

1. Render the diagram to PNG (and SVG if you want it).
2. In Confluence, insert the image or drag it onto the page. In Google Docs, **Insert** → **Image** → **Upload from computer**.
3. Attach or link the `.mmd` source so the next person can change it.

The [Mermaid to PNG](/blog/mermaid-to-png) guide covers rendering. For a document that will be printed or zoomed, render at scale 2 or more.

**Pros:** works everywhere, looks the same for every reader, no third-party app with access to your pages.
**Cons:** the image is frozen. Editing means rendering again and replacing it, and the text in the diagram is not searchable.

## Option 2: a Marketplace app or add-on

**Confluence.** The Atlassian Marketplace lists several Mermaid apps for Confluence Cloud. They add a macro where you type Mermaid text and the page shows the diagram. Things to compare before installing one:

- whether it renders SVG or stores a small bitmap
- which Mermaid version and diagram types it supports
- whether diagram text is indexed by Confluence search (at least one app says it is not)
- where rendering happens and what data leaves Atlassian's cloud
- price per user, since Confluence apps are usually billed on the whole site's user count

**Google Docs.** The Google Workspace Marketplace has Mermaid add-ons that render a diagram into the document from text, some converting existing code blocks. They ask for permission to view and manage your documents, which is worth reading before you click **Allow**.

**Pros:** the diagram stays editable as text.
**Cons:** every editor needs the app, an admin may have to approve it, and the diagram depends on a vendor.

## Which one for client documents

For documents written for a client, the image route is usually the better fit:

- The client does not need the app to see the diagram, and nothing breaks if they copy the page into their own space.
- You decide exactly how the diagram looks: style, fonts, colours.
- Their admin does not have to review a third-party app.

Keep the source next to the image. The [explain-to-customer](/) skill does this by default: each diagram comes out as an SVG with its fonts embedded, a PNG on the style's background, and the `.mmd` source in `_source/diagrams/`. The SVG goes into tools that accept it, the PNG into those that do not.

## Obsidian

For notes you keep yourself, Obsidian renders a fenced mermaid code block in reading view with no plugin. It is a good place to draft a diagram before rendering it for a client document. Obsidian runs its own bundled Mermaid version, so a very new syntax feature may not render there yet.

## A note on content

Whatever the tool, a diagram for a client follows different rules from one for your team: plain labels in their language, no table or function names, 4 to 9 boxes. The [sequence diagram guide](/blog/mermaid-sequence-diagram#rules-that-keep-it-readable) lists them, and [How to explain code changes to non-technical clients](/blog/explain-code-changes-to-clients) covers the wording.

## FAQ

### Does Confluence support Mermaid natively?

Not as of November 2026. Confluence Cloud users add Mermaid through Atlassian Marketplace apps, or paste a rendered image.

### How do I add a Mermaid diagram to Google Docs?

Render it to PNG and insert the image, or install a Mermaid add-on from the Google Workspace Marketplace that renders diagram text into the document.

### Does Obsidian support Mermaid?

Yes. A fenced code block with the language mermaid renders as a diagram in Obsidian's preview without a plugin.

## Related posts

- [Writing a Mermaid sequence diagram, from arrows to loops](/blog/mermaid-sequence-diagram)
- [A release notes template your clients will actually read](/blog/release-notes-template)
- [Turning a Mermaid diagram into a PNG or SVG file](/blog/mermaid-to-png)
- [All posts](/blog/)

:::
