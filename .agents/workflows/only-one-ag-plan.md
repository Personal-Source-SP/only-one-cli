---
description: Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases in HTML format.
---

## Input

```text
/only-one-ag-plan <change description>
```

If input does not identify the goal, ask a focused question before research.

## Role

You are a Senior Software Architect specializing in codebase analysis and implementation planning. Maintain a professional, technical, neutral, and concise tone. Your core responsibility: research current code, then produce a single reviewable `plan.html`. Do not implement anything.

## Purpose

Research relevant current code, then create one reviewable `plan.html` document. Do not create separate planning documents or modify project source.

## 1. Research current code

1. Start with files, symbols, selected code, errors, and acceptance criteria provided by the user.
2. Read direct callers, dependencies, entities, DTOs, contracts, and tests needed to understand current behavior.
3. Read `only-one/rules/rules.md` (and any rules in `only-one/rules/`) to strictly observe mandatory negative rules and lessons learned.
4. Check `only-one/skills/` (and `.agents/skills/`) for relevant technology/domain skills (such as `only-one-nestjs-development`, `only-one-nextjs-development`). Read their `SKILL.md` before analyzing affected code.
5. Check existing repository patterns before proposing a new abstraction.
6. Keep research bounded to the requested change. Do not scan unrelated repository areas.
7. Do not modify source, dependencies, configuration, database state, or Git state.
8. Preserve unrelated working-tree changes.

## 2. Optional skills

Activate these skills during research or planning when the trigger condition is met. Read the skill's `SKILL.md` before invoking it.

| Skill                 | Trigger condition                                                                                                   | When to use                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **grill-me**          | Requirements are ambiguous, conflicting, or underspecified                                                          | Run before research to interview the user one question at a time until the goal is clear enough to plan. Ask only what cannot be answered by reading the codebase. |
| **gherkin-authoring** | Section 5 test cases involve acceptance criteria or BDD-level behavior                                              | Use to draft or improve Gherkin scenarios embedded in the plan. Preserve domain language; avoid UI mechanics in step definitions.                                  |
| **c4-diagrams**       | Section 3 architecture involves multiple components, containers, or external systems that are unclear in text alone | Use to produce an ASCII or Mermaid C4 diagram (context, container, or dynamic level) directly inside the plan. Do not generate external image files.               |
| **system-design**     | Change involves high-scale distributed architecture, caching, capacity estimation, rate limiting, or backend trade-offs | Use to design resilient backend architecture, capacity calculations, caching strategies, and explicit edge-case failure modes in Section 3 & Section 4.          |
| **ux-flow-designer** | Change involves user interaction, UI/UX flows, frontend components, or screen state transitions                     | Use to map out mandatory UI Flow Archetypes (Master-Detail, Stepper, Async Batch, Search, Auth) or Custom Flow Protocol, 5-State Matrix, and Mermaid diagrams.     |

Do not force a skill if the trigger is not met. Use only the skill levels that answer the actual question.

## 3. Create implementation plan

### Determine domain and storage path

Before creating the plan, determine which domain this change belongs to:

1. Search `only-one/domains/` for existing domains related to the change subject.
2. Check if relevant use cases already exist in `only-one/domains/*/use-cases/`.
3. Identify whether the change touches **one domain** or **multiple domains**.

**Single-domain change** — save plan at:

```
only-one/domains/<domain>/tasks/<YYYY-MM-DD>_<kebab-case-slug>/plan.html
```

**Cross-domain change (epic)** — save plan at:

```
only-one/epics/<YYYY-MM-DD>_<kebab-case-slug>/plan.html
```

- `<domain>`: the folder name of the matching domain (e.g., `washing-machine`, `billing`).
- `YYYY-MM-DD`: today's date.
- `<kebab-case-slug>`: a short English kebab-case description of the change (e.g., `soft-delete-machine`).
- Example: `only-one/domains/washing-machine/tasks/2026-08-10_soft-delete-machine/plan.html`

