---
title: "Release Notes Template for Client Updates"
titleTemplate: false
description: "A release notes template for client updates: subject line, what changed, what they need to do, known limits, plus a Keep a Changelog version for developers."
headline: "A release notes template your clients will actually read"
date: "2026-11-28"
keyword: "release notes template"
faq: [{"q": "What should release notes include?", "a": "For clients: a benefit-first summary, what is new in the product's own words, what they need to do (or that nothing is needed), known limitations, and links or attachments. For developers: changes grouped as Added, Changed, Deprecated, Removed, Fixed and Security."}, {"q": "How long should client release notes be?", "a": "Short enough to read on a phone: a subject line, two to four sentences of summary and a few bullets. Put detail in attachments such as a short video or a one-page summary."}, {"q": "Should release notes mention bugs that are still open?", "a": "Yes, when they affect the client. A plain limitations line builds more trust than finding out later."}]
---

::: v-pre

# A release notes template your clients will actually read

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Release notes have two audiences. Developers want a changelog grouped by type. Clients want to know what is different for them and whether they have to do anything. This post gives a template for each, based on the message template and change brief the explain-to-customer skill fills in for every run.</p>

## Client template

Copy this, fill in the braces and delete what does not apply. It follows the structure of the skill's [message template](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/templates/message.md.tmpl):

```md
**{Subject: the benefit, under 60 characters}**

Hi {client name},

{Two to four sentences: what changed, why it helps them, where they find it.}

**What's new**
- {Change 1, using the words they see on screen}
- {Change 2}

**What you need to do**
{One sentence, or: Nothing, it is already live.}

**Good to know**
- {Known limitation or follow-up, if any}

**Attached**
- {short-video.mp4: a 40-second walkthrough}
- {summary.png: one-page summary}

{Sign-off},
{Your name}
```

## How to fill it in

**Subject.** The benefit, not the task. "Clearer error messages on sign-up", not "Refactor form validation". The skill's storytelling rules ([storytelling.md](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/reference/storytelling.md)) cap the title at eight words.

**Summary.** One sentence a busy client reads in five seconds, then one or two that say where to find the change. Write it last, after the bullets, when you know what matters.

**What's new.** Use the product's real labels: button text, menu names, page titles, exactly as the client sees them. If the button says "Send invoice", do not write "the invoice dispatch feature".

**What you need to do.** The line clients look for first. "Nothing on your side" is a complete and useful answer. If they do need to act, say what and by when.

**Good to know.** Limitations, rollout caveats, the next step. Leave it out if there is nothing, rather than padding it.

**Attached.** List each file by name with one line about it.

## A filled-in example

```md
**Customers now get their order confirmation right away**

Hi Dana,

Order confirmation emails now go out the moment an order is placed,
instead of in the next morning's batch. Customers no longer write in
to ask whether their order went through.

**What's new**
- The "Order confirmed" email is sent within a minute of checkout
- The email now includes the delivery estimate shown at checkout

**What you need to do**
Nothing. It is live for all new orders.

**Good to know**
- Orders placed before today keep the old schedule.

**Attached**
- order-confirmation.mp4: 35-second walkthrough
- images/01-summary.png: one-page summary
```

Every fact in it has to come from the change itself. The skill's honesty rules are worth borrowing even when you write by hand: never invent features, numbers, dates or customer names, and if a benefit needs a number you do not have, describe the benefit without one.

## Developer changelog template

For a `CHANGELOG.md` or GitHub release, [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) is the common format. Newest version first, with an Unreleased section on top:

```md
## [Unreleased]

## [1.4.0] - 2026-11-28
### Added
- Order confirmation email is sent at checkout.
### Changed
- Confirmation email includes the delivery estimate.
### Fixed
- Duplicate confirmation when a payment is retried.
```

The six change types are Added, Changed, Deprecated, Removed, Fixed and Security. That grouping suits developers. It does not suit clients, who care about what they see, not which category a change falls in. Keep both: the changelog in the repo, the client note in their inbox.

## Release notes versus a change explainer

A release note covers everything in a version. A change explainer covers one change, in more depth, with visuals. For a change a client asked for, the second is often what they want. The [explain-to-customer](/) skill produces both parts of that from a commit or pull request: the message above plus a short video, slides and diagrams. [How to make a product update video from a pull request](/blog/product-update-video-from-pull-request) walks through it, and [How to explain code changes to non-technical clients](/blog/explain-code-changes-to-clients) covers the writing rules.

## FAQ

### What should release notes include?

For clients: a benefit-first summary, what is new in the product's own words, what they need to do (or that nothing is needed), known limitations, and links or attachments. For developers: changes grouped as Added, Changed, Deprecated, Removed, Fixed and Security.

### How long should client release notes be?

Short enough to read on a phone: a subject line, two to four sentences of summary and a few bullets. Put detail in attachments such as a short video or a one-page summary.

### Should release notes mention bugs that are still open?

Yes, when they affect the client. A plain limitations line builds more trust than finding out later.

## Related posts

- [Writing a Mermaid sequence diagram, from arrows to loops](/blog/mermaid-sequence-diagram)
- [From pull request to a short product update video](/blog/product-update-video-from-pull-request)
- [Explaining a code change to a client who does not code](/blog/explain-code-changes-to-clients)
- [All posts](/blog/)

:::
