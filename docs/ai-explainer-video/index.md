---
title: AI Explainer Video from Your Code Changes
titleTemplate: false
description: An AI explainer video maker for developers. Claude Code turns your diff into a 30 to 60 second MP4 with captions, slides and diagrams, rendered locally.
---

# Explainer videos for clients, made from the code you changed

<p class="lead">explain-to-customer is a free Claude Code skill. Point it at a commit, a branch or a pull request and it makes a short explainer video your client understands, with captions, a few slides, Mermaid diagrams and a ready-to-send message. It reads only what the diff shows and renders everything on your machine.</p>

<video src="/media/demo.mp4" poster="/media/demo-poster.webp" controls muted playsinline preload="none" style="width:100%;border-radius:12px" aria-label="A 43-second explainer video made by the skill for a sign-up form change"></video>

The video above is a real output: 43 seconds, made from a sign-up form change, in one of the 21 built-in styles. The same storyboard renders in any other style.

## Install

```bash
npx skills add halitsever/explain-to-customer -g -a claude-code
```

Then, in Claude Code, inside your project:

```text
/explain-to-customer
```

It needs Claude Code, Node.js 22 or newer (older versions use a slower video engine), FFmpeg and git. The [getting started guide](/guide/getting-started) has install commands for macOS, Windows and Linux.

## How it works, in four steps

1. **Pick the change.** A commit, a range such as `main..HEAD`, `PR#42`, or a sentence describing what changed. Without one, it takes your feature branch since it left the default branch.
2. **Answer one dialog.** Format (video, slides, diagram or all), where to save, which style, and whether to screenshot your running app.
3. **Approve the storyboard.** Claude reads the diff and the code around it and writes scenes with on-screen text and a draft message. You render it, shorten it, add detail or change the style.
4. **Get the folder.** Screenshots, diagrams, slides and video are rendered locally, checked by a QA script and by Claude looking at every frame, and saved where you chose.

[How it works](/guide/how-it-works) has the full detail.

## Three styles, one storyboard

<div class="style-trio">
  <figure><img src="/media/styles/shadcn.webp" alt="Summary card in the shadcn style" width="1280" height="720" loading="lazy"><figcaption><code>style=shadcn</code></figcaption></figure>
  <figure><img src="/media/styles/whiteboard.webp" alt="Summary card in the hand-drawn whiteboard style" width="1280" height="720" loading="lazy"><figcaption><code>style=whiteboard</code></figcaption></figure>
  <figure><img src="/media/styles/terminal.webp" alt="Summary card in the retro terminal style" width="1280" height="720" loading="lazy"><figcaption><code>style=terminal</code></figcaption></figure>
</div>

Each style was rendered from the same storyboard. There are 21 in total, from Apple Keynote and Linear to Neo-brutalism and Nord, plus **Match my project**, which reads your repo's own colours, fonts, radius and logo. Contrast is checked against WCAG AA before anything renders. [See all 21 styles](/guide/styles).

## What you get

| Output | Details |
| --- | --- |
| Video | 30 to 60 seconds in four to seven scenes, 1920x1080 at 30 fps, H.264, captions burned in, kept under 25 MB for email. 4:5 and 9:16 on request |
| Poster and GIF | For chat apps that do not play video inline |
| Slides | 3 to 5 PNGs at 3840x2160, starting with a one-page summary card |
| Diagrams | 1 to 3 Mermaid diagrams as SVG with embedded fonts, PNG and editable `.mmd` |
| Message | A short note in your client's language: subject, summary, what is new, what they need to do, attachments |

The [outputs guide](/guide/outputs) shows a full folder.

## Why not a general AI video tool

Many AI explainer video tools start from a script or prompt you write and generate scenes or an avatar to match it. This one starts from your code:

- **The content comes from the diff.** It quotes the real button labels and headings from your components and translation files, and does not invent features, numbers or dates.
- **Visuals are real or clearly illustrative.** Screenshots come from your running app with demo data, numbered callouts and personal data masked. Anything that is not a screenshot looks like a diagram, never like fake UI.
- **Nothing leaves your machine.** Rendering runs locally with HyperFrames, Playwright, Mermaid and FFmpeg. Telemetry in the rendering tools is switched off.
- **Your project stays read-only.** The skill never edits, commits or installs anything in your repo.

The [privacy page](/guide/privacy) lists what is scanned for before delivery: API keys, tokens, internal hosts, real email addresses.

## Questions

### Is it free?

Yes. The skill is MIT licensed. Claude Code itself needs a Claude subscription or an API account.

### How big is the download?

The first run asks before installing its rendering tools once: about 250 MB of downloads (npm packages and a headless Chromium, skipped when Playwright already has one). They go into a cache folder, never into your project.

### Does it add a voice-over?

No. Videos are silent by default with on-screen captions, which suits email and chat. A storyboard can add a music track and short sound cues.

### What languages does it write in?

Your conversation language unless you pass `lang=`, for example `lang=tr`. On-screen labels such as Before and Now are built in for eight languages, and any other language works by setting four labels.

### Can I edit the result?

Every run keeps a `_source/` folder with the storyboard and diagram sources. Ask for a shorter cut, another language or another style and only the affected outputs are rendered again.

More on the approach: [How to make a product update video from a pull request](/blog/product-update-video-from-pull-request) and [How to explain code changes to non-technical clients](/blog/explain-code-changes-to-clients).

<style>
.style-trio {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
}
.style-trio figure {
  margin: 0;
}
.style-trio img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.style-trio figcaption {
  margin-top: 6px;
  font-size: 14px;
}
</style>
