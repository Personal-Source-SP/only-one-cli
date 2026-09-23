---
id: 20260923-094300-no-sleep-execution-rule
title: No-Sleep / No Busy-Wait Execution Rule
archived_at: 2026-09-23
status: active
references: []
affected_modules:
  - assets/rules/03-execution-terminal.md
  - assets/rules/index.ts
  - test/core/rule-registry.test.ts
---

# Archive: No-Sleep / No Busy-Wait Execution Rule

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Agent execution could use repeated `sleep` polling and uncontrolled busy-wait loops.
- **Giá trị (Value)**: Waiting uses bounded, observable, resource-safe execution patterns.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Register terminal execution rule in `assets/rules/index.ts`; prohibit sleep spam and define bounded alternatives.
- **Contract**: Rule applies to supported agent targets and keeps manifest versioning requirements.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/rules/03-execution-terminal.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/rules/03-execution-terminal.md)
- [assets/rules/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/rules/index.ts)

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Completed task; local publish build and format checks passed.
- **PR URL / Branch**: Not recorded.
