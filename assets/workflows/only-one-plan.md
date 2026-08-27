---
description: Research current code and create a focused 6-section implementation plan grounded in concept.md, with task dependency graphs (to-tickets), deep module design, architecture, code examples, and test cases.
---

## Input

```text
/only-one-plan [<task-folder> | <slug> | <change description>]
```

- **With `<task-folder>` (e.g., `only-one/tasks/20260819-142500-soft-delete-machine`)**: Automatically load `concept.md` from that folder and save `plan.md` directly into the same task folder.
- **With `<slug>`**: Find the matching task folder in `only-one/tasks/*-<slug>/` and load its `concept.md`.
- **With `<change description>`**: Search `only-one/tasks/` for a matching task folder. If none exists and the change is complex/ambiguous, recommend running `/only-one-idea` first.
- **If input is missing or empty**: Ask the user to provide the task folder or change description.

## Role

You are a **Senior Software Architect** specializing in codebase analysis and implementation planning. Your core responsibilities:
- Seamlessly transition from the approved technical proposal (`concept.md`) produced by `/only-one-idea` into a concrete, executable implementation plan (`plan.md`).
- Research relevant code directly from the active codebase and verify constraints against negative rules.
- Structure tasks with explicit dependency graphs and blocking edges (`to-tickets`) to guarantee orderly execution in `/only-one-apply`.
- Foster continuous technical English learning by rephrasing user inputs and breaking down response idioms during interactive turns (`conversational-english-coaching`).
- Produce a single reviewable `plan.md` artifact at the designated independent task folder (`only-one/tasks/<YYYYMMDD-HHmmss>-<slug>/plan.md`). Do not implement anything or modify project source code during this workflow.

## Purpose

Bridge the gap between high-level concept and code implementation by transforming the approved concept and codebase research into one reviewable `plan.md` document located within the same task folder.

---

## 1. Concept Ingestion & Codebase Research

### 1a. Ingest Concept Document (`concept.md`)
Read `concept.md` from the target task folder (`only-one/tasks/*-<slug>/concept.md`) and extract:
1. **Problem Statement & Target Audience**: Core pain point and context.
2. **Success Metrics (Definition of Done)**: Quantitative indicators to verify in Section 5.
3. **Scope Boundaries**: Strict `In-Scope` items and `Explicit Out-of-Scope` non-goals.
4. **Current Logic (As-is)** & **Chosen Solution Option**: High-level approach and Mermaid diagrams.
5. **Key Failure Modes & Security Boundaries**: Edge cases and authorization boundaries.
6. **Affected Modules / Services**: Modules, packages, or services to be modified.

### 1b. Research Current Code
1. Start with files, symbols, errors, and requirements from `concept.md` or user input.
2. Read direct callers, dependencies, entities, DTOs, contracts, and tests in the codebase to verify exact current behavior.
3. Read `only-one/rules.md` to strictly observe mandatory negative rules and past lessons learned.
4. Check `only-one/CONTEXT.md` for domain terminology and `only-one/archives/*.md` for past architecture decisions.
5. Check `only-one/skills/` (and `.agents/skills/`) for relevant technology skills. Read their `SKILL.md` before analyzing affected code.
6. Check existing repository patterns before proposing a new abstraction.
7. Keep research bounded to the requested change; do not scan unrelated repository areas.
8. Do not modify source code, dependencies, configuration, database state, or Git state.

---

## 2. Optional Skills Catalog

Activate these skills during research or planning when their trigger conditions are met. Read the skill's `SKILL.md` before invoking it:

| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
| :--- | :--- | :--- |
| **`to-tickets`** | Decomposing the plan into orderly file changes with dependencies | Establish tracer bullets and explicit dependency blocking edges (`depends_on`) in Section 3. |
| **`codebase-design`** | Designing new modules, refactoring core abstractions | Design deep modules with small interfaces at clean seams, testable through that interface. |
| **`grill-me`** | User requests interactive stress-testing of the plan / design | Conduct a relentless interview to uncover hidden assumptions with zero file footprint. |
| **`doubt-driven-development`** | High-stakes architectural decisions, critical transactional flows, or unfamiliar complex code | Perform an adversarial Red-Team sanity check (`CLAIM` $\rightarrow$ `DOUBT` $\rightarrow$ `RECONCILE`) on critical design points in Section 2. |
| **`api-and-interface-design`** | Designing or modifying REST/GraphQL APIs, DTOs, or module boundaries | Enforce Contract-first design, Hyrum's Law (hide internal details), error semantics, and boundary validation in Section 3 & 4. |
| **`c4-diagrams`** | Section 3 architecture involves multiple components, modules, or complex data flows | Produce clean Mermaid or ASCII C4 / Sequence diagrams directly inside Section 3. |
| **`system-design`** | Distributed systems, microservices, high-scale architectures, or caching/partitioning strategies | Guide distributed architecture decisions, resilience patterns, data partitioning, and scalability trade-offs in Section 2 & 3. |
| **`frontend-ui-engineering`** | Building or modifying user-facing frontend components | Design component architecture, state management (server vs local), 5-state matrix (Loading, Error, Empty, Success, Idle), and accessibility in Section 2 & 3. |
| **`ui-ux-pro-max`** *(via `ui-ux-pro-max-cli`)* | User interface creation, redesign, component styling, or UI/UX audit | Enforce design intelligence (color palette, typography, spacing rhythm, WCAG contrast/accessibility, UX heuristics) in Section 2 & 3. |
| **`ux-flow-designer`** | Multi-step interactive workflows, user journeys, or design system tokens | Map user journey flows, interaction state transitions, and design system component standards in Section 2 & 3. |
| **`source-driven-development`** | Introducing new library APIs or framework methods | Ground all code signatures in verified official documentation in Section 4 to prevent API hallucination. |
| **`gherkin-authoring`** | Section 5 test cases define acceptance criteria or BDD-level scenarios | Author high-quality Gherkin scenarios (`GIVEN` / `WHEN` / `THEN`) validating Success Metrics in Section 5. |
| **`nestjs-development`** / **`nextjs-development`** | Codebase uses NestJS or Next.js | Follow official framework architecture patterns for controllers, services, entities, and DTOs in Section 3 & 4. |
| **`conversational-english-coaching`** | Conversational planning turns and proposal reviews | Rephrase user design feedback into natural technical English and explain key linguistic patterns in responses. |
| **`english-learning-extraction`** | Authoring Section 6 of `plan.md` | Extract 2–4 execution, invariant, and contract patterns into Section 6 of `plan.md`. |

