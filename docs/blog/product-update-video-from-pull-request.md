---
title: "How to Make a Product Update Video from a PR"
titleTemplate: false
description: "Make a short product explainer video from a pull request: pick the story, capture real screenshots, write captions, render a 30 to 60 second MP4 locally."
headline: "From pull request to a short product update video"
date: "2026-11-28"
keyword: "product explainer video"
faq: [{"q": "How long should a product update video be?", "a": "30 to 60 seconds for one change, in four to seven scenes. The skill's hard maximum is 90 seconds; a one-line fix can be 20."}, {"q": "Do product update videos need a voice-over?", "a": "Not for a short update. Silent video with on-screen captions works in email and chat, where most clients watch with the sound off."}, {"q": "Can I make the video vertical for social media?", "a": "Yes. The skill renders 16:9 by default and 4:5 (1080x1350) or 9:16 (1080x1920) when the storyboard sets meta.aspect."}]
---

::: v-pre

# From pull request to a short product update video

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A client who asked for a change wants to see it, not read about it. A short video does that better than a paragraph, and the material for it is already in the pull request: the diff says what changed, the running app shows it. This post walks through the steps, by hand and with the explain-to-customer skill, which automates them inside Claude Code.</p>

## 1. Find the story in the diff

A pull request mixes what the client sees with what they never will: renamed functions, tests, dependency bumps. Start by listing only what changed for the person using the product, and keep the one to three changes that matter most. The skill's storytelling guide ([storytelling.md](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/reference/storytelling.md)) puts it in four steps: list user-facing changes, keep the most relevant, say plainly when there is no visible effect, and collect the product's real words (button labels, headings, error messages) from the components and translation files.

Write a short brief before you touch a video tool:

| Field | Example |
| --- | --- |
| Title (8 words max, benefit first) | Clearer error messages on sign-up |
| Before | Users saw "Invalid input" and guessed |
| After | Each field says what to fix |
| Where | Sign-up page |
| What the client must do | Nothing |

## 2. Plan the scenes

A typical arc, from the same guide: title, before, after (with real UI), how it works (a diagram), how to use it, what you need to do, outro. Drop any scene that adds nothing. Timing rules worth copying:

- 30 to 60 seconds, 4 to 7 scenes
- at most 12 words per caption line, two lines per block
- each caption on screen at least 2.5 seconds, about 3 words per second plus a second to look

## 3. Capture real screenshots

Screenshots of the actual app beat mock-ups, and the skill refuses to draw fake product UI. Use demo data, never a real customer's account. The skill captures with Playwright from your running dev server: numbered callouts on the parts that changed, a neutral browser frame, and personal data such as emails, phone numbers and card numbers masked automatically. For an optional "before" shot it uses a temporary git worktree of the earlier version and removes it afterwards, so your working copy is never touched.

## 4. Render

The skill renders locally, with no upload:

- Scenes are HTML templates styled with CSS variables, animated with GSAP and rendered by [HyperFrames](https://github.com/heygen-com/hyperframes) in headless Chrome, encoded with FFmpeg.
- Output is 1920x1080 at 30 fps, H.264, with captions burned in.
- A file that would pass 25 MB is re-encoded smaller so it fits in an email.
- A poster image and a GIF preview come with it for chat apps.

Doing this by hand works too: record the screen, cut it to under a minute, add captions in any editor. The time goes into steps 1 and 2 either way.

## Doing it with explain-to-customer

In Claude Code, inside the project:

```text
/explain-to-customer PR#123 video
```

With the GitHub CLI installed, the skill reads the pull request's title, body and files with `gh pr view` and `gh pr diff`. Then:

1. A preflight script collects the git scope, the save folders, a responding dev server and which tools are installed.
2. One dialog asks what to create, where to save it, which style and whether to screenshot your running app. Arguments you already passed skip their question.
3. Claude reads the full diff and writes the storyboard and a draft message.
4. You see the storyboard and pick **Render it**, **Shorter**, **More detail** or **Change style**.
5. It renders and runs a QA script, then looks at every extracted frame for clipped text, contrast, wrong fonts and leaked secrets, fixing up to twice.

The first run asks to install the rendering tools once, about 250 MB, into a cache folder outside your project.

The result is a folder with the MP4, the poster, the GIF, 3 to 5 PNG slides, Mermaid diagrams and a ready-to-send message. The [demo video](/ai-explainer-video/) shows one.

## Formats beyond 16:9

Set `meta.aspect` in the storyboard to `"4:5"` for feeds or `"9:16"` for stories, and the scenes switch to a stacked portrait layout. Audio is off by default; adding `meta.audio` mixes music and short sound cues.

## Send it with words

A video without a message gets ignored. Send it with three or four sentences: what changed, why it helps, what the client needs to do. The [release notes template](/blog/release-notes-template) has the format, and [How to explain code changes to non-technical clients](/blog/explain-code-changes-to-clients) has the wording rules.

## FAQ

### How long should a product update video be?

30 to 60 seconds for one change, in four to seven scenes. The skill's hard maximum is 90 seconds; a one-line fix can be 20.

### Do product update videos need a voice-over?

Not for a short update. Silent video with on-screen captions works in email and chat, where most clients watch with the sound off.

### Can I make the video vertical for social media?

Yes. The skill renders 16:9 by default and 4:5 (1080x1350) or 9:16 (1080x1920) when the storyboard sets meta.aspect.

## Related posts

- [A release notes template your clients will actually read](/blog/release-notes-template)
- [Skills and plugins in Claude Code, and when you need which](/blog/claude-code-plugins-vs-skills)
- [Explaining a code change to a client who does not code](/blog/explain-code-changes-to-clients)
- [All posts](/blog/)

:::
