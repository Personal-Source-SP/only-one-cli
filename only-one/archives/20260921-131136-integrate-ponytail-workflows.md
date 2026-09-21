---
id: 20260921-131136-integrate-ponytail-workflows
title: Ponytail Policy Integration into Core Lifecycle Workflows
archived_at: 2026-09-21
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
  - only-one/archives/20260921-100320-adhd-output-style-skill.md
affected_modules:
  - assets/skills/index.ts
  - assets/workflows/index.ts
  - assets/workflows/only-one-idea.md
  - assets/workflows/only-one-plan.md
  - assets/workflows/only-one-debug.md
  - assets/workflows/only-one-apply.md
  - assets/workflows/only-one-flash.md
  - .agents/workflows
  - test/core/skill-registry.test.ts
  - test/core/workflow-registry.test.ts
---

# Archive: Ponytail Policy Integration into Core Lifecycle Workflows

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Core workflows lacked one shared, ordered minimality decision ladder and deterministic conflict handling for approved plans.
- **Giá trị (Value)**: Workflows prefer reuse and smallest sufficient diffs without weakening safety, acceptance criteria, evidence, lifecycle boundaries, or approval gates.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Register remote `DietrichGebert/ponytail` from `skills/ponytail/SKILL.md`; add it to five workflows; apply necessity → reuse → stdlib → platform/framework → dependency → smaller edit → minimum new code.
- **Apply contract**: Detect material conflict before status mutation or source edit; emit conflict details and require plan revision plus re-approval.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/skills/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts): upstream skill manifest.
- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts): dependency and version updates.
- [assets/workflows](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows), [.agents/workflows](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows): synchronized stage-specific policy contracts.
- [test/core/skill-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/skill-registry.test.ts), [test/core/workflow-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts): manifest and policy assertions.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Source task records targeted tests, full suite, build, Prettier, and workflow mirror checks as PASS.
- **PR URL / Branch**: Not recorded.
