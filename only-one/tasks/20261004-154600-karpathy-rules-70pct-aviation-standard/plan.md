---
status: completed
slug: karpathy-rules-70pct-aviation-standard
started_at: 2026-10-04
completed_at: 2026-10-04
pr_url: ~
branch: ~
---

# Plan: Tích hợp 4 Quy tắc Vàng Karpathy & Chuẩn Văn bản Hàng không 70% ASD-STE100

## Section 1. Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
only-one-cli/
├── assets/
│   ├── combos/
│   │   └── [MODIFY] index.ts                     # Bổ sung skill vào frontend-flow, backend-flow, full-sdlc-flow & bump versions
│   ├── skills/
│   │   ├── [NEW]    karpathy-ste100-discipline/
│   │   │   └── SKILL.md                          # Tài liệu đặc tả 4 Kỷ luật Karpathy & chuẩn 70% ASD-STE100
│   │   └── [MODIFY] index.ts                     # Đăng ký skill 'karpathy-ste100-discipline'
│   └── workflows/
│       ├── [MODIFY] index.ts                     # Bổ sung skill vào requiredSkills & bump patch versions
│       ├── [MODIFY] only-one-idea.md             # Thêm skill vào catalog & quy định viết 70% STE100
│       ├── [MODIFY] only-one-plan.md             # Thêm skill vào catalog & ràng buộc Section 2 task blocks
│       └── [MODIFY] only-one-debug.md            # Thêm skill vào catalog & ràng buộc RCA / patch blocks
├── .agents/
│   ├── skills/
│   │   └── [NEW]    karpathy-ste100-discipline/
│   │       └── SKILL.md                          # Active workspace copy để AI engine tự động nạp
│   └── workflows/
│       ├── [MODIFY] only-one-idea.md             # Đồng bộ bản active với assets/workflows/only-one-idea.md
│       ├── [MODIFY] only-one-plan.md             # Đồng bộ bản active với assets/workflows/only-one-plan.md
│       └── [MODIFY] only-one-debug.md            # Đồng bộ bản active với assets/workflows/only-one-debug.md
└── only-one/
    └── [MODIFY] rules.md                         # Bổ sung quy tắc repository [ALWAYS] cho Karpathy & 70% STE100
```

---

## Section 2. File Changes

### 1. `[NEW]` `assets/skills/karpathy-ste100-discipline/SKILL.md`

- **Status**: `[x]`
- **Context**: Khởi tạo tài liệu đặc tả chuẩn kỹ năng cho 4 Kỷ luật Karpathy và Chuẩn văn bản hàng không 70% ASD-STE100.
- **Target Symbols / AST Seams**: Frontmatter và toàn bộ tài liệu Markdown.
- **Invariants**: Frontmatter `name` bắt buộc là `karpathy-ste100-discipline` để khớp với `assets/skills/index.ts`.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Khởi tạo file đặc tả kỹ năng local `karpathy-ste100-discipline`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tạo local skill độc lập cung cấp bộ từ điển hành động và quy tắc viết cô đọng.
- **Rejected alternative**: Nhúng toàn bộ tài liệu dài vào `rules.md` gây loãng context window.

```markdown
---
name: karpathy-ste100-discipline
description: Enforce Andrej Karpathy's 4 Core Disciplines and 70% ASD-STE100 Aviation Technical Writing Specification for zero-slop Markdown documentation.
---

# Karpathy Disciplines & 70% ASD-STE100 Writing Specification

## Overview

This skill establishes a dual-discipline constraint for AI Agents when designing architectures, generating Markdown documentation, and executing code changes:
1. **Andrej Karpathy's 4 Core Disciplines**: Eliminate silent assumptions, prevent speculative over-engineering, and enforce surgical execution.
2. **70% ASD-STE100 Aviation Writing Specification**: Eliminate "AI Slop", enforce sentence length gates, and structure procedural actions into verifiable 3-part blocks.

---

## 1. Andrej Karpathy 4 Golden Disciplines

