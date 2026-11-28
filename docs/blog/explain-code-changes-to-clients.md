---
title: "How to Explain Code Changes to Non-Technical Clients"
titleTemplate: false
description: "How to explain technical changes to a non-technical client: start from what they see, use their words, show before and after, say what they must do."
headline: "Explaining a code change to a client who does not code"
date: "2026-11-28"
keyword: "explain technical to non technical person"
faq: [{"q": "How do you explain technical issues to non-technical users?", "a": "Start from what they experience, not from what you changed. Describe the before and after in the words they see on screen, say whether they need to do anything, and leave out code names and jargon."}, {"q": "What if a change has no visible effect?", "a": "Say so plainly and explain the benefit in their terms, such as fewer errors or faster pages, without inventing numbers. One diagram and a short message are enough."}, {"q": "Should I mention limitations to a client?", "a": "Yes. State known gaps and follow-ups plainly. It costs less trust than the client finding them."}]
---

::: v-pre

# Explaining a code change to a client who does not code

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Clients pay for changes they cannot read. The pull request is clear to you and meaningless to them, so the explanation has to be rebuilt from their side: what they or their users will notice, in the words on their screen. These are the rules the explain-to-customer skill follows for every run, and they work just as well when you write the update yourself.</p>

## Start from what they see

List the changes that a person using the product will notice. Ignore internal renames, tests and tooling unless they change behaviour. If the diff touches ten things and three matter to the client, explain three.

Then write the brief in their terms:

- **Before:** what their users experienced
- **After:** what they experience now
- **Where:** the page or menu, named as the product names it
- **What to do:** what the client has to do, often nothing

This is the structure of the change brief in the skill's [storytelling guide](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/reference/storytelling.md). Writing it before anything else stops the explanation from drifting back into code.

## Use the words on their screen

Quote the product's own labels exactly: the button text, the menu name, the error message. If the page says "Send invoice", the explanation says "Send invoice", not "the invoice dispatch endpoint". Collect those strings from the components and translation files, not from memory.

Words to leave out for a non-technical reader, from the skill's rules: file and function names, commit hashes, framework names, and terms such as endpoint, refactor, merge, deploy and cache. If a sentence needs one of them, rewrite the sentence.

| Instead of | Say |
| --- | --- |
| Refactored the validation layer | Error messages on sign-up now say what to fix |
| Added an index to the orders table | The orders page opens faster when there are many orders |
| Deployed to production | It is live |
| Fixed a race condition in checkout | Paying twice by double-clicking is no longer possible |

## Show, then tell

A before and after picture explains more than a paragraph. Options, from least to most effort:

1. **Two screenshots** with the changed area marked.
2. **A diagram** for changes the client cannot see on a screen, such as an email that is now sent right away. A [sequence diagram](/blog/mermaid-sequence-diagram) of before and after works well, with participants named as roles they recognise: Customer, Your shop, Payment provider.
3. **A short video**, 30 to 60 seconds. See [How to make a product update video from a pull request](/blog/product-update-video-from-pull-request).

## Be honest about the edges

The skill's honesty rules, which apply to anything you send:

- Never invent features, numbers, dates or customer names. If a benefit needs a number you do not have, describe the benefit without one.
- A visual that is not a real screenshot should look illustrative, never like fake product UI.
- State limitations and required actions plainly. "Nothing to do on your side" is a fine answer.
- No change with a visible effect? Say so, and tell the "under the hood" story in one diagram and a short message.

## Keep private things off screen

Before you send anything, check every caption and screenshot for API keys, tokens, internal hostnames, `localhost` URLs, stack traces and real customer data, including the names of your other clients. The [privacy page](/guide/privacy) lists what the skill scans for automatically. It cannot know which names are real; you can.

## Ask four questions before you start

When you run the skill, it asks four things in one dialog, and they are a good checklist for a hand-written update too:

1. **Format:** a short video, a few slides, a diagram, or all three?
2. **Save to:** where will the files live so you can find and send them?
3. **Style:** does it match the client's product, or a neutral look?
4. **Screenshots:** can you use the running app with demo data, or do you need illustrations only?

The skill recommends a format from the diff: video for visible UI changes, a diagram for logic and integrations, an image for small visual tweaks, everything for a large feature, and a diagram framed as "under the hood" when nothing is visible.

## Write the message last

Send the visuals with a short message in the client's language: a benefit-first subject, two to four sentences, what is new, what they need to do, and the attachments by name. The [release notes template](/blog/release-notes-template) has the full structure and a filled-in example.

## FAQ

### How do you explain technical issues to non-technical users?

Start from what they experience, not from what you changed. Describe the before and after in the words they see on screen, say whether they need to do anything, and leave out code names and jargon.

### What if a change has no visible effect?

Say so plainly and explain the benefit in their terms, such as fewer errors or faster pages, without inventing numbers. One diagram and a short message are enough.

### Should I mention limitations to a client?

Yes. State known gaps and follow-ups plainly. It costs less trust than the client finding them.

## Related posts

- [Writing a Mermaid sequence diagram, from arrows to loops](/blog/mermaid-sequence-diagram)
- [A release notes template your clients will actually read](/blog/release-notes-template)
- [From pull request to a short product update video](/blog/product-update-video-from-pull-request)
- [All posts](/blog/)

:::
