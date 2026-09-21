---
status: done
slug: adhd-output-style-skill
started_at: 2026-09-21
completed_at: 2026-09-21
pr_url: ~
branch: ~
---

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- `assets/skills/index.ts` đã hỗ trợ remote skills. `installSkills()` fetch `https://raw.githubusercontent.com/<source>/main/<skillPath>` tại thời điểm cài và ghi content hash vào lockfile.
- `assets/workflows/index.ts.requiredSkills` được `step-5-execute-and-report.ts` và `service-planners.ts` dùng để tự động cài dependencies. Cơ chế này chỉ bảo đảm file hiện diện; không bảo đảm agent đọc skill khi workflow chạy.
- `requiredSkills` đi qua workflow installer và `installSkills()`, vì vậy remote skill được tải trực tiếp từ GitHub cho từng agent target. `checkSkillFreshness()` so sánh hash local với `main` để phát hiện upstream update.

### Invariants bắt buộc giữ nguyên

- Giữ toàn bộ skills hiện tại. Domain skills quyết định technical correctness; workflow quyết định lifecycle/order; `i-have-adhd` chỉ quyết định user-visible presentation.
- Năm workflow phải giữ `## 1. Skills Catalog`; `i-have-adhd` là mandatory, các domain skills giữ trigger hiện tại.
- Workflow asset và manifest registry phải đồng bộ; không có dangling `requiredSkills` reference.
- Security/destructive confirmation và workflow contracts ưu tiên hơn output compression.
- Install luôn lấy branch `main` mới nhất từ upstream; cần network, và nội dung có thể drift ngoài release cycle của `only-one`.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts

- Không phát sinh TypeScript type mới. Dùng nguyên `SkillManifest` và `WorkflowManifest.requiredSkills`.
- Remote skill contract:
  - manifest `sourceType: 'github'`;
  - `source: 'ayghri/i-have-adhd'`;
  - `skillPath: 'skills/i-have-adhd/SKILL.md'`;
  - không tạo directory `assets/skills/i-have-adhd`;
  - mỗi install fetch branch `main` mặc định và ghi SHA-256 vào remote skill lock metadata.
- Workflow activation contract:
  - thêm `i-have-adhd` vào `requiredSkills`;
  - thêm mandatory row vào Skills Catalog;
  - thêm shared `Mandatory Output Skill` và `Output Skill Compatibility Contract` trước execution protocol;
  - precedence cố định: safety → workflow → domain skill → `i-have-adhd` → generic style;
  - chat presentation chịu skill; domain evidence và canonical artifacts được exempt rõ ràng.
- Conflict contracts:
  - interview/grilling giữ full question tree nhưng serialize một câu hỏi mỗi turn;
  - source/doubt completeness không chịu prose list cap;
  - Red–Green–Refactor evidence không bị coi là recap;
  - debug three-failure stop chỉ kích hoạt sau ba failed patch attempts không sinh evidence mới.

### AST Seams & Callers

- `SKILLS` array: thêm GitHub manifest trong nhóm productivity/cross-cutting.
- `WORKFLOWS`: sửa entries `only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-debug`, `only-one-flash`; bump patch version và prepend dependency.
- Workflow Markdown seams:
  - sau `Purpose` hoặc `Role & Collaboration Model`: activation block;
  - đầu Skills Catalog: mandatory row;
  - cuối workflow/Guardrails: lifecycle-specific presentation impact và precedence.
- `skill-registry.test.ts`: assert remote registration, repository và skill path; bảo đảm không có vendored directory trùng tên.
- `workflow-registry.test.ts`: assert đúng năm workflows require skill, chứa shared compatibility/precedence contract, và giữ workflow-specific domain invariants.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
assets/
├── skills/
│   └── [MODIFY] index.ts
└── workflows/
    ├── [MODIFY] index.ts
    ├── [MODIFY] only-one-idea.md
    ├── [MODIFY] only-one-plan.md
    ├── [MODIFY] only-one-apply.md
    ├── [MODIFY] only-one-flash.md
    └── [MODIFY] only-one-debug.md
