---
title: How to install a Claude Code skill
description: "How to add skills to Claude Code with the skills CLI or a git clone, where Claude Code looks for them and how to use a skill once it is installed, with explain-to-customer as the example."
---

# How to install a Claude Code skill

A Claude Code skill is a folder with a `SKILL.md` file in it. The file tells Claude Code what the skill is for and how to run it, and the folder can carry scripts, templates and reference notes next to it. Installing a skill means putting that folder where Claude Code looks for skills.

This page walks through it with explain-to-customer, a Claude Code skill that turns a code change into a client explainer video, slides and diagrams. The same steps work for most skills published on GitHub.

## Where Claude Code looks for skills

| Scope | Folder | Available in |
|---|---|---|
| Personal | `~/.claude/skills/<skill-name>/` | every project you open |
| Project | `.claude/skills/<skill-name>/` inside a repo | that project only, for everyone who clones it |

Pick personal for tools you use everywhere, project for skills your team should share through the repo.

## Option 1: the skills CLI

The [skills](https://github.com/vercel-labs/skills) CLI copies a skill from a GitHub repo into the right folder for you. Skills listed on [skills.sh](https://www.skills.sh/halitsever/explain-to-customer/explain-to-customer) install this way.

```bash
npx skills add halitsever/explain-to-customer -g -a claude-code
```

- `-g` installs it for your user, so it works in every project. Leave it out to install into the current project only.
- `-a claude-code` picks Claude Code as the target agent and skips the prompt that asks which agent to install for.

The CLI also keeps the skill up to date and removes it:

```bash
npx skills update explain-to-customer -g
npx skills remove explain-to-customer -g
```

## Option 2: copy the folder by hand

If you would rather not use npx, clone the repo and link or copy the skill folder into `~/.claude/skills`. In this repo the skill lives in `skills/explain-to-customer/`.

```bash
# macOS / Linux
git clone https://github.com/halitsever/explain-to-customer ~/explain-to-customer
mkdir -p ~/.claude/skills
ln -s ~/explain-to-customer/skills/explain-to-customer ~/.claude/skills/explain-to-customer
```

```powershell
# Windows (PowerShell)
git clone https://github.com/halitsever/explain-to-customer "$env:USERPROFILE\explain-to-customer"
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Copy-Item -Recurse "$env:USERPROFILE\explain-to-customer\skills\explain-to-customer" "$env:USERPROFILE\.claude\skills\"
```

With a symlink, `git pull` in the clone updates the skill. A copied folder has to be copied again after each pull.

Check that `~/.claude/skills/explain-to-customer/SKILL.md` exists. If Claude Code is not finding the skill, the folder is usually one level too deep or too shallow.

## Load the skill

If `~/.claude/skills` did not exist before you installed, run `/reload-skills` once in Claude Code, or start a new session.

## How to use Claude Code skills

There are two ways a skill runs:

- You type its name as a slash command, for example `/explain-to-customer`, with optional arguments after it.
- Claude starts it on its own when your request matches the `description` in `SKILL.md`.

A skill can turn the second way off. explain-to-customer does, with `disable-model-invocation: true` in its `SKILL.md`, because a run reads your diff and renders video, and that should only happen when you ask for it. So you start it yourself:

```
/explain-to-customer
/explain-to-customer HEAD~3..HEAD video style=apple
/explain-to-customer PR#42 all lang=en --yes
```

A skill's `SKILL.md` can also pre-approve the commands it runs, so Claude Code does not ask about each one. explain-to-customer pre-approves read-only `git` and `gh pr` commands, `ffprobe` and its own bundled scripts. Reading `SKILL.md` before you install a skill from someone you don't know is a good habit: it shows exactly which commands the skill is allowed to run.

## Next steps

- [Getting started](./getting-started) lists what explain-to-customer needs besides Claude Code: Node.js 22 or newer, FFmpeg and git.
- [Usage](./usage) covers every argument.
- [Troubleshooting](./troubleshooting) helps when `/explain-to-customer` is not found.
