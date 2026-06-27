# boingyoyo — shared Claude Code skills

A bundle of [Claude Code **skills**](https://code.claude.com/docs/en/skills) shared with the
team through this repo. **No install step:** clone the repo, start Claude Code inside it, and all
the skills below are available immediately.

## Quick start

```bash
git clone https://github.com/JamesTzh/boingyoyo.git
cd boingyoyo
claude        # skills under .claude/skills/ are auto-discovered
```

That's it — there's nothing to download or enable. Claude Code automatically discovers skills in
`.claude/skills/` from your working directory up to the repo root, so starting Claude anywhere
inside the repo picks them up. You can confirm they loaded by asking Claude what skills it has, or
by invoking one directly (e.g. `/frontend-design`).

> **Scope:** these are *project* skills — they're active only while you're working **inside this
> repo**. They don't follow you into your other projects. (If you want a skill everywhere, install
> it as a personal skill in `~/.claude/skills/` or as a plugin instead.)

## Skills in this bundle

### From [anthropics/skills](https://github.com/anthropics/skills) — Apache-2.0

| Skill | What it's for |
|---|---|
| `frontend-design` | Distinctive, intentional visual design when building or reshaping UI — aesthetic direction, typography, avoiding templated defaults. |
| `mcp-builder` | Building high-quality MCP servers (Python/FastMCP or Node/TypeScript) to integrate external APIs as well-designed tools. |
| `web-artifacts-builder` | Elaborate multi-component claude.ai HTML artifacts using React, Tailwind, and shadcn/ui. |
| `webapp-testing` | Interacting with and testing local web apps via Playwright — verify UI, capture screenshots, read browser logs. |

### From [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) — MIT

| Skill | What it's for |
|---|---|
| `frontend-slides` | Animation-rich, zero-dependency HTML presentations from scratch or converted from PPT/PPTX. |

### From [obra/superpowers](https://github.com/obra/superpowers) — MIT

A library of engineering-workflow skills by Jesse Vincent. Vendored here as plain skills (see the
note below).

| Skill | What it's for |
|---|---|
| `brainstorming` | Explore intent, requirements, and design before any creative/build work. |
| `writing-plans` | Turn a spec into a written, multi-step implementation plan. |
| `executing-plans` | Execute a written plan in a separate session with review checkpoints. |
| `subagent-driven-development` | Execute plan tasks via independent subagents in the current session. |
| `dispatching-parallel-agents` | Coordinate 2+ independent tasks with no shared state. |
| `test-driven-development` | Write tests before implementation for any feature or bugfix. |
| `systematic-debugging` | Structured approach to any bug, test failure, or unexpected behavior. |
| `verification-before-completion` | Require evidence (run the commands) before claiming work is done. |
| `requesting-code-review` | Verify work meets requirements before merging. |
| `receiving-code-review` | Handle review feedback with technical rigor, not blind agreement. |
| `using-git-worktrees` | Isolate feature work in a dedicated workspace. |
| `finishing-a-development-branch` | Decide how to integrate completed work (merge / PR / cleanup). |
| `writing-skills` | Create, edit, and verify Claude Code skills. |
| `using-superpowers` | Meta-skill describing how the superpowers skills fit together. |

> **Note on superpowers:** upstream this is a *plugin* whose `SessionStart` hook makes Claude
> proactively reach for these skills. Vendored here as plain skills, they're fully usable — Claude
> can match them by description, and you can invoke any by name (e.g. `/systematic-debugging`) —
> but they are **not auto-triggered** at session start. If you want the full auto-dispatch
> behavior, install the upstream plugin instead:
> `/plugin marketplace add obra/superpowers` then `/plugin install superpowers`.

## Adding a skill to the bundle

1. Create `.claude/skills/<skill-name>/SKILL.md` with YAML frontmatter — at minimum `name`
   (matching the folder) and a `description` that says *when* to use it.
2. Put any supporting files (`scripts/`, `references/`, `assets/`) inside that same folder; refer
   to them with paths relative to the skill folder.
3. Commit and push. Teammates get it on their next `git pull` — no install.

See the [skill authoring docs](https://code.claude.com/docs/en/skills) for the full format.

## Licenses & attribution

These skills are redistributed from their upstream repos under their original licenses; each skill
folder retains its `LICENSE`/`LICENSE.txt`:

- `frontend-design`, `mcp-builder`, `web-artifacts-builder`, `webapp-testing` — © Anthropic,
  Apache-2.0 — https://github.com/anthropics/skills
- `frontend-slides` — © 2025 Zara Zhang, MIT — https://github.com/zarazhangrui/frontend-slides
- All `superpowers` skills — © 2025 Jesse Vincent, MIT — https://github.com/obra/superpowers
