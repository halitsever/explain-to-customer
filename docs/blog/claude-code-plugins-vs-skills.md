---
title: "Claude Code Plugins vs Skills: What's the Difference"
titleTemplate: false
description: "Claude Code plugins vs skills: a skill is one SKILL.md folder, a plugin packages skills, agents, hooks and MCP servers. When to ship which, from the docs."
headline: "Skills and plugins in Claude Code, and when you need which"
date: "2026-11-28"
keyword: "claude code plugins vs skills"
faq: [{"q": "Is a Claude Code plugin the same as a skill?", "a": "No. A skill is a folder with a SKILL.md file. A plugin is a directory with a manifest that can bundle several skills plus agents, hooks and MCP servers, installed as one unit."}, {"q": "Do I need a plugin to share a skill?", "a": "No. A skill can be shared as a folder or a git repository and installed into ~/.claude/skills or a project's .claude/skills. A plugin helps when you want several components, versioning and marketplace updates."}, {"q": "How are plugin skills named?", "a": "A skill inside a plugin runs as /plugin-name:skill-name, so two plugins can ship skills with the same name."}]
---

::: v-pre

# Skills and plugins in Claude Code, and when you need which

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A skill and a plugin both add something to Claude Code, and a plugin can contain skills, so the two are easy to mix up. This post lays out the difference using Anthropic's Claude Code docs as of 28 November 2026, and shows how one real skill, explain-to-customer, is shipped without a plugin.</p>

## Short answer

| | Skill | Plugin |
| --- | --- | --- |
| What it is | A folder with a `SKILL.md` and optional scripts and files | A directory of components with a manifest at `.claude-plugin/plugin.json` |
| Contains | Instructions Claude loads when relevant, or you run with `/name` | Skills, agents, hooks, MCP servers and other components |
| Installed to | `~/.claude/skills/`, a project's `.claude/skills/`, or inside a plugin | Through `/plugin` from a marketplace, or from a local folder |
| Invoked as | `/skill-name` | Its skills run as `/plugin-name:skill-name` |
| Updates | However you copied it in (git pull, a CLI) | From its marketplace, with versions |

## What a skill is

The [skills docs](https://code.claude.com/docs/en/skills) describe a skill as a `SKILL.md` file with instructions that Claude adds to its toolkit. Claude uses it when it is relevant, or you start it with `/skill-name`. The frontmatter at the top sets how it behaves:

```yaml
---
name: explain-to-customer
description: Turns a code change into customer-friendly visuals ...
argument-hint: '[commit|range|PR#|"what changed"] [video|image|diagram|all] ...'
disable-model-invocation: true
allowed-tools:
  - Bash(git diff *)
  - Bash(node "${CLAUDE_SKILL_DIR}/scripts/*)
---
```

That is the real header of [explain-to-customer's SKILL.md](https://github.com/halitsever/explain-to-customer/blob/main/skills/explain-to-customer/SKILL.md), shortened. `disable-model-invocation: true` means Claude never starts it on its own; you type `/explain-to-customer`. `allowed-tools` pre-approves the commands it needs for that turn.

Skills live in one of four places, per the docs: enterprise (managed settings), personal (`~/.claude/skills/<name>/SKILL.md`), project (`.claude/skills/<name>/SKILL.md`) or inside a plugin. If two share a name, enterprise wins over personal, and personal over project. Custom slash commands in `.claude/commands/` have been merged into skills and keep working. For a longer introduction, see [Claude Code skills](https://www.halit.org/posts/claude-code-skills) on halit.org.

## What a plugin is

The [plugins docs](https://code.claude.com/docs/en/plugins) define a plugin as a directory of skills, agents, hooks, MCP servers or other components that Claude Code installs and loads as one unit. Its manifest gives it a name and optionally a version and description. Components include:

- **Skills**, as above, namespaced by the plugin's name
- **Agents**: subagent definitions Claude can delegate to
- **Hooks**: commands that run at points in Claude Code's lifecycle, such as after every edit
- **MCP servers**: tool servers Claude Code connects to while the plugin is enabled

Plugins usually come from a marketplace, a catalog listed in a `.claude-plugin/marketplace.json`. Run `/plugin` and use the **Discover** tab. They install at user, project or local scope.

## When to use which

The docs put it plainly: skills, subagents, hooks and MCP servers all work on their own without a plugin. Use a plugin when you want several of them packaged as one unit, to install someone else's setup with one command and get updates from its marketplace, or to publish versioned releases of your own.

| You have | Ship it as |
| --- | --- |
| One workflow with instructions and a few scripts | A skill |
| A skill plus a hook that must run with it | A plugin |
| A team setup: several skills, an agent and an MCP server | A plugin in your own marketplace |
| Something you only use yourself | A personal skill in `~/.claude/skills` |

## A cost to know about

The plugins page notes that an enabled plugin is part of every session. The name and description of each skill, agent and command that Claude can invoke on its own sit in context on every turn, and the plugin's MCP servers and hooks run too, whether you use them or not. A skill with `disable-model-invocation: true`, like explain-to-customer, avoids the first part: Claude does not need to know about it until you type its name.

## How explain-to-customer is shipped

As a plain skill, in `skills/explain-to-customer/` of a public repository, installed with the open [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add halitsever/explain-to-customer -g -a claude-code
```

`-g` puts it in your user skills folder so it works in every project. There is no release step: a merge to `main` reaches users on their next `npx skills update`. It needs no hooks or MCP server, so a plugin would add packaging without adding anything else. The [install guide](/guide/install-claude-code-skill) covers manual installs with git as well.

## The open standard

The skills docs also say Claude Code skills follow the Agent Skills open standard, which works across several AI tools, and that Claude Code adds its own fields on top. Fields such as `argument-hint` and `disable-model-invocation` are Claude Code extensions: the docs note that they cause an error when you upload the skill to claude.ai or the Skills API. A skill meant for both needs a stripped-down frontmatter for the upload.

## FAQ

### Is a Claude Code plugin the same as a skill?

No. A skill is a folder with a SKILL.md file. A plugin is a directory with a manifest that can bundle several skills plus agents, hooks and MCP servers, installed as one unit.

### Do I need a plugin to share a skill?

No. A skill can be shared as a folder or a git repository and installed into ~/.claude/skills or a project's .claude/skills. A plugin helps when you want several components, versioning and marketplace updates.

### How are plugin skills named?

A skill inside a plugin runs as /plugin-name:skill-name, so two plugins can ship skills with the same name.

## Related posts

- [A release notes template your clients will actually read](/blog/release-notes-template)
- [From pull request to a short product update video](/blog/product-update-video-from-pull-request)
- [Explaining a code change to a client who does not code](/blog/explain-code-changes-to-clients)
- [All posts](/blog/)

:::
