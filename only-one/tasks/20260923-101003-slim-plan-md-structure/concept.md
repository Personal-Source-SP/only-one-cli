# Concept: Simplify `plan.md` into File-Centric Task Blocks

## 1. Problem & Goal

### Problem
- **Context & Trigger**: `/only-one-plan` currently produces standalone Current State, Technical Contracts, and Task Matrix sections before repeating file metadata in File Changes.
- **Defect**: Current State duplicates `concept.md`; Technical Contracts and Task Matrix duplicate metadata that belongs to each file change.
- **Root Cause**: `plan.md` separates planning metadata from executable diffs instead of using one canonical task block per file.
- **Impact**: Plans consume extra tokens, require cross-referencing between sections, and expose wide Markdown tables that are hard to review.

### Goal
- **Core Outcome**: Reduce `plan.md` to three sections: Directory Structure, File Changes, and Test Cases & Verification.
- **Acceptance Criteria**:
  - Remove standalone Current State, Technical Contracts & AST Seams, and Task Matrix sections.
  - Promote Directory Structure Changes to Section 1.
  - Make Section 2 a sequence of machine-readable file task blocks.
  - Keep `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command` inside every file task block.
  - Make Test Cases & Verification Section 3.
  - Require `/only-one-plan` to read `concept.md` as SSOT for current state and high-level solution when present.
  - Update `/only-one-apply` to parse ordered file task blocks instead of a Task Matrix.

## 2. Scope Boundaries
- **In-Scope**:
  - Update `/only-one-plan` source and installed workflow copies.
  - Update `/only-one-apply` source and installed workflow copies so execution follows ordered task blocks and `Depends On` fields.
  - Update workflow manifest descriptions and versions.
  - Update repository rules that mandate Task Matrix structure.
- **Explicit Out-of-Scope**:
  - No change to `/only-one-idea` or its `concept.md` template.
  - No change to source-code implementation workflows beyond plan ingestion and execution metadata.
  - No new parser, schema file, or task artifact.

## 3. Proposed Solution & Core Mechanism
- **Core Mechanism**: Treat each `### <order>. [<ACTION>] <path>` subsection in Section 2 as one machine-readable task block. Fixed metadata fields precede the Ponytail/Test checklist and unified diff: `Status`, `Context`, `Target Symbols / AST Seams`, `Invariants`, `Depends On`, and `Fast Test Command`.
- **Conceptual Flow**:
  1. `/only-one-idea` creates `concept.md` as SSOT for problem, current state, scope, and high-level solution.
  2. `/only-one-plan` reads `concept.md`, researches target files, and emits Directory Structure plus ordered file task blocks.
  3. `/only-one-apply` scans Section 2 headings and fixed metadata fields, validates dependencies, applies each unified diff, and runs each fast test.
  4. Section 3 records aggregate verification commands and manual checks.

## 4. Critical Risks & Edge Cases
- **Apply compatibility**: Removing Task Matrix without updating `/only-one-apply` would break its ingestion contract; both workflows must change atomically.
- **Machine readability**: Metadata labels and order must be mandatory and stable; free-form variants are not allowed.
- **Dependency visibility**: Ordered headings provide execution order while explicit `Depends On` fields preserve blocking edges.
- **Missing `concept.md`**: Raw-description planning may continue without one; workflow must not fabricate a concept document.