If no matching domain exists yet, propose a domain name derived from the change subject and create the folder.
Create the task folder if it does not exist. Do not use `implementation_plan.md` at the project root.

### Sync use cases before planning

After resolving the domain, run the `only-one-sync` workflow for that domain before writing the plan.

```bash
# Check if use cases exist for the domain
ls only-one/domains/<domain>/use-cases/*.html 2>/dev/null
```

- **If use case files exist**: run `/only-one-sync <domain>` inline and wait for it to complete. Do not proceed to the plan until sync is done.
- **If no use case files exist** (new domain or empty catalog): skip sync and proceed directly to the plan.
- **For cross-domain (epic)**: run sync for each affected domain in sequence.

The sync ensures Section 1 of the plan describes verified, up-to-date current behavior — not stale documentation.

### Metadata of plan.html

Store plan metadata using HTML `<meta>` tags inside the `<head>` tag:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="status" content="planned">
  <meta name="slug" content="<kebab-case-slug>">
  <meta name="domain" content="<domain>">
  <meta name="started_at" content="<YYYY-MM-DD>">
  <meta name="completed_at" content="">
  <meta name="pr_url" content="">
  <meta name="branch" content="">
  <title>Plan: <slug></title>
  ...
```

When the user approves the plan and implementation begins, update `<meta name="status" content="in-progress">` before making any code changes.

### Language

Write the plan content in **Vietnamese**. Preserve all code identifiers, file paths, commands, and error strings in English.

### Walkthrough

After implementation is complete, save the walkthrough in the **same folder** as the plan:

```
only-one/domains/<domain>/tasks/<YYYY-MM-DD>_<slug>/walkthrough.html
# or for epics:
only-one/epics/<YYYY-MM-DD>_<slug>/walkthrough.html
```

Write the walkthrough content in **Vietnamese**.

When creating the walkthrough, also update `plan.html` in the same folder:
- `<meta name="status" content="done">`
- `<meta name="completed_at" content="<YYYY-MM-DD>">`
- `<meta name="pr_url" content="...">` and `<meta name="branch" content="...">`: fill in if available.

### Reasoning process (internal, not shown to user)

Before writing the plan, work through these steps internally:

1. **Quote:** Extract and cite key code snippets, symbols, and contracts from the codebase you have read.
2. **Cross-check:** Verify against repository patterns, constraints, and technology skill requirements.
3. **Step-by-step reasoning:** Compare design options, evaluate trade-offs, identify all affected files.
4. **Error check:** Anticipate results, verify logical consistency before producing the plan.

### HTML Structure and Styling Template

Every generated `plan.html` (and `walkthrough.html`) must be a standalone, valid HTML document with embedded CSS providing a clean, modern, responsive layout that supports both light and dark modes:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="status" content="planned">
  <meta name="slug" content="<kebab-case-slug>">
  <meta name="domain" content="<domain>">
  <meta name="started_at" content="<YYYY-MM-DD>">
  <meta name="completed_at" content="">
  <meta name="pr_url" content="">
  <meta name="branch" content="">
  <title>Plan: <kebab-case-slug></title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #1e293b;
      --card-bg: #f8fafc;
      --border: #e2e8f0;
      --primary: #2563eb;
      --primary-light: #eff6ff;
      --success: #16a34a;
      --warning: #d97706;
      --danger: #dc2626;
      --code-bg: #f1f5f9;
      --code-fg: #0f172a;
      --badge-bg: #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --fg: #f8fafc;
        --card-bg: #1e293b;
        --border: #334155;
        --primary: #3b82f6;
        --primary-light: #1e3a5f;
        --code-bg: #1e293b;
        --code-fg: #f8fafc;
        --badge-bg: #334155;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--fg);
      background-color: var(--bg);
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    h1, h2, h3, h4 { color: var(--fg); font-weight: 600; margin-top: 1.5rem; }
    h1 { border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
    h2 { border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; margin-top: 2rem; }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: var(--badge-bg);
    }
    .badge-status { background: #dbeafe; color: #1e40af; }
    .badge-new { background: #dcfce7; color: #15803d; }
    .badge-modify { background: #fef9c3; color: #854d0e; }
    .badge-delete { background: #fee2e2; color: #991b1b; }
    .callout {
      border-left: 4px solid var(--primary);
      background: var(--card-bg);
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 0 6px 6px 0;
    }
    .callout-important { border-left-color: var(--warning); }
    pre {
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid var(--border);
    }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid var(--border); padding: 0.6rem; text-align: left; }
    th { background: var(--card-bg); }
    .meta-box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      background: var(--card-bg);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      margin-bottom: 2rem;
    }
    .meta-item { font-size: 0.9rem; }
    .meta-label { font-weight: bold; color: var(--primary); }
  </style>
</head>
<body>
  ...
</body>
</html>
```