test/core/
├── [MODIFY] skill-registry.test.ts
└── [MODIFY] workflow-registry.test.ts
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/skills/index.ts` | `SKILLS` GitHub manifest | None | `npm test -- test/core/skill-registry.test.ts` — PASS (5 tests) |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | five `WORKFLOWS` entries | Order 1 | `npm test -- test/core/workflow-registry.test.ts` — PASS (3 tests) |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-idea.md` | activation block; Skills Catalog; Discovery output contract | Order 2 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |
| **4** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | activation block; mandatory/optional catalog; plan output contract | Order 2 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |
| **5** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | activation block; Skills Catalog; task feedback contract | Order 2 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |
| **6** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-flash.md` | activation block; Skills Catalog; review-gate contract | Order 2 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |
| **7** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-debug.md` | activation block; Skills Catalog; RCA output contract | Order 2 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |
| **8** | `[x]` | `[MODIFY]` | `test/core/skill-registry.test.ts` | remote manifest integrity case | Order 1 | `npm test -- test/core/skill-registry.test.ts` — PASS (6 tests) |
| **9** | `[x]` | `[MODIFY]` | `test/core/workflow-registry.test.ts` | dependency, compatibility, precedence, and domain-invariant cases | Orders 2–7 | `npm test -- test/core/workflow-registry.test.ts` — PASS (5 tests) |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/skills/index.ts`
> **Action**: Register upstream skill as a GitHub source fetched from latest `main` at install time.

```diff
 export const SKILLS: SkillManifest[] = [
+    // --- 0. Cross-Cutting Output Discipline ---
+    {
+        name: 'i-have-adhd',
+        version: '0.0.1',
+        description: 'Shape agent output into action-first, bounded, progress-visible responses for readers with ADHD.',
+        source: 'ayghri/i-have-adhd',
+        sourceType: 'github',
+        skillPath: 'skills/i-have-adhd/SKILL.md',
+    },
+
     // --- 1. Define Phase: Discovery, Grilling & Domain Modeling ---
```

### 3. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Fetch latest upstream skill transitively when each targeted workflow is installed, and bump workflow asset versions.

```diff
     {
         name: 'only-one-idea',
-        version: '0.0.4',
+        version: '0.0.5',
@@
         requiredSkills: [
+            'i-have-adhd',
             'grill-with-docs',
@@
     {
         name: 'only-one-plan',
-        version: '0.0.5',
+        version: '0.0.6',
@@
         requiredSkills: [
+            'i-have-adhd',
             'to-tickets',
@@
     {
         name: 'only-one-apply',
-        version: '0.0.5',
+        version: '0.0.6',
@@
         requiredSkills: [
+            'i-have-adhd',
             'context-engineering',
@@
     {
         name: 'only-one-debug',
-        version: '0.0.4',
+        version: '0.0.5',
@@
         requiredSkills: [
+            'i-have-adhd',
             'diagnosing-bugs',
@@
     {
         name: 'only-one-flash',
-        version: '0.0.3',
+        version: '0.0.4',
@@
         requiredSkills: [
+            'i-have-adhd',
             'context-engineering',
```

### 4. `[MODIFY]` `assets/workflows/only-one-idea.md`
> **Action**: Activate output skill before Discovery and bind it to one-question turns and terminal handoff.

```diff
 - Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
+- Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
+
+## Output Skill Compatibility Contract
+
+`i-have-adhd` is a presentation adapter, not an execution policy.
+
+Priority:
+1. Preserve safety rules and destructive-action confirmations.
+2. Preserve workflow lifecycle, gates, artifacts, and execution order.
+3. Preserve domain-skill completeness, evidence, sources, and tests.
+4. Apply ADHD-friendly formatting to user-visible chat.
+
+Never omit required findings, evidence, tasks, tests, or diffs; bypass approval; stop evidence-generating research; or invent a user action when the agent can proceed autonomously. Structured tables, Task Matrix rows, sources, code blocks, and diffs are exempt from prose list limits.
@@
 ## 1. Skills Catalog (Define — Clarify what & how to build)
@@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`i-have-adhd`** | **Mandatory: every user-visible turn** | Lead with one focused question/action, show `Discovery → Options → Decision → Concept complete` progress, suppress tangents, and end with one next action. |
@@
 ## Guardrails
+
+- **ADHD Output Impact**: Apply the skill to input clarification, Discovery turns, option selection, progress reporting, errors, and terminal handoff. Do not alter `concept.md` schema or Phase 1 exit gate.
+- **Terminal Action**: Final chat response contains the `concept.md` path and exactly one next command: `/only-one-plan <task-folder>`.
```

### 5. `[MODIFY]` `assets/workflows/only-one-plan.md`
> **Action**: Make output skill mandatory while preserving optional domain-skill triggers and canonical plan structure.

```diff
 ## Purpose
@@
 Bridge the gap between high-level concept and code implementation...
+
+## Mandatory Output Skill
+
+Before the first user-visible response, read and activate `i-have-adhd`, then apply the shared Output Skill Compatibility Contract. Use progress vocabulary `Research → Contracts → Task Matrix → Diff Blueprint → Review ready`. Preserve all five canonical `plan.md` sections, source evidence, tables, and diffs.
@@
-## 2. Optional Skills Catalog
+## 2. Skills Catalog
+
+### Mandatory
+
+| Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
+| :--- | :--- | :--- |
+| **`i-have-adhd`** | **Every user-visible turn** | Lead with review action/finding, expose progress, suppress tool narration, and end with one review/apply action. |
+
+### Optional
@@
 ## Guardrails
+
+- **ADHD Output Impact**: Apply the skill to research status, open decisions, review requests, errors, and handoff. Do not compress or reorder canonical plan sections.
+- **Structured Content Exemption**: Task Matrix, Unified Diffs, code blocks, and required verification lists are exempt from prose list limits.
```

### 6. `[MODIFY]` `assets/workflows/only-one-apply.md`
> **Action**: Expose task progress and test wins without changing dependency order or status mutation.

```diff
 ## Purpose
@@
 Execute an approved plan or debug document...
+
+## Mandatory Output Skill
+
+Before the first user-visible response, read and activate `i-have-adhd`, then apply the shared Output Skill Compatibility Contract. Use `Task X/Y`, current file, and fast-test result as progress state; preserve domain-skill execution and test evidence.
@@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`i-have-adhd`** | **Mandatory: every user-visible turn** | Show current task, visible PASS/FAIL results, matter-of-fact errors, and one next action without changing Task Matrix execution. |
@@
 ## Guardrails
+
+- **ADHD Output Impact**: After each verified slice surfaced to the user, report file + PASS/FAIL + completed/remaining count. Format failures as `Location / Cause / Fix`.
+- **No Execution Drift**: Output discipline must not alter `Depends On`, `[ ]`/`[/]`/`[x]` transitions, Fast Test Commands, or final verification.
```

### 7. `[MODIFY]` `assets/workflows/only-one-flash.md`
> **Action**: Apply action-first formatting to Flash Plan and make confirmation one bounded decision.

```diff
 ## Purpose
@@
 Provide a rapid fast-track lane...
+
+## Mandatory Output Skill
+
+Before emitting the Flash Plan, read and activate `i-have-adhd`, then apply the shared Output Skill Compatibility Contract. Use progress vocabulary `Research → Review Gate → Apply → Verify`. Preserve Zero Disk Plan Footprint and mandatory pause.
@@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`i-have-adhd`** | **Mandatory: every user-visible turn** | Keep Flash Plan action-first, make review confirmation one decision, and make verification wins visible. |
@@
 ### Step 2 — Emit In-Chat Plan & Review Gate
@@
-1. Emit a clean, focused Markdown plan directly in the chat output:
+1. Emit the Flash Plan without preamble. Put the primary action/outcome first:
@@
 ### Step 4 — Fast Verification & Walkthrough
@@
-3. Provide a brief completion summary in chat (1–3 sentences)...
+3. Provide 1–3 sentences: what now works first, verification result second, one remaining action only when necessary.
```

### 8. `[MODIFY]` `assets/workflows/only-one-debug.md`
> **Action**: Shape diagnostic narrative around evidence, phase state, and actionable errors.

```diff
 ## Purpose
@@
 Systematically isolate, diagnose, instrument...
+
+## Mandatory Output Skill
+
+Before the first user-visible response, read and activate `i-have-adhd`, then apply the shared Output Skill Compatibility Contract. Use progress vocabulary `Reproduce → Minimize → Hypothesize → Blueprint → Review ready`. Preserve evidence and RCA completeness; stop after three failures only when three patch attempts produce no new evidence.
@@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`i-have-adhd`** | **Mandatory: every user-visible turn** | Lead with reproduction/missing evidence, show phase, format errors as `Location / Cause / Fix`, and end with one apply handoff. |
@@
 ## Guardrails
+
+- **ADHD Output Impact**: Apply the skill to symptom intake, investigation status, hypothesis communication, errors, and terminal handoff. Evidence must precede hypothesis.
+- **No Diagnostic Compression**: Never omit reproduction evidence, violated invariants, regression tests, Task Matrix rows, or Unified Diffs to satisfy brevity/list limits.
```

### 8. `[MODIFY]` `test/core/skill-registry.test.ts`
> **Action**: Lock remote GitHub manifest and prevent a stale vendored copy from becoming a second authority.

```diff
 describe('skill registry integrity', () => {
@@
+    it('registers i-have-adhd from latest GitHub main without a local copy', () => {
+        const skill = SKILLS.find(({ name }) => name === 'i-have-adhd');
+
+        expect(skill).toMatchObject({
+            version: '0.0.1',
+            source: 'ayghri/i-have-adhd',
+            sourceType: 'github',
+            skillPath: 'skills/i-have-adhd/SKILL.md',
+        });
+        expect(existsSync(join(skillsDir, 'i-have-adhd'))).toBe(false);
+    });
```

### 9. `[MODIFY]` `test/core/workflow-registry.test.ts`
> **Action**: Prove dependency and runtime activation remain synchronized for exactly five workflows.

```diff
 describe('workflow registry integrity', () => {
@@
+    it('requires and activates i-have-adhd in the five core workflows', () => {
+        const expected = ['only-one-idea', 'only-one-plan', 'only-one-apply', 'only-one-flash', 'only-one-debug'];
+
+        for (const name of expected) {
+            const workflow = WORKFLOWS.find((item) => item.name === name);
+            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');
+
+            expect(workflow?.requiredSkills).toContain('i-have-adhd');
+            expect(content).toContain('i-have-adhd');
+            expect(content).toContain('presentation adapter, not an execution policy');
+            expect(content).toContain('Preserve domain-skill completeness');
+            expect(content).toMatch(/Mandatory Output Skill|Mandatory: every user-visible turn/);
+        }
+    });
+
+    it('preserves workflow-specific domain invariants over output formatting', () => {
+        const contracts = {
+            'only-one-idea': ['one question', 'discovery'],
+            'only-one-plan': ['Task Matrix', 'Unified Diff'],
+            'only-one-apply': ['Depends On', 'Fast Test'],
+            'only-one-flash': ['Review Gate', 'Zero Disk'],
+            'only-one-debug': ['evidence', 'three patch attempts'],
+        };
+
+        for (const [name, requiredTerms] of Object.entries(contracts)) {
+            const content = readFileSync(join(workflowsDir, `${name}.md`), 'utf8');
+            for (const term of requiredTerms) expect(content.toLowerCase()).toContain(term.toLowerCase());
+        }
+    });
```

## Section 5. Test Cases & Verification

### Automated Tests

- `npm test -- test/core/skill-registry.test.ts`
- `npm test -- test/core/workflow-registry.test.ts`
- `npm test -- test/core/agent-service-planners.test.ts test/commands/workflow.test.ts`
- `npm test -- test/core/assets/version-gate.test.ts test/core/assets/sync.test.ts`
- `npm run build`

### Manual Checks

1. Run `only-one workflow` in an isolated project and select one targeted workflow; verify `.agents/skills/i-have-adhd/SKILL.md` and workflow file install together.
2. Install a targeted workflow in an isolated project; verify the downloaded `SKILL.md` matches current upstream `main` and remote hash metadata is recorded.
3. Invoke each workflow once; verify progress vocabulary and compatibility precedence while domain-skill evidence, hard stops, and review gates remain intact.
4. Confirm non-target workflows do not receive `i-have-adhd` through their `requiredSkills`.
5. Run skill freshness inspection after an upstream-content fixture changes; verify state becomes `update-available` and overwrite refreshes content.