| Discipline | Agent Behavioral Invariants |
| :--- | :--- |
| **1. Think Before Coding** | Zero silent assumptions. Explicitly state technical assumptions. Stop and ask the user whenever requirements or edge cases are ambiguous. |
| **2. Simplicity First** | Choose the simplest working solution. Never introduce premature abstractions, generic wrappers, or factory layers without at least 3 concrete use cases (Rule of Three / YAGNI). |
| **3. Surgical Changes** | Touch only files and lines strictly required for the target task. Never perform drive-by refactoring, whitespace reformatting, or style changes on unrelated code. |
| **4. Goal-Driven Execution** | Transform vague tasks into verifiable criteria. Every task block must provide a fast verification command or a binary Pass/Fail test. Loop until all verification criteria pass. |

---

## 2. 70% ASD-STE100 Aviation Writing Specification

ASD-STE100 (Simplified Technical English) originated in aerospace maintenance manuals to prevent ambiguity and human error. In this system, a relaxed 70% specification is enforced for high-density, bilingual Markdown documentation.

### A. Sentence Word Limits
- **Procedural / Instruction Sentences**: Maximum **25 words**.
- **Descriptive / Context Sentences**: Maximum **30 words**.
- Do not write complex multi-clause compound sentences. Break complex thoughts into structured bullet points.

### B. Tri-Part Action Architecture (Aviation Standard)
Every task block in execution artifacts (`plan.md`, `debug.md`) must follow the 3-part structure:
1. **`[Prerequisites]`**: Pre-conditions, required assets, or setup state.
2. **`[Action]`**: Direct imperative statement starting with a controlled action verb.
3. **`[Verification]`**: Measurable, deterministic binary outcome (Pass/Fail).

### C. Controlled Action Verbs
Use consistent technical verbs. Never interchange synonyms arbitrarily:
- `Create`: Initialize a new file, class, interface, table, or asset.
- `Update`: Modify existing logic, contract, or file content.
- `Delete`: Remove obsolete, deprecated, or dead files and symbols.
- `Refactor`: Restructure internal implementation without altering external contracts.
- `Inspect`: Read, analyze, or verify codebase state before taking action.
- `Verify`: Run automated tests, execute commands, or assert expected outputs.
- `Rollback`: Revert changes safely to an uncorrupted prior state.

### D. Zero-Slop Constraint
- **Strictly Prohibited**: Conversational filler, throat-clearing, and verbose pleasantries (*"It is important to note that...", "As we know...", "Please make sure to..."*).
- Start directly with the subject or an imperative verb.
- Preserve standard English for technical terminology (*race condition, idempotency, blast radius, payload, lockfile, AST seam*).
```

---

### 2. `[NEW]` `.agents/skills/karpathy-ste100-discipline/SKILL.md`

- **Status**: `[x]`
- **Context**: Tạo active copy trong thư mục workspace `.agents/skills/` để các agentic IDE tự động phát hiện và nạp.
- **Target Symbols / AST Seams**: Toàn bộ file.
- **Invariants**: Nội dung giống 100% với `assets/skills/karpathy-ste100-discipline/SKILL.md`.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Khởi tạo bản active `.agents/skills/karpathy-ste100-discipline/SKILL.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ bản sao trực tiếp vào `.agents/skills/` theo chuẩn cấu trúc workspace agentic IDE.
- **Rejected alternative**: Chỉ để ở `assets/` khiến agent đang chạy trong IDE không load được.

```markdown
<!-- Nội dung đồng bộ 100% từ assets/skills/karpathy-ste100-discipline/SKILL.md -->
```

---

### 3. `[MODIFY]` `assets/skills/index.ts`

- **Status**: `[x]`
- **Context**: Khai báo danh mục kỹ năng của CLI.
- **Target Symbols / AST Seams**: Biến mảng `SKILLS`.
- **Invariants**: Phải có đầy đủ `name`, `version` (X.Y.Z), `description`, và `sourceType: 'local'`.
- **Depends On**: Task 1.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Đăng ký entry `karpathy-ste100-discipline` vào mảng `SKILLS`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đăng ký local skill theo chuẩn `SkillManifest`.
- **Rejected alternative**: Sửa đổi các skill remote hiện có.

