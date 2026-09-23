---
id: 20260923-114126-open-codereview-workflow
title: Tái thiết kế Open CodeReview Workflow và Selective Apply Handoff
archived_at: 2026-09-23
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
  - only-one/archives/20260921-131136-integrate-ponytail-workflows.md
  - only-one/archives/20260923-101003-slim-plan-md-structure.md
  - only-one/archives/20260923-110527-align-debug-flash-structures.md
affected_modules:
  - assets/workflows/only-one-review.md
  - assets/workflows/only-one-apply.md
  - assets/workflows/only-one-pr-git.md
  - assets/workflows/index.ts
  - .agents/workflows/only-one-review.md
  - .agents/workflows/only-one-apply.md
  - .agents/workflows/only-one-pr-git.md
  - test/core/workflow-registry.test.ts
  - README.md
  - BACKLOG.md
  - only-one/rules.md
---

# Archive: Tái thiết kế Open CodeReview Workflow và Selective Apply Handoff

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Review orchestration, finding normalization, diagnosis, and downstream apply lacked one explicit lifecycle contract.
- **Giá trị (Value)**: OCR becomes single review authority; proven findings become independently selectable, resumable, and executable without source mutation during review.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Support `branch`, `changes`, and `commit` review modes; run one OCR command; normalize findings into Vietnamese while preserving technical tokens, evidence, severity, stable IDs, and lifecycle status.
- **Apply contract**: `/only-one-apply <review.md>` selects only executable `OPEN` findings. Selected findings move through `SELECTED` → `IN_PROGRESS` → `FIXED`; failures remain resumable. Unselected findings remain `OPEN`.
- **Workflow governance**: File-centric task blocks preserve context, AST seams, invariants, dependencies, fast tests, approval gates, conflict detection, and synchronized shipped/installed templates.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/workflows/only-one-review.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-review.md): OCR review modes and executable finding blueprints.
- [assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md): review finding selection and isolated execution.
- [assets/workflows/only-one-pr-git.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-pr-git.md): PR workflow decoupled from mandatory review.
- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts): manifest versions and dependencies.
- [.agents/workflows](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows): synchronized active workflow templates.
- [test/core/workflow-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts): workflow contracts, mirror, and decoupling assertions.
- [only-one/rules.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/rules.md): lifecycle and file-centric governance rules.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Targeted workflow registry tests, full test suite, build, Prettier, and local publish completed successfully according to source task.
- **PR URL / Branch**: Not recorded.