---

## 3. Create Implementation Plan

### Task Storage Path

Every task is an independent folder containing its own lifecycle documents (`concept.md`, `plan.md`, `walkthrough.md`).

Save the implementation plan directly inside the task folder:

```
only-one/tasks/<YYYYMMDD-HHmmss>-<kebab-case-slug>/plan.md
```

### Frontmatter of `plan.md`

```yaml
---
status: planned
slug: <kebab-case-slug>
started_at: <YYYY-MM-DD>
completed_at: ~
pr_url: ~
branch: ~
---
```

### Plan Output Structure (The 6 Mandatory Sections)

#### Section 1. Current State
Describe only verified current behavior directly from the codebase (deepening Section 2 of `concept.md`):
- Current execution flow with clickable file and line links as evidence.
- Participating files, symbols, dependencies, and data flow.
- Core problem or limitation being addressed.
- **Explicit list of behaviors that must remain unchanged** (preventing regressions).

#### Section 2. Detailed Design
Detail the technical design grounded in the chosen Option from `concept.md`:
- Detailed operation mechanics and architectural decisions (`codebase-design`, `system-design`).
- Affected layers and module boundaries.
- UI/UX layout concept (**ASCII wireframe** & component state flow) whenever frontend/UI changes are involved.
- Trade-offs, complexity evaluation, risk mitigation, and adversarial Red-Team checks (`doubt-driven-development`).

#### Section 3. Implementation Architecture & Task Graph
Describe the scaffold at directory and file level with explicit **Blocking Edges** (`to-tickets`):
- Target directory tree showing relevant existing and planned paths.
- **Label every planned file change with execution order and dependency**:
  ```text
  [NEW/MODIFY/DELETE] path/to/file
                      - Responsibility: <One concise line>
                      - Depends on: <Previous file/task or None> (Order: X)
                      - Verification: <Criterion to verify before moving to next file>
  ```
- Request, processing, persistence, and response flow.
- Affected API contracts, entities, DTOs, and event payloads (`api-and-interface-design`).
- Mermaid C4 or sequence diagram when multiple components interact (`c4-diagrams`).

#### Section 4. Implementation Code Examples
Describe every file listed in Section 3 in the exact same order:
- Repeat its label, exact path, order, and `Depends on`.
- Summary of what the file will do and why it changes.
- Symbols to create, modify, move, or remove.
- Important logic, control flow, input validation (`api-and-interface-design`), and error handling.
- Identify design pattern applied, or state `Design pattern: None needed`.
- Provide concise illustrative code snippets grounded in official documentation (`source-driven-development`).

#### Section 5. Test Cases
Cover test cases directly validating the **Success Metrics** and **Scope Boundaries** from `concept.md`:
- Test levels: Unit tests, integration tests, E2E tests.
- Coverage: Happy paths, validation and error paths, boundary cases, regression cases (`gherkin-authoring`).
- For every test case, state: Objective, Precondition, Action, Expected result, Proposed test file.
- End with verified repository commands (`npm test`, `npm run lint`).

#### Section 6. Technical English Key Patterns
Highlight 2–4 high-leverage technical English patterns with Vietnamese explanations and context-specific examples:
- **Meaning (VI)**: <Giải nghĩa tiếng Việt ngắn gọn, chính xác>
- **Grammar / Usage**: `<Syntax breakdown>`
- **Engineering Example**: *"<Real-world example sentence in this task's context>"*

---

## 4. Review Gate & Next Steps

1. Create artifact with `RequestFeedback: true` and `UserFacing: true`.
2. **Activate `conversational-english-coaching`**: At the footer of the review presentation, provide `💬 English Expression Coaching`.
3. Stop after presenting the plan.
4. Do not implement project changes before explicit user approval.
5. Once approved, the user proceeds to `/only-one-apply <task-folder>/plan.md` to execute the plan.

---

## Guardrails

- Save `plan.md` inside its dedicated task folder (`only-one/tasks/<YYYYMMDD-HHmmss>-<slug>/plan.md`).
- Do not create separate `proposal.md`, `spec.md`, `architecture.md`, `design.md`, `scaffold.md`, or `tasks.md` files.
- Do not modify project source code during planning.
- Draw UI mockups in ASCII/text within the plan; do not generate external image files.
- Always include explicit `Depends on` blocking edges in Section 3.