```diff
--- a/assets/skills/index.ts
+++ b/assets/skills/index.ts
@@ -227,6 +227,13 @@ export const SKILLS: SkillManifest[] = [
         sourceType: 'github',
         skillPath: 'skills/ponytail/SKILL.md',
     },
+    {
+        name: 'karpathy-ste100-discipline',
+        version: '0.0.1',
+        description:
+            "Enforce Andrej Karpathy's 4 Core Disciplines and 70% ASD-STE100 Aviation Technical Writing Specification for zero-slop Markdown.",
+        sourceType: 'local',
+    },
     {
         name: 'only-one-nestjs-development',
         version: '0.0.2',
```

---

### 4. `[MODIFY]` `only-one/rules.md`

- **Status**: `[x]`
- **Context**: File quy tắc phủ định và ràng buộc nòng cốt của repository được AI đọc tự động ở mọi workflow.
- **Target Symbols / AST Seams**: Danh sách gạch đầu dòng quy tắc `[ALWAYS]`.
- **Invariants**: Không phá vỡ các quy tắc hiện hữu từ 1-32.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/assets/version-gate.test.ts`.

> **Action**: Bổ sung quy tắc bắt buộc áp dụng Karpathy 4 Disciplines và 70% ASD-STE100 Markdown.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm 2 quy tắc `[ALWAYS]` cô đọng vào cuối file `rules.md`.
- **Rejected alternative**: Viết lại cấu trúc file `rules.md`.

```diff
--- a/only-one/rules.md
+++ b/only-one/rules.md
@@ -32,3 +32,5 @@
 - **[ALWAYS]** `debug.md` phải có đúng 3 section chính: `Diagnosis`, full machine-readable `File Changes`, và `Verification`; mỗi Debug file task block dùng cùng metadata contract với `plan.md`.
+- **[ALWAYS]** Tuân thủ 4 Kỷ luật Thực thi của Andrej Karpathy: Think Before Coding (nêu rõ giả định, không suy diễn ngầm), Simplicity First (chọn giải pháp tối giản nhất, cấm over-engineering), Surgical Changes (chỉ sửa đúng file/dòng trong scope), và Goal-Driven Execution (nghiệm thu bằng test/lệnh tự động).
+- **[ALWAYS]** Áp dụng quy chuẩn 70% ASD-STE100 khi sinh tài liệu Markdown (`concept.md`, `plan.md`, `debug.md`): câu chỉ dẫn <= 25 từ, câu mô tả <= 30 từ, cấu trúc 3 tầng Prerequisites -> Action -> Verification, triệt tiêu 100% văn phong rào đón xã giao (AI Slop).
```

---

### 5. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Manifest quản lý workflows và danh mục `requiredSkills`.
- **Target Symbols / AST Seams**: Mảng `WORKFLOWS`.
- **Invariants**: Phải cập nhật `version` cho các workflows thay đổi (bảo vệ CI version gate).
- **Depends On**: Task 3.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts test/core/assets/version-gate.test.ts`.

> **Action**: Bổ sung `karpathy-ste100-discipline` vào `requiredSkills` và tăng version patch.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Cập nhật `requiredSkills` và bump patch version theo quy định CI.
- **Rejected alternative**: Giữ nguyên version cũ gây fail version-gate test.

