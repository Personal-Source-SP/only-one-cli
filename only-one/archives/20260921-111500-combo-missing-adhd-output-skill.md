---
id: 20260921-111500-combo-missing-adhd-output-skill
title: Combo Manifests Include ADHD-Friendly Output Skill
archived_at: 2026-09-21
status: active
references:
  - only-one/archives/20260921-100320-adhd-output-style-skill.md
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
affected_modules:
  - assets/combos/index.ts
  - test/core/combo.test.ts
---

# Archive: Combo Manifests Include ADHD-Friendly Output Skill

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Core combo manifests omitted `i-have-adhd` even though bundled workflows required it.
- **Giá trị (Value)**: Combo installation explicitly declares cross-cutting output dependencies and keeps manifest versions synchronized.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Add `i-have-adhd` to `frontend-flow`, `backend-flow`, and `full-sdlc-flow`; preserve existing skill order and bump each combo patch version.
- **Contract**: Combo declarations must include cross-cutting skills required by bundled workflows.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/combos/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts): three combo skill arrays and versions.
- [test/core/combo.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/combo.test.ts): regression coverage.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Task records `npm test -- test/core/combo.test.ts` as PASS; version-gate/build checks were listed pending in source task.
- **PR URL / Branch**: Not recorded.
