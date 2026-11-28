---
title: "Mermaid to PNG: 3 Ways to Export a Diagram"
titleTemplate: false
description: "Convert a Mermaid diagram to PNG or SVG three ways: the Mermaid live editor, mermaid-cli (mmdc) with scale and background flags, and an automated skill run."
headline: "Turning a Mermaid diagram into a PNG or SVG file"
date: "2026-11-28"
keyword: "mermaid to png"
faq: [{"q": "How do I convert a Mermaid file to PNG?", "a": "With mermaid-cli: npx -p @mermaid-js/mermaid-cli mmdc -i diagram.mmd -o diagram.png. Add -s 2 for a sharper image and -b white or -b transparent for the background."}, {"q": "How do I save a Mermaid diagram as an image online?", "a": "Open the Mermaid live editor, paste the diagram and use its PNG or SVG download. The rendering happens in your browser."}, {"q": "Should I use PNG or SVG?", "a": "SVG for anything that scales, such as web pages and documents that accept it. PNG for email, chat apps and tools that only take bitmaps. Render PNG at scale 2 or more so it stays sharp."}]
---

::: v-pre

# Turning a Mermaid diagram into a PNG or SVG file

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Mermaid diagrams are text, which is great in a repository and useless in an email. To send one to a client or paste it into a slide, you need an image. Here are three ways to get one, from a browser tab to a fully automated run, with the mermaid-cli flags that matter for sharp output.</p>

## 1. The Mermaid live editor

The quickest route for a one-off. Open [mermaid.live](https://mermaid.live/), paste the diagram text, check the preview, and use the editor's PNG or SVG download. Nothing to install. Two things to know:

- Theme and background come from the editor's settings, so check them before you download.
- The editor can encode the diagram into a shareable URL. That URL contains the full diagram text, so do not share it if the diagram has anything private in it.

## 2. mermaid-cli (mmdc)

[mermaid-cli](https://github.com/mermaid-js/mermaid-cli) renders Mermaid files from the command line with a headless browser. It is the tool to use when diagrams live in a repository or you have more than one.

```bash
npx -p @mermaid-js/mermaid-cli mmdc -i flow.mmd -o flow.png
```

Or install it once with `npm install -g @mermaid-js/mermaid-cli` and run `mmdc` directly. The output format follows the file extension: `.png`, `.svg` or `.pdf`.

The flags you will use:

| Flag | Meaning | Example |
| --- | --- | --- |
| `-i` | input file (`.mmd`, or a Markdown file with mermaid blocks) | `-i flow.mmd` |
| `-o` | output file; extension sets the format | `-o flow.svg` |
| `-t` | theme: `default`, `forest`, `dark`, `neutral` | `-t neutral` |
| `-b` | background colour, or `transparent` | `-b white` |
| `-s` | scale factor for PNG | `-s 2` |
| `-w`, `-H` | page width and height in pixels | `-w 1600` |
| `-c` | Mermaid config JSON (theme variables, fonts) | `-c config.json` |
| `-C` | extra CSS file | `-C diagram.css` |

For a crisp PNG on a high-density screen or in a slide, use `-s 2` or `-s 3`. For a PNG that will sit on a coloured slide, `-b transparent`.

Given a Markdown file, mmdc renders each mermaid block to its own image and writes a copy of the Markdown that points at them:

```bash
mmdc -i README.md -o README.out.md
```

### With Docker

The project also publishes an image, useful in CI where you do not want Node and a browser on the runner:

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD:/data" minlag/mermaid-cli -i flow.mmd -o flow.png
```

## 3. An automated run: explain-to-customer

The [explain-to-customer](/) skill writes Mermaid as part of explaining a change to a client and renders it with mermaid-cli, in its own tool folder with a pinned version (12.0.0 at the time of writing). For each diagram you get:

| File | What it is |
| --- | --- |
| `diagrams/<name>.svg` | transparent SVG with the style's fonts embedded |
| `diagrams/<name>.png` | PNG at scale 2 on the style's background |
| `_source/diagrams/<name>.mmd` | the editable source |

Two details from its [diagram reference](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/reference/diagrams.md) solve common mmdc problems:

- **Fonts.** The skill loads the style's fonts through a CSS file and embeds them in the SVG, so it does not fall back to a default serif on a machine without those fonts. With plain mmdc, an SVG uses whatever fonts the viewer has.
- **Colours.** It maps the style's colours to hex values in Mermaid's `base` theme config. Mermaid's theme variables take hex colours, so named or oklch colours from a design system have to be converted first.

A syntax error fails only that diagram, and the output names the file and the parser's message.

## PNG or SVG?

| Destination | Use |
| --- | --- |
| Email, WhatsApp, Slack | PNG at scale 2 |
| Slides | PNG with `-b transparent`, or SVG if the tool accepts it |
| Web pages, docs sites | SVG |
| Confluence, Google Docs | See [this post](/blog/mermaid-diagram-confluence-google-docs) |
| Print | PDF or SVG |

## Keep the source

Whatever you export, keep the `.mmd` next to it. Editing a PNG means redrawing it; editing the text means changing one line and rendering again. The [sequence diagram](/blog/mermaid-sequence-diagram) and [ER diagram](/blog/mermaid-er-diagram) guides cover the syntax.

## FAQ

### How do I convert a Mermaid file to PNG?

With mermaid-cli: npx -p @mermaid-js/mermaid-cli mmdc -i diagram.mmd -o diagram.png. Add -s 2 for a sharper image and -b white or -b transparent for the background.

### How do I save a Mermaid diagram as an image online?

Open the Mermaid live editor, paste the diagram and use its PNG or SVG download. The rendering happens in your browser.

### Should I use PNG or SVG?

SVG for anything that scales, such as web pages and documents that accept it. PNG for email, chat apps and tools that only take bitmaps. Render PNG at scale 2 or more so it stays sharp.

## Related posts

- [Writing a Mermaid sequence diagram, from arrows to loops](/blog/mermaid-sequence-diagram)
- [Getting a Mermaid diagram into Confluence or Google Docs](/blog/mermaid-diagram-confluence-google-docs)
- [Mermaid entity relationship diagrams, explained by example](/blog/mermaid-er-diagram)
- [All posts](/blog/)

:::