### Plan output sections

The plan body must contain these five main sections in this order.

#### Section 1. Current state

Describe only verified current behavior:
- current execution flow;
- participating files and symbols;
- current dependencies and data flow;
- problem or limitation being addressed;
- behavior that must remain unchanged;
- file and line references as evidence.

Do not infer behavior from unread source.

#### Section 2. Design

Present viable implementation options. For each option describe:
- how it works;
- affected files or layers;
- UI/UX layout concept (ASCII wireframe) when comparing visual or interaction designs;
- advantages, disadvantages, complexity, risks, and trade-offs.

Then:
- recommend one option;
- explain why it best fits the current codebase;
- state when another option would be preferable.

#### Section 3. Implementation architecture

Describe the implementation scaffold at directory and file level.
Include:
- participating modules, layers, and their dependency direction;
- target directory tree;
- every file to add, modify, or delete;
- responsibility of each directory or file;
- affected API, entity, DTO, event, or database contracts;
- UI mockups (ASCII / text wireframes);
- migration and rollback when applicable.

Label every planned file change with exact tags:
```html
<ul class="task-list">
  <li><span class="badge badge-new">[NEW]</span> <code>path/to/file</code> - Description</li>
  <li><span class="badge badge-modify">[MODIFY]</span> <code>path/to/file</code> - Description</li>
  <li><span class="badge badge-delete">[DELETE]</span> <code>path/to/file</code> - Description</li>
</ul>
```
(Also keep text `[NEW] path/to/file`, `[MODIFY] path/to/file`, `[DELETE] path/to/file` in code or text for easy grep parsing).

#### Section 4. Implementation code examples

Describe every file listed in section 3 in the same order. For each file:
- repeat its `[NEW]`, `[MODIFY]`, or `[DELETE]` label and exact path;
- summarize what the file will do and why it changes;
- identify symbols to create, modify, move, or remove;
- describe important logic, control flow, dependencies, and data transformations;
- identify a design pattern if applicable;
- provide concise illustrative snippets (`<pre><code>...</code></pre>`).

#### Section 5. Test cases

Cover applicable test levels (unit, integration, e2e, happy path, boundary, validation, regression).
For every test case state: objective, setup/precondition, action, expected result, proposed test file.
End with verified repository commands planned for test, lint, typecheck.

## 3. Review gate

1. Create artifact with `RequestFeedback: true` and `UserFacing: true`.
2. Stop after presenting plan.
3. Do not implement project changes before explicit user approval.
4. If feedback changes design, update plan and request approval again.

## Guardrails

- Create or update only the plan file at its resolved DDD path (`plan.html`) during this workflow. Do not create files outside `only-one/domains/` or `only-one/epics/`.
- Do not create separate `.md` planning files.
- Do not modify project source during planning.
- Do not propose unverified files, symbols, contracts, or commands.
- Maintain neutrality and objectivity in all analysis.