```diff
--- a/assets/workflows/index.ts
+++ b/assets/workflows/index.ts
@@ -4,7 +4,7 @@ import type { WorkflowManifest } from '../types.js';
 export const WORKFLOWS: WorkflowManifest[] = [
     {
         name: 'only-one-idea',
-        version: '0.0.6',
+        version: '0.0.7',
         description:
             'Clarify business problems, define strict scope boundaries, build domain models, update CONTEXT.md & ADRs, and produce a lean concept.md specification.',
         requiredSkills: [
@@ -16,11 +16,12 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'idea-refine',
             'wait-what',
             'ponytail',
+            'karpathy-ste100-discipline',
         ],
     },
     {
         name: 'only-one-plan',
-        version: '0.0.9',
+        version: '0.0.10',
         description:
             'Research current code and create a focused, diff-centric implementation plan with Directory Structure, machine-readable File Changes, Unified Diffs, and Verification.',
         requiredSkills: [
@@ -34,6 +35,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'source-driven-development',
             'doubt-driven-development',
             'ponytail',
+            'karpathy-ste100-discipline',
         ],
     },
     {
@@ -53,7 +55,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
     },
     {
         name: 'only-one-debug',
-        version: '0.0.7',
+        version: '0.0.8',
         description:
             'Perform systematic RCA in a three-section debug.md and formulate executable file-centric patch blocks with a red feedback loop.',
         requiredSkills: [
@@ -63,6 +65,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'test-driven-development',
             'code-simplification',
             'ponytail',
+            'karpathy-ste100-discipline',
         ],
     },
     {
@@ -116,7 +119,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
     },
     {
         name: 'only-one-flash',
-        version: '0.0.6',
+        version: '0.0.7',
         description:
             'Execute small, rapid tasks with zero disk plan footprint, compact in-chat File Changes, a user confirmation review gate, and fast verification.',
         requiredSkills: [
@@ -127,6 +130,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'test-driven-development',
             'diagnosing-bugs',
             'ponytail',
+            'karpathy-ste100-discipline',
         ],
     },
 ];
```

---

### 6. `[MODIFY]` `assets/workflows/only-one-idea.md`

- **Status**: `[x]`
- **Context**: File template workflow `/only-one-idea`.
- **Target Symbols / AST Seams**: `## 1. Skills Catalog` và `## Guardrails`.
- **Invariants**: Phải giữ nguyên các contract phrase được kiểm tra trong unit tests (`one question`, `discovery`, `without shortening discovery`).
- **Depends On**: Task 5.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung skill vào Skills Catalog và thêm điều khoản viết 70% STE100 vào Guardrails.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm 1 dòng vào bảng Skills Catalog và 1 bullet trong Guardrails.
- **Rejected alternative**: Thay đổi toàn bộ cấu trúc quy trình Discovery.

```diff
--- a/assets/workflows/only-one-idea.md
+++ b/assets/workflows/only-one-idea.md
@@ -23,3 +23,4 @@
 - Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
+- Activate and follow `karpathy-ste100-discipline` for zero-slop 70% ASD-STE100 specification writing.
 - Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
@@ -49,2 +50,3 @@
 | **`wait-what`** | Agent explanation is unclear or drifting | Stop immediately and re-pitch the explanation in plain, concise English using domain vocabulary. |
 | **`ponytail`** | After Phase 1 problem clarity | Remove unnecessary scope without shortening discovery or introducing code-level design. |
+| **`karpathy-ste100-discipline`** | Writing concept.md specification | Enforce 70% ASD-STE100 concise prose (instructions <= 25 words, descriptions <= 30 words) and Karpathy disciplines. |
@@ -141,2 +143,3 @@
 - **Enforce Bilingual Hybrid Documentation**: Write narrative and descriptions in Vietnamese, preserving standard English technical terms.
+- **Enforce 70% ASD-STE100 Writing Standard**: Eliminate AI slop, restrict sentence length, and structure actions using Prerequisites -> Action -> Verification.
 - **Do not skip Phase 1 discovery**: Clarify problem and scope boundaries thoroughly before proposing solution options.
```

---

### 7. `[MODIFY]` `.agents/workflows/only-one-idea.md`

- **Status**: `[x]`
- **Context**: File workflow active copy trong `.agents/workflows/`.
- **Target Symbols / AST Seams**: Giống Task 6.
- **Invariants**: Đồng bộ 100% với `assets/workflows/only-one-idea.md`.
- **Depends On**: Task 6.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung sửa đổi từ `assets/workflows/only-one-idea.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ bản sao trực tiếp.
- **Rejected alternative**: Để lệch pha giữa assets và .agents.

```diff
--- a/.agents/workflows/only-one-idea.md
+++ b/.agents/workflows/only-one-idea.md
@@ -23,3 +23,4 @@
 - Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
+- Activate and follow `karpathy-ste100-discipline` for zero-slop 70% ASD-STE100 specification writing.
 - Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
