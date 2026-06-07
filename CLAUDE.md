# ac-intelligence — Build Rules

**Project:** AC Intelligence (Amaro Campbell Intelligence) — AI consulting firm website. Greenfield build.
**Repo:** https://github.com/kaidena9/ac-intelligence (origin/main)

## MANDATORY: Skill usage for every build step

This site is being built using three installed skills. For **any** step in this build, the relevant skill(s) below MUST be invoked — do not freehand design, UI code, or copy.

### 1. `ui-ux-pro-max` — design intelligence (use FIRST, before writing code)
Invoke at the start of any step that involves a **design decision**: choosing or refining styles, color palettes, typography/font pairings, layout systems, spacing, components (buttons, navbars, cards, forms, tables, charts), responsive behavior, or reviewing existing UI for quality/accessibility.
- Run its search for recommendations before deciding:
  `python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<product/page keywords>" --design-system`
- Use `--domain style|color|typography|ux|chart` to deep-dive a single dimension.
- For an AI-consulting site, seed the search with terms like: `ai consulting firm enterprise b2b trust modern`.

### 2. `frontend-design` — distinctive, production-grade UI (use WHILE writing UI code)
Invoke whenever actually **writing or styling** markup/CSS/JS for the site. Apply its aesthetics guidelines so the result is striking and cohesive, not generic "AI slop." Pair the `ui-ux-pro-max` recommendations (what to use) with `frontend-design` execution (how to build it well).

### 3. `humanizer` — natural copy (use for ALL user-facing text)
Invoke on **any** copy that ships on the site: headlines, hero text, body, service descriptions, CTAs, captions, meta descriptions. Run the written text through it to strip AI-writing tells (em-dash overuse, rule of three, inflated symbolism, promotional filler, vague attributions) before it lands in the HTML. Especially important here — an AI firm's site must not read like AI wrote it.

### Per-step checklist
For each build task:
1. **Design decision involved?** → `ui-ux-pro-max` first.
2. **Writing/styling UI?** → `frontend-design`.
3. **Writing user-facing copy?** → `humanizer` before committing the text.

State which skill(s) you used at the start of each step so usage is visible. If a step touches none (pure git/deploy/config), say so explicitly rather than silently skipping.

## Project facts
- Greenfield as of 2026-06-07: repo contains only `README.md`. Tech stack TBD — decide with the user before scaffolding.
- Deploys from `main`. Do not commit/push without the user's go-ahead.
