---
description: Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.
---

## Input

```text
/only-one-ag-plan <change description>
```

If input does not identify the goal, ask a focused question before research.

## Role

You are a Senior Software Architect specializing in codebase analysis and implementation planning. Maintain a professional, technical, neutral, and concise tone. Your core responsibility: research current code, then produce a single reviewable `plan.md`. Do not implement anything.

## Purpose

Research relevant current code, then create one reviewable `plan.md` document. Do not create separate planning documents or modify project source.

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
only-one/domains/<domain>/tasks/<YYYY-MM-DD>_<kebab-case-slug>/plan.md
```

**Cross-domain change (epic)** — save plan at:

```
only-one/epics/<YYYY-MM-DD>_<kebab-case-slug>/plan.md
```

- `<domain>`: the folder name of the matching domain (e.g., `washing-machine`, `billing`).
- `YYYY-MM-DD`: today's date.
- `<kebab-case-slug>`: a short English kebab-case description of the change (e.g., `soft-delete-machine`).
- Example: `only-one/domains/washing-machine/tasks/2026-08-10_soft-delete-machine/plan.md`

If no matching domain exists yet, propose a domain name derived from the change subject and create the folder.
Create the task folder if it does not exist. Do not use `implementation_plan.md` at the project root.

### Sync use cases before planning

After resolving the domain, run the `only-one-sync` workflow for that domain before writing the plan.

```bash
# Check if use cases exist for the domain
ls only-one/domains/<domain>/use-cases/*.md 2>/dev/null
```

- **If use case files exist**: run `/only-one-sync <domain>` inline and wait for it to complete. Do not proceed to the plan until sync is done.
- **If no use case files exist** (new domain or empty catalog): skip sync and proceed directly to the plan.
- **For cross-domain (epic)**: run sync for each affected domain in sequence.

The sync ensures Section 1 of the plan describes verified, up-to-date current behavior — not stale documentation.

### Frontmatter of plan.md

Write this YAML frontmatter at the very top of the file, before all other content:

```yaml
---
status: planned
slug: <kebab-case-slug>
domain: <domain>          # use list format for cross-domain: [domain1, domain2]
started_at: <YYYY-MM-DD>
completed_at: ~
pr_url: ~
branch: ~
---
```

When the user approves the plan and implementation begins, update `status` to `in-progress` before making any code changes.

### Language

Write the plan content in **Vietnamese**. Preserve all code identifiers, file paths, commands, and error strings in English.

### Walkthrough

After implementation is complete, save the walkthrough in the **same folder** as the plan:

```
only-one/domains/<domain>/tasks/<YYYY-MM-DD>_<slug>/walkthrough.md
# or for epics:
only-one/epics/<YYYY-MM-DD>_<slug>/walkthrough.md
```

Write the walkthrough content in **Vietnamese**.

When creating the walkthrough, also update `plan.md` in the same folder:
- `status`: set to `done`
- `completed_at`: today's date
- `pr_url` and `branch`: fill in if available

### Reasoning process (internal, not shown to user)

Before writing the plan, work through these steps internally:

1. **Quote:** Extract and cite key code snippets, symbols, and contracts from the codebase you have read.
2. **Cross-check:** Verify against repository patterns, constraints, and technology skill requirements.
3. **Step-by-step reasoning:** Compare design options, evaluate trade-offs, identify all affected files.
4. **Error check:** Anticipate results, verify logical consistency before producing the plan.

### Plan output

The plan must contain these five main sections in this order.

#### Section 1. Current state

Describe only verified current behavior:

- current execution flow;
- participating files and symbols;
- current dependencies and data flow;
- problem or limitation being addressed;
- behavior that must remain unchanged;
- clickable file and line links as evidence.

Do not infer behavior from unread source.

#### Section 2. Design

Present viable implementation options. For each option describe:

- how it works;
- affected files or layers;
- UI/UX layout concept (ASCII wireframe) when comparing visual or interaction designs;
- advantages;
- disadvantages;
- complexity;
- risks and trade-offs.

Then:

- recommend one option;
- explain why it best fits the current codebase;
- state when another option would be preferable.

Use two or three options when genuinely useful. Do not invent weak alternatives to meet a count. If only one viable option exists, explain why.

#### Section 3. Implementation architecture

Describe the implementation scaffold at directory and file level. This section prepares the structure before implementation; do not repeat detailed per-file logic that belongs in section 4.

Include:

- participating modules, layers, and their dependency direction;
- target directory tree showing relevant existing and planned paths;
- every file to add, modify, or delete;
- responsibility of each directory or file in one concise line;
- request, processing, persistence, and response flow when useful for understanding structure;
- affected API, entity, DTO, event, or database contracts;
- UI mockups (ASCII / text wireframes) whenever the change involves frontend/UI: draw visual wireframes, layout boxes, component hierarchy, controls, and key states directly in text/markdown blocks (no image files needed—just clear text drawings to easily visualize the interface);
- migration and rollback when applicable;
- Mermaid or ASCII diagram when multiple components make text unclear.

Label every planned file change:

```text
[NEW] path/to/file
[MODIFY] path/to/file
[DELETE] path/to/file
```

Use explicit verified paths. Do not use globs. Group files under their parent directories or architecture layers. Keep file descriptions structural and concise; defer detailed behavior and code examples to section 4.

#### Section 4. Implementation code examples

Describe every file listed in section 3 in the same order. For each file:

- repeat its `[NEW]`, `[MODIFY]`, or `[DELETE]` label and exact path;
- summarize what the file will do and why it changes;
- identify symbols to create, modify, move, or remove;
- describe important logic, control flow, dependencies, and data transformations;
- describe inputs, outputs, validation, error handling, and contract effects when applicable;
- identify a design pattern that can be applied when it genuinely improves the solution;
- for each proposed pattern, explain the problem it solves, where it applies, and its trade-offs;
- provide concise illustrative snippets for important logic, method signatures, types, interfaces, configuration, or pseudocode;
- explicitly state when no code example is needed for an obvious manifest, export, deletion, or mechanical change.

Do not force a design pattern into simple code. If no pattern provides clear value, state `Design pattern: None needed` or omit the field. Prefer existing repository patterns over introducing a new abstraction.

Every planned file from section 3 MUST have a corresponding subsection in section 4. Do not introduce files in section 4 that are absent from section 3.

Mark snippets as illustrative, not final patches. Do not copy complete files. Omit only snippets that add no design-review value, but retain the file subsection and its implementation description.

Use this format:

````markdown
#### [MODIFY] `src/modules/example/example.service.ts`

**Overview:** Enforce the new execution rule while preserving the existing service boundary.

**Symbols:** `ExampleService.execute`, `ExecuteInput`, `Result`

**Design pattern:** Strategy — isolates interchangeable execution rules behind the existing service contract. Prefer direct branching if only one stable rule exists.

```ts
async execute(input: ExecuteInput): Promise<Result> {
  // Illustrative proposed flow
}
```

- Validate input before persistence.
- Keep transaction boundary in service.
- Map domain errors through existing contract.
````

#### Section 5. Test cases

Cover applicable test levels and behavior:

- unit tests;
- integration tests;
- end-to-end tests when needed;
- happy paths;
- validation and error paths;
- boundary cases;
- regression cases;
- authorization, concurrency, and transaction cases when relevant.

For every test case state:

- objective;
- setup or precondition;
- action;
- expected result;
- proposed test file.

End with verified repository commands planned for test, lint, typecheck, or other validation. Do not invent commands.

## 3. Review gate

1. Create artifact with `RequestFeedback: true` and `UserFacing: true`.
2. Stop after presenting plan.
3. Do not implement project changes before explicit user approval.
4. If feedback changes design, update plan and request approval again.
5. If implementation later reveals significant scope or design conflict, update plan and require another review before continuing affected work.

## Guardrails

- Create or update only the plan file at its resolved DDD path during this workflow. Do not create files outside `only-one/domains/` or `only-one/epics/`.
- Do not invoke OpenSpec.
- Do not create separate `proposal.md`, `spec.md`, `architecture.md`, `design.md`, `scaffold.md`, or `tasks.md` files.
- Do not modify project source during planning.
- Do not propose unverified files, symbols, contracts, or commands.
- Do not infer behavior from source that has not been read.
- Do not add unnecessary greetings or filler text.
- Maintain neutrality and objectivity in all analysis.
- Keep plan depth proportional to change risk and complexity.
- Draw UI mockups in ASCII/text within the plan for UI tasks; do not require or generate external image files.
- Do not repeat artifact contents in chat. Link plan and mention only blockers or decisions requiring user input.
- If domain is ambiguous, ask the user before writing the plan file — do not guess.
