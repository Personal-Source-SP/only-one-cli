---
status: done
slug: refine-workflows-and-manifest-alignment
started_at: 2026-08-27
completed_at: 2026-08-27
pr_url: ~
branch: ~
---

# Plan: Refine Workflows & Manifest Alignment

## Section 1. Current State

Currently, the workflow definitions in [`assets/workflows/`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows) and manifest files in [`assets/workflows/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts) and [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts) have discrepancies:
- `conversational-english-coaching` and `english-learning-extraction` are referenced across `only-one-idea.md`, `only-one-plan.md`, and `only-one-archive.md` but are missing from `SKILLS` and `requiredSkills`.
- `task-lifecycle-resolution` is referenced in `only-one-clean.md` but missing from `SKILLS`.
- `prototype` and `wizard` are listed in `requiredSkills` of `only-one-apply` in `index.ts` but never mentioned in `only-one-apply.md`.
- `only-one-idea.md` template jumps from Section 4 to Section 7.
- Task Matrix in `only-one-plan.md` and `only-one-apply.md` lacks a `Status` column for resuming interrupted tasks.
- `only-one-pr-git.md` restricts `--tag` to only 4 tags (`feat`, `fix`, `refactor`, `style`), omitting `chore`, `docs`, `test`, `perf`, `ci`, `build`.

### Invariants to Preserve:
- All 12 workflow filenames and slash commands must remain exactly as named.
- Frontmatter format must adhere to `--- \n description: ... \n ---` for test suite compatibility.
- Vitest test suites (`workflow-registry.test.ts`, `agent-workflows.test.ts`, `skill-registry.test.ts`) must pass 100%.

---

## Section 2. Detailed Design

1. **Manifest Alignment**:
   - Register the 3 local/shared skills (`conversational-english-coaching`, `english-learning-extraction`, `task-lifecycle-resolution`) into `assets/skills/index.ts` as `sourceType: 'local'`.
   - Update `requiredSkills` in `assets/workflows/index.ts` to include these active skills and remove unused skills (`prototype`, `wizard`).
2. **Schema & Template Standardization**:
   - In `only-one-idea.md`, renumber Section 7 to Section 5 in the output template.
   - In `only-one-plan.md` & `only-one-apply.md`, introduce `Status` (`[ ]` / `[/]` / `[x]`) into the Machine-Readable Task Matrix.
   - In `only-one-pr-git.md` and `src/core/templates/agent-workflows.ts`, expand supported tags to include standard Conventional Commit types.
   - In `only-one-conflict.md`, soften hardcoded commit messages to preserve merge intent.
   - In `only-one-review.md`, add working tree status audit.
3. **Synchronization**:
   - Synchronize all updated markdown assets from `assets/workflows/` to `.agents/workflows/`.

---

## Section 3. Implementation Architecture & Machine-Readable Task Matrix

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` | `None` | `npx vitest run test/core/skill-registry.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS` | `Order 1` | `npx vitest run test/core/workflow-registry.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `src/core/templates/agent-workflows.ts` | `PrGitTag`, `SUPPORTED_PR_GIT_TAGS` | `None` | `npx vitest run test/core/agent-workflows.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `test/core/agent-workflows.test.ts` | `agent workflow command sources` | `Order 3` | `npx vitest run test/core/agent-workflows.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-idea.md` | Template & Paths | `None` | `npx vitest run test/core/workflow-registry.test.ts` |
| **6** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | Task Matrix & Snippet Guide | `None` | `npx vitest run test/core/workflow-registry.test.ts` |
| **7** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | Execution Step 4 & Matrix | `Order 6` | `npx vitest run test/core/workflow-registry.test.ts` |
| **8** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-pr-git.md` | Supported Tags | `Order 3` | `npx vitest run test/core/agent-workflows.test.ts` |
| **9** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-review.md` | Git Status Audit | `None` | `npx vitest run test/core/workflow-registry.test.ts` |
| **10** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-conflict.md` | Merge commit completion | `None` | `npx vitest run test/core/workflow-registry.test.ts` |
| **11** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-archive.md` | Verification before purge | `None` | `npx vitest run test/core/workflow-registry.test.ts` |
| **12** | `[x]` | `[SYNC]` | `.agents/workflows/` | Mirror assets | `Order 5-11` | `npm test` |

---

## Section 4. Implementation Code Examples

### File 1: `assets/skills/index.ts`
- **Action**: `[MODIFY]` | **Order**: 1 | **Depends On**: `None`
- **Seam**: Append local skills to `SKILLS` list:
```typescript
// [TARGET SEAM] Local Project Specific Skills
{
    name: 'conversational-english-coaching',
    description: 'Rephrase user thoughts into natural, professional technical English during interactive turns.',
    sourceType: 'local',
},
{
    name: 'english-learning-extraction',
    description: 'Extract technical English patterns, grammar structures, and real-world examples into learn topics.',
    sourceType: 'local',
},
{
    name: 'task-lifecycle-resolution',
    description: 'Resolve and auto-archive completed tasks before running clean and maintenance workflows.',
    sourceType: 'local',
},
```

### File 2: `assets/workflows/index.ts`
- **Action**: `[MODIFY]` | **Order**: 2 | **Depends On**: Order 1
- **Seam**: Update `requiredSkills` in `WORKFLOWS` array to cleanly map active skills without dead references.

### File 3: `src/core/templates/agent-workflows.ts`
- **Action**: `[MODIFY]` | **Order**: 3 | **Depends On**: `None`
- **Seam**: Expand `PrGitTag` enum and `SUPPORTED_PR_GIT_TAGS`:
```typescript
// [TARGET SEAM]
export enum PrGitTag {
    Feat = 'feat',
    Fix = 'fix',
    Refactor = 'refactor',
    Style = 'style',
    Chore = 'chore',
    Docs = 'docs',
    Test = 'test',
    Perf = 'perf',
    Ci = 'ci',
    Build = 'build',
}
```

---

## Section 5. Test Cases

1. **Workflow Registry Integrity Test**:
   - `npx vitest run test/core/workflow-registry.test.ts`
   - *Expected*: All 12 workflows exist, have descriptions, valid frontmatter, and non-empty content.
2. **Skill Registry Integrity Test**:
   - `npx vitest run test/core/skill-registry.test.ts`
   - *Expected*: All registered skills are unique and have valid types.
3. **Agent Workflow Templates & Tag Validation**:
   - `npx vitest run test/core/agent-workflows.test.ts`
   - *Expected*: PR Git option contract matches all supported conventional commit tags.
4. **Full Test Suite**:
   - `npm test`
   - *Expected*: 100% pass across all test suites.

---

## Section 6. Technical English Key Patterns

### 1. Reconcile against `<source>`
- **Meaning (VI)**: Đối chiếu, chỉnh sửa cho khớp với một nguồn chuẩn.
- **Grammar / Usage**: `reconcile A against B` / `reconcile discrepancies between A and B`
- **Engineering Example**: *"We must reconcile workflow manifest definitions against the skill registry to prevent dangling references."*

### 2. Lossless Resumption
- **Meaning (VI)**: Khả năng tiếp tục công việc bị gián đoạn mà không làm mất mát ngữ cảnh hay trạng thái.
- **Grammar / Usage**: `ensure / support lossless resumption of <process>`
- **Engineering Example**: *"Introducing explicit status checkpoints into the Task Matrix enables lossless resumption across distinct agent sessions."*
