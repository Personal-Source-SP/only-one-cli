---
id: 20260923-110527-align-debug-flash-structures
title: Align Debug and Flash with File-Centric Workflow Structure
archived_at: 2026-09-23
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
  - only-one/archives/20260921-100320-adhd-output-style-skill.md
  - only-one/archives/20260921-131136-integrate-ponytail-workflows.md
affected_modules:
  - assets/workflows/only-one-debug.md
  - assets/workflows/only-one-flash.md
  - assets/workflows/only-one-apply.md
  - assets/workflows/index.ts
  - .agents/workflows
  - only-one/rules.md
  - test/core/workflow-registry.test.ts
---

# Archive: Align Debug and Flash with File-Centric Workflow Structure

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Debug, Flash, and Apply used inconsistent file-change contracts.
- **Giá trị (Value)**: File-centric handoff stays reviewable while Debug RCA, Flash review gate, and Apply ordering remain intact.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Standardize full task blocks for Plan and Debug; retain compact Target/Change/Preserve/Fast Test blocks for Flash; synchronize canonical and installed workflows.
- **Contract**: Preserve lifecycle isolation, approval gates, dependency ordering, and evidence requirements.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/workflows/only-one-debug.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md)
- [assets/workflows/only-one-flash.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-flash.md)
- [assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md)
- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts)
- [.agents/workflows](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows)
- [test/core/workflow-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts)

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Completed task; local publish build and format checks passed.
- **PR URL / Branch**: Not recorded.