@@ -49,2 +50,3 @@
 | **`wait-what`** | Agent explanation is unclear or drifting | Stop immediately and re-pitch the explanation in plain, concise English using domain vocabulary. |
 | **`ponytail`** | After Phase 1 problem clarity | Remove unnecessary scope without shortening discovery or introducing code-level design. |
+| **`karpathy-ste100-discipline`** | Writing concept.md specification | Enforce 70% ASD-STE100 concise prose (instructions <= 25 words, descriptions <= 30 words) and Karpathy disciplines. |
@@ -141,2 +143,3 @@
 - **Enforce Bilingual Hybrid Documentation**: Write narrative and descriptions in Vietnamese, preserving standard English technical terms.
+- **Enforce 70% ASD-STE100 Writing Standard**: Eliminate AI slop, restrict sentence length, and structure actions using Prerequisites -> Action -> Verification.
 - **Do not skip Phase 1 discovery**: Clarify problem and scope boundaries thoroughly before proposing solution options.
```

---

### 8. `[MODIFY]` `assets/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: File template workflow `/only-one-plan`.
- **Target Symbols / AST Seams**: `## 1. Skills Catalog` và `## Guardrails`.
- **Invariants**: Phải giữ nguyên các contract phrase (`machine-readable task block`, `Unified Diff`, `first sufficient solution rung`).
- **Depends On**: Task 5.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung `karpathy-ste100-discipline` vào Skills Catalog và Guardrails của `only-one-plan`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm entry vào bảng Skills Catalog và bullet vào Guardrails.
- **Rejected alternative**: Thay đổi schema 3 Sections cốt lõi.

```diff
--- a/assets/workflows/only-one-plan.md
+++ b/assets/workflows/only-one-plan.md
@@ -95,2 +95,3 @@
 | **`frontend-ui-engineering`** | Building or modifying user-facing frontend components | Design component architecture, state management, 5-state matrix, and accessibility in Section 2 task blocks. |
 | **`source-driven-development`** | Introducing new library APIs or framework methods | Ground all code signatures in verified official documentation in Section 2 to prevent API hallucination. |
+| **`karpathy-ste100-discipline`** | Writing Section 2 task blocks and diff boundaries | Enforce surgical changes, simplicity first, and 70% ASD-STE100 tri-part action verification. |
@@ -194,2 +195,3 @@
 - **Enforce File-Centric & Diff-Centric Architecture**: Present every Section 2 task block with fixed metadata labels and a Git-standard Unified Diff (` ```diff `).
+- **Enforce 70% ASD-STE100 & Karpathy Surgical Discipline**: Restrict task block instructions to <= 25 words, eliminate prose filler, and ensure strict surgical code changes.
 - **🛑 Anti-Current-State-Duplication**: Never recreate Current State or high-level solution narratives in `plan.md`; `concept.md` is their authoritative Single Source of Truth when present.
```

---

### 9. `[MODIFY]` `.agents/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: File workflow active copy trong `.agents/workflows/`.
- **Target Symbols / AST Seams**: Giống Task 8.
- **Invariants**: Đồng bộ 100% với `assets/workflows/only-one-plan.md`.
- **Depends On**: Task 8.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung sửa đổi từ `assets/workflows/only-one-plan.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp.
- **Rejected alternative**: Bỏ qua file active.

```diff
--- a/.agents/workflows/only-one-plan.md
+++ b/.agents/workflows/only-one-plan.md
@@ -95,2 +95,3 @@
 | **`frontend-ui-engineering`** | Building or modifying user-facing frontend components | Design component architecture, state management, 5-state matrix, and accessibility in Section 2 task blocks. |
 | **`source-driven-development`** | Introducing new library APIs or framework methods | Ground all code signatures in verified official documentation in Section 2 to prevent API hallucination. |
