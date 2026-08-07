---
description: Research current code and create a focused implementation plan with design options, architecture, code examples, and test cases.
---

## Input

```text
/only-one-ag-plan <change description>
```

If input does not identify the goal, ask a focused question before research.

## Purpose

Research relevant current code, then create one reviewable `implementation_plan.md`. Do not invoke OpenSpec, create separate planning documents, or modify project source.

## 1. Research current code

1. Start with files, symbols, selected code, errors, and acceptance criteria provided by the user.
2. Read direct callers, dependencies, entities, DTOs, contracts, and tests needed to understand current behavior.
3. Load and follow mandatory technology skills before analyzing affected code, such as the NestJS skill for NestJS changes or the Next.js skill for Next.js changes.
4. Check existing repository patterns before proposing a new abstraction.
5. Keep research bounded to the requested change. Do not scan unrelated repository areas.
6. Do not modify source, dependencies, configuration, database state, or Git state.
7. Preserve unrelated working-tree changes.

## 2. Create implementation plan

Create or update `implementation_plan.md` as a user-facing artifact with feedback requested. Use the user's language while preserving code identifiers, paths, commands, and error strings.

Plan MUST contain these five main sections in this order.

### 1. Current state

Describe only verified current behavior:

- current execution flow;
- participating files and symbols;
- current dependencies and data flow;
- problem or limitation being addressed;
- behavior that must remain unchanged;
- clickable file and line links as evidence.

Do not infer behavior from unread source.

### 2. Design

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

### 3. Implementation architecture

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

### 4. Implementation code examples

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

### 5. Test cases

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

- Create or update only `implementation_plan.md` during this workflow.
- Do not invoke OpenSpec.
- Do not create separate `proposal.md`, `spec.md`, `architecture.md`, `design.md`, `scaffold.md`, or `tasks.md` files.
- Do not modify project source during planning.
- Do not propose unverified files, symbols, contracts, or commands.
- Keep plan depth proportional to change risk and complexity.
- Draw UI mockups in ASCII/text within the plan for UI tasks; do not require or generate external image files.
- Do not repeat artifact contents in chat. Link plan and mention only blockers or decisions requiring user input.
