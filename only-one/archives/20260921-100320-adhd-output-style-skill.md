---
id: 20260921-100320-adhd-output-style-skill
title: Remote ADHD-Friendly Output Skill Integration
archived_at: 2026-09-21
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
affected_modules:
  - assets/skills/index.ts
  - assets/workflows/index.ts
  - assets/workflows/only-one-idea.md
  - assets/workflows/only-one-plan.md
  - assets/workflows/only-one-apply.md
  - assets/workflows/only-one-debug.md
  - assets/workflows/only-one-flash.md
  - .agents/workflows
  - test/core/skill-registry.test.ts
  - test/core/workflow-registry.test.ts
---

# Archive: Remote ADHD-Friendly Output Skill Integration

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Workflow manifests referenced no shared output-presentation skill, causing inconsistent user-visible progress and handoff formatting.
- **Giá trị (Value)**: Core workflows fetch `i-have-adhd` from upstream GitHub while preserving safety, lifecycle gates, domain evidence, canonical artifacts, and test completeness.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Approach**: Register remote skill `ayghri/i-have-adhd` at `skills/i-have-adhd/SKILL.md`; require it in five core workflows; document precedence as safety → workflow → domain skill → output skill → generic style.
- **Contract**: Presentation skill may shape chat output but cannot omit evidence, bypass approval, alter execution order, or rewrite structured artifacts.

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/skills/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/skills/index.ts): remote GitHub skill manifest.
- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts): five `requiredSkills` entries and patch versions.
- [assets/workflows](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows): activation and compatibility contracts for five workflows.
- [test/core/skill-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/skill-registry.test.ts), [test/core/workflow-registry.test.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/test/core/workflow-registry.test.ts): registry and contract coverage.

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: Task recorded targeted registry tests, full test/build verification required by plan.
- **PR URL / Branch**: Not recorded.
