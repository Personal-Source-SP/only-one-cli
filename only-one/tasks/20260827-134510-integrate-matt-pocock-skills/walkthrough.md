# Walkthrough: Integrate 7 Workflow-Enhancing Skills & Streamline `/only-one-idea`

## Overview
Successfully integrated **7 workflow-enhancing skills** from `mattpocock/skills` into `only-one-cli`'s manifest registry and streamlined the `/only-one-idea` workflow protocol to enforce a clean separation of concerns (**WHAT/WHY** in Idea vs. **HOW/Implementation** in Plan).

---

## Changes Made

### 1. Skill Manifest Registry
- **[assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts)**:
  - Registered 7 new skills from `mattpocock/skills` under `// --- 5. Matt Pocock Workflow-Enhancing Skills ---`:
    1. `grill-with-docs` (`skills/engineering/grill-with-docs/SKILL.md`)
    2. `domain-modeling` (`skills/engineering/domain-modeling/SKILL.md`)
    3. `wait-what` (`skills/productivity/wait-what/SKILL.md`)
    4. `to-tickets` (`skills/engineering/to-tickets/SKILL.md`)
    5. `codebase-design` (`skills/engineering/codebase-design/SKILL.md`)
    6. `diagnosing-bugs` (`skills/engineering/diagnosing-bugs/SKILL.md`)
    7. `handoff` (`skills/productivity/handoff/SKILL.md`)
  - Preserved all 15 existing Addy Osmani skills, `grill-me`, and 7 local skills.

### 2. Workflow Manifests & Required Skills
- **[assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts)**:
  - Updated `requiredSkills` for `only-one-idea`: `['grill-with-docs', 'domain-modeling', 'interview-me', 'idea-refine', 'wait-what']`.
  - Updated `requiredSkills` for `only-one-plan`: added `to-tickets` and `codebase-design`.
  - Updated `requiredSkills` for `only-one-debug`: added `diagnosing-bugs`.
  - Updated `requiredSkills` for `only-one-archive`: added `handoff`.

### 3. Workflow Streamlining (`/only-one-idea`)
- **[assets/workflows/only-one-idea.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-idea.md)** and **[.agents/workflows/only-one-idea.md](file:///Users/kiem/Sources/Personal/only-one-cli/.agents/workflows/only-one-idea.md)**:
  - Refactored into a lean 2-step protocol:
    - **Step 1 — Discovery, Grilling & Domain Modeling**: Root Need extraction, In-Scope vs Explicit Out-of-Scope, Success Metrics (DoD), Domain Glossary (`CONTEXT.md`), and `/wait-what` realignment.
    - **Step 2 — Author Lean `concept.md`**: 1-page artifact containing Problem Statement, Scope Boundaries, Success Metrics, High-Level Approach, and English Key Patterns.
  - Eliminated premature codebase tracing and redundant multi-option diagrams (now strictly owned by `/only-one-plan`).

### 4. Unit Test Suite
- **[test/core/skill-registry.test.ts](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/skill-registry.test.ts)**:
  - Added unit tests verifying the presence, paths, and remote GitHub configuration of all 8 Matt Pocock skills (7 new + `grill-me`).

---

## Verification Results

### Automated Tests
- **Vitest**: `npm test` passed 100% (50 test files, 201 tests passed).
- **Format Check**: `prettier --check` passed with zero formatting issues.
- **TypeScript Build**: `tsc -p tsconfig.json` built cleanly into `dist/`.

```bash
✓ test/core/skill-registry.test.ts (5 tests)
✓ test/commands/workflow.test.ts (4 tests)
✓ test/commands/skill/skill.test.ts (2 tests)
Test Files  50 passed | 2 skipped (52)
Tests       201 passed | 4 skipped (205)
```

---

## Next Steps
Run `/only-one-review` or `/only-one-archive only-one/tasks/20260827-134510-integrate-matt-pocock-skills` to finalize this task.