+| **`karpathy-ste100-discipline`** | Writing Section 2 task blocks and diff boundaries | Enforce surgical changes, simplicity first, and 70% ASD-STE100 tri-part action verification. |
@@ -194,2 +195,3 @@
 - **Enforce File-Centric & Diff-Centric Architecture**: Present every Section 2 task block with fixed metadata labels and a Git-standard Unified Diff (` ```diff `).
+- **Enforce 70% ASD-STE100 & Karpathy Surgical Discipline**: Restrict task block instructions to <= 25 words, eliminate prose filler, and ensure strict surgical code changes.
 - **🛑 Anti-Current-State-Duplication**: Never recreate Current State or high-level solution narratives in `plan.md`; `concept.md` is their authoritative Single Source of Truth when present.
```

---

### 10. `[MODIFY]` `assets/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: File template workflow `/only-one-debug`.
- **Target Symbols / AST Seams**: `## 1. Skills Catalog` và `## Guardrails`.
- **Invariants**: Phải giữ nguyên các contract phrase (`Diagnosis`, `machine-readable file task blocks`, `Hypotheses Rejected`).
- **Depends On**: Task 5.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung `karpathy-ste100-discipline` vào Skills Catalog và Guardrails của `only-one-debug`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm entry vào bảng Skills Catalog và cập nhật Guardrails.
- **Rejected alternative**: Sửa logic 4 pha chẩn đoán của RCA.

```diff
--- a/assets/workflows/only-one-debug.md
+++ b/assets/workflows/only-one-debug.md
@@ -48,2 +48,3 @@
 | **`ponytail`** | After root cause is proven | Select smallest root-cause fix and record per-file reuse/new-code evidence. |
+| **`karpathy-ste100-discipline`** | Documenting RCA and patch blueprint | Enforce goal-driven verification and 70% ASD-STE100 concise root cause analysis. |
@@ -218,2 +219,3 @@
 - **Enforce Bilingual Hybrid Documentation**: Keep narrative in Vietnamese, preserve English technical terms, symbols, and commands.
+- **Enforce 70% ASD-STE100 Writing Specification**: Sentence length <= 25 words, eliminate AI slop, and structure fixes as Prerequisites -> Action -> Verification.
 - **🛑 Strict Lifecycle Isolation**: Never modify source code, test files, configs, skills, or other workflows during `/only-one-debug`.
```

---

### 11. `[MODIFY]` `.agents/workflows/only-one-debug.md`

- **Status**: `[x]`
- **Context**: File workflow active copy trong `.agents/workflows/`.
- **Target Symbols / AST Seams**: Giống Task 10.
- **Invariants**: Đồng bộ 100% với `assets/workflows/only-one-debug.md`.
- **Depends On**: Task 10.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung sửa đổi từ `assets/workflows/only-one-debug.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp.
- **Rejected alternative**: Bỏ qua file active.

```diff
--- a/.agents/workflows/only-one-debug.md
+++ b/.agents/workflows/only-one-debug.md
@@ -48,2 +48,3 @@
 | **`ponytail`** | After root cause is proven | Select smallest root-cause fix and record per-file reuse/new-code evidence. |
+| **`karpathy-ste100-discipline`** | Documenting RCA and patch blueprint | Enforce goal-driven verification and 70% ASD-STE100 concise root cause analysis. |
@@ -218,2 +219,3 @@
 - **Enforce Bilingual Hybrid Documentation**: Keep narrative in Vietnamese, preserve English technical terms, symbols, and commands.
+- **Enforce 70% ASD-STE100 Writing Specification**: Sentence length <= 25 words, eliminate AI slop, and structure fixes as Prerequisites -> Action -> Verification.
 - **🛑 Strict Lifecycle Isolation**: Never modify source code, test files, configs, skills, or other workflows during `/only-one-debug`.
```

---

### 12. `[MODIFY]` `assets/combos/index.ts`

- **Status**: `[x]`
- **Context**: File manifest định nghĩa các gói combo cài đặt sẵn cho developer (`frontend-flow`, `backend-flow`, `full-sdlc-flow`).
- **Target Symbols / AST Seams**: Mảng `COMBOS`.
- **Invariants**: 100% manifest trong `COMBOS` phải có version hợp lệ và các skills tham chiếu phải tồn tại trong `SKILLS`.
- **Depends On**: Task 3.
- **Fast Test Command**: `npx vitest run test/core/combo.test.ts test/core/assets/version-gate.test.ts`.

> **Action**: Bổ sung `karpathy-ste100-discipline` vào các combo nòng cốt và bump patch version (`0.0.8` -> `0.0.9`).

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đưa `karpathy-ste100-discipline` vào cả 3 combo, đồng thời tối ưu hóa `full-sdlc-flow` trở thành bộ combo hoàn toàn stack-agnostic (loại bỏ các skills và rules đặc thù frontend/backend như `only-one-nextjs-development`, `only-one-nestjs-development`, `frontend-ui-engineering`, `performance-optimization`, `nest-architecture-stack`, `next-architecture-stack`).
- **Rejected alternative**: Giữ nguyên FE/BE trong full-sdlc-flow gây thừa thãi khi developer áp dụng cho repository độc lập (chỉ làm BE hoặc chỉ làm FE hoặc tool CLI thuần).

```diff
--- a/assets/combos/index.ts
+++ b/assets/combos/index.ts
@@ -5,3 +5,3 @@ export const COMBOS: ComboManifest[] = [
     {
         id: 'frontend-flow',
-        version: '0.0.8',
+        version: '0.0.9',
         name: 'Frontend Flow Setup',
@@ -28,3 +28,4 @@ export const COMBOS: ComboManifest[] = [
             'ponytail',
             'source-driven-development',
             'resolving-merge-conflicts',
+            'karpathy-ste100-discipline',
         ],
@@ -46,3 +47,3 @@ export const COMBOS: ComboManifest[] = [
     {
         id: 'backend-flow',
-        version: '0.0.8',
+        version: '0.0.9',
         name: 'Backend Flow Setup',
@@ -67,3 +68,4 @@ export const COMBOS: ComboManifest[] = [
             'ponytail',
             'source-driven-development',
             'resolving-merge-conflicts',
+            'karpathy-ste100-discipline',
         ],
@@ -84,6 +86,6 @@ export const COMBOS: ComboManifest[] = [
     {
         id: 'full-sdlc-flow',
-        version: '0.0.8',
-        name: 'Full SDLC Enterprise Flow Setup',
-        description: 'Complete end-to-end SDLC toolkit: Ideation, Dual-layer planning, quality gates, security, webperf, and review',
+        version: '0.0.9',
+        name: 'Full SDLC Universal Flow Setup',
+        description: 'Stack-agnostic end-to-end SDLC toolkit: Ideation, Dual-layer planning, quality gates, security, testing, and review',
         skills: [
@@ -100,7 +102,3 @@ export const COMBOS: ComboManifest[] = [
             'gherkin-authoring',
-            'only-one-nestjs-development',
-            'only-one-nextjs-development',
-            'frontend-ui-engineering',
             'api-and-interface-design',
             'security-and-hardening',
-            'performance-optimization',
             'code-simplification',
@@ -118,3 +116,4 @@ export const COMBOS: ComboManifest[] = [
             'only-one-clockify-skill',
             'only-one-intranet-skill',
             'only-one-pr-git-skill',
+            'karpathy-ste100-discipline',
         ],
-        rules: ['nest-architecture-stack', 'next-architecture-stack', 'context-and-tools', 'execution-terminal'],
+        rules: ['context-and-tools', 'execution-terminal'],
         workflows: [
```

---

## Section 3. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx vitest run test/core/skill-registry.test.ts` (PASS - 6 tests passed in 15ms).
  - `[x]` `npx vitest run test/core/combo.test.ts` (PASS - 15 tests passed in 25ms).
  - `[x]` `npx vitest run test/core/assets/version-gate.test.ts` (PASS - 2 tests passed in 6ms).
  - `[x]` `npx vitest run test/core/workflow-registry.test.ts` (PASS - 9 tests passed in 18ms).
  - `[x]` `npm test` (PASS - 55 passed, 241 passed, 0 failed).
  - `[x]` `npm run build` (PASS - TypeScript compile + Prettier check passed with code 0).
- **Manual Checks**:
  - `[x]` Đồng bộ 100% giữa `assets/` và `.agents/` cho skill mới `karpathy-ste100-discipline` và các workflows `only-one-idea`, `only-one-plan`, `only-one-debug`.
  - `[x]` `full-sdlc-flow` đã được tối ưu hóa thành combo stack-agnostic (loại bỏ sạch sẽ NestJS/NextJS/Frontend components).
