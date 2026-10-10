---
status: done
slug: sparring-partner-anti-sycophancy-skill
started_at: 2026-10-10
completed_at: 2026-10-10
pr_url: ~
branch: ~
---

# Plan: Triển khai Sparring Partner Skill & Tích hợp vào Workflows

## Section 1. Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
assets/
├── skills/
│   ├── [NEW]    sparring-partner/SKILL.md   # Định nghĩa nội dung và rubric của Sparring Partner skill
│   └── [MODIFY] index.ts                    # Đăng ký manifest cho sparring-partner trong SKILLS
└── workflows/
    ├── [MODIFY] index.ts                    # Thêm sparring-partner vào requiredSkills của workflows
    ├── [MODIFY] only-one-idea.md            # Kích hoạt sparring-partner trong Phase 2 (Solution Architecture & Trade-offs)
    ├── [MODIFY] only-one-plan.md            # Kích hoạt sparring-partner trong Pre-Diff Blueprint Gate
    └── [MODIFY] only-one-review.md          # Kích hoạt sparring-partner trong chuẩn hóa và phản biện finding

.agents/
├── skills/
│   └── [NEW]    sparring-partner/SKILL.md   # Đồng bộ skill vào môi trường active của workspace
└── workflows/
    ├── [MODIFY] only-one-idea.md            # Đồng bộ workflow idea cập nhật
    ├── [MODIFY] only-one-plan.md            # Đồng bộ workflow plan cập nhật
    └── [MODIFY] only-one-review.md          # Đồng bộ workflow review cập nhật
```

---

## Section 2. File Changes

### 1. `[NEW]` `assets/skills/sparring-partner/SKILL.md`

- **Status**: `[x]`
- **Context**: Chưa có skill chuyên trách kích hoạt tư duy phản biện và ngăn chặn sycophancy cho agent.
- **Target Symbols / AST Seams**: `SKILL.md frontmatter & instructions`.
- **Invariants**: Phải tuân thủ chuẩn YAML frontmatter (`name: sparring-partner`), áp dụng mô hình 5 trục kỹ thuật và cơ chế Ask-Don't-Tell.
- **Depends On**: None.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Tạo tài liệu kỹ năng Sparring Partner để ép agent phản biện đa chiều trước khi đồng thuận.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tạo mới asset skill cục bộ để hỗ trợ đóng gói và phân phối qua CLI.
- **Rejected alternative**: Mở rộng file grill-me đơn giản vì mục tiêu hai skill phục vụ hai ngữ cảnh khác nhau.

```diff
--- /dev/null
+++ b/assets/skills/sparring-partner/SKILL.md
@@ -0,0 +1,78 @@
+---
+name: sparring-partner
+description: Challenge user assumptions, enforce anti-sycophancy, evaluate technical solutions across 5 critical vectors, and propose robust alternatives before concurring. Use when discussing architecture, reviewing design trade-offs, or stress-testing technical decisions.
+---
+
+# Sparring Partner & Anti-Sycophancy
+
+## Core Purpose
+
+Act as a senior technical sparring partner and critical peer. Eliminate sycophancy (the tendency to automatically agree with user proposals). Uncover blind spots, surface hidden risks, and actively advocate for cleaner, more resilient architecture.
+
+---
+
+## 1. Strict Anti-Sycophancy Gate (Cấm Nịnh Bợ)
+
+- **Zero Sycophantic Fillers**: NEVER start responses with praise, validation, or agreement (e.g., "Great idea!", "You're totally right!", "I love this approach!").
+- **Evidence First, Agreement Later**: Do NOT agree with a proposal until you have explicitly pressure-tested it against failure modes and hidden assumptions.
+- **Acknowledge Trade-offs**: If a user's proposal has merits, state the exact trade-offs and constraints under which it holds true.
+
+---
+
+## 2. The 5 Technical Evaluation Vectors (Ngũ Trục Phản Biện)
+
+Every design, architecture, or technical decision must be evaluated against these 5 vectors:
+
+1. **Boundary Conditions & Edge Cases**:
+   - What input, data shape, or state transition will cause this solution to fail?
+   - Are empty states, nulls, timeouts, and network disconnects handled cleanly?
+
+2. **Over-engineering vs. Simplicity**:
+   - Is this adding unnecessary abstraction layers, speculative patterns, or premature optimization?
+   - Can this be solved with half the code or existing built-in utilities?
+
+3. **Blast Radius & Maintainability**:
+   - If this component breaks or changes, what downstream modules are impacted?
+   - Will another engineer understand and safely modify this 6 months from now?
+
+4. **Concurrency & State Invariants**:
+   - Are there race conditions, stale closures, or asynchronous ordering issues?
+   - Is state duplicated across multiple sources of truth?
+
+5. **Scalability & Security**:
+   - Does this introduce prompt injection risks, unbounded memory growth, or performance bottlenecks under 10x load?
+   - Are inputs validated and sanitized at system boundaries?
+
+---
+
+## 3. Structured Sparring Response Format
+
+When evaluating an idea, plan, or architecture, structure your response as follows:
+
+```markdown
+### 1. Unstated Assumptions & Hidden Risks
+- [Vector]: <Point out specific assumption or vulnerability without fluff>.
+
+### 2. Concrete Pushback & Trade-offs
+- [Vector]: <Provide factual technical reasoning why this approach may be suboptimal>.
+
+### 3. Agent Standpoint & Better Alternative
+- **Standpoint**: [Conditionally Viable | Recommend Alternative | Strongly Advise Against]
+- **Counter-Proposal**: <Describe concrete, cleaner, lower-risk solution with trade-offs>.
+```
+
+---
+
+## 4. Collaborative Decision Gate
+
+- **Respect Final User Decision**: If the user acknowledges the highlighted risks and consciously decides to proceed due to business constraints, deadlines, or scope limits, respect the decision and proceed with maximum safety guardrails.
+- **No Endless Arguments**: Challenge once with high rigor and clear evidence. Do not engage in repetitive loops once trade-offs are explicitly accepted.
```

---

### 2. `[MODIFY]` `assets/skills/index.ts`

- **Status**: `[x]`
- **Context**: Danh mục `SKILLS` thiếu mục khai báo cho skill `sparring-partner`.
- **Target Symbols / AST Seams**: `SKILLS array in assets/skills/index.ts`.
- **Invariants**: Phải giữ tính duy nhất của trường `name` và khai báo `sourceType: 'local'` cho skill nội bộ.
- **Depends On**: `assets/skills/sparring-partner/SKILL.md`.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Đăng ký `sparring-partner` vào mảng manifest `SKILLS` trong `assets/skills/index.ts`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Thêm 1 manifest entry theo chuẩn `SkillManifest` cục bộ.
- **Rejected alternative**: Tải remote từ GitHub trong khi dự án cần kiểm soát trực tiếp nội dung skill.

```diff
--- a/assets/skills/index.ts
+++ b/assets/skills/index.ts
@@ -31,6 +31,12 @@ export const SKILLS: SkillManifest[] = [
         sourceType: 'github',
         skillPath: 'skills/productivity/grill-me/SKILL.md',
     },
+    {
+        name: 'sparring-partner',
+        version: '0.0.1',
+        description: 'Challenge user assumptions, enforce anti-sycophancy, evaluate solutions across 5 technical vectors, and propose robust alternatives before concurring.',
+        sourceType: 'local',
     },
     {
         name: 'interview-me',
         version: '0.0.1',
```

---

### 3. `[MODIFY]` `assets/workflows/index.ts`

- **Status**: `[x]`
- **Context**: Các workflow manifest chưa liệt kê `sparring-partner` trong `requiredSkills`.
- **Target Symbols / AST Seams**: `WORKFLOWS array in assets/workflows/index.ts`.
- **Invariants**: Giữ nguyên tính hợp lệ của manifest schema và các skill bắt buộc khác.
- **Depends On**: `assets/skills/index.ts`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Thêm `sparring-partner` vào `requiredSkills` của `only-one-idea`, `only-one-plan`, và `only-one-review`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Khai báo phụ thuộc rõ ràng trong manifest để CLI kiểm tra tự động.
- **Rejected alternative**: Chỉ sửa file markdown mà bỏ qua manifest.

```diff
--- a/assets/workflows/index.ts
+++ b/assets/workflows/index.ts
@@ -25,6 +25,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'domain-modeling',
             'interview-me',
             'idea-refine',
+            'sparring-partner',
             'wait-what',
             'ponytail',
             'karpathy-ste100-discipline',
@@ -41,6 +42,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
             'to-tickets',
             'codebase-design',
             'grill-me',
+            'sparring-partner',
             'c4-diagrams',
             'api-and-interface-design',
             'frontend-ui-engineering',
@@ -83,7 +85,7 @@ export const WORKFLOWS: WorkflowManifest[] = [
     {
         name: 'only-one-review',
         version: '0.0.2',
         description: 'Run Open CodeReview and produce selectable debug-grade executable findings.',
-        requiredSkills: ['diagnosing-bugs', 'doubt-driven-development', 'test-driven-development', 'code-simplification', 'ponytail'],
+        requiredSkills: ['sparring-partner', 'diagnosing-bugs', 'doubt-driven-development', 'test-driven-development', 'code-simplification', 'ponytail'],
     },
```

---

### 4. `[MODIFY]` `assets/workflows/only-one-idea.md`

- **Status**: `[x]`
- **Context**: `only-one-idea.md` chưa kích hoạt cơ chế Sparring Partner trong giai đoạn phân tích giải pháp kỹ thuật.
- **Target Symbols / AST Seams**: `Section 1. Skills Catalog & Step 2 execution protocol`.
- **Invariants**: Phải giữ nguyên các gate hiện hữu (Phase 1 discovery gate, Ponytail scope gate, Terminal handoff).
- **Depends On**: `assets/skills/sparring-partner/SKILL.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Bổ sung `sparring-partner` vào Skills Catalog và chỉ thị Step 2 trong `only-one-idea.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Tích hợp trực tiếp vào Step 2 nơi Agent đóng vai Solution Architect.
- **Rejected alternative**: Bật ở Step 1 gây cản trở việc thu thập vấn đề từ người dùng.

```diff
--- a/assets/workflows/only-one-idea.md
+++ b/assets/workflows/only-one-idea.md
@@ -20,7 +20,7 @@
 - **Enforce Bilingual Hybrid Documentation**:
   - Conduct interactive Q&A, solution sparring, and interview turns in Vietnamese (or user's preferred language).
   - Author `concept.md` with **Vietnamese narrative & explanations**, while strictly preserving standard **English technical terms** (*idempotency, blast radius, out-of-scope, debounce, rollback, race condition, state machine, optimistic UI, fallback...*).
-- Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
+- Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `sparring-partner`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
 - Activate and follow `karpathy-ste100-discipline` for zero-slop 70% ASD-STE100 specification writing.
 - Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
@@ -48,6 +48,7 @@
 | **`grill-me`** | User requests fast brainstorming without creating files on disk | Conduct a relentless interview to uncover hidden assumptions with zero file footprint. |
+| **`sparring-partner`** | User proposes architecture or solution options | Pressure-test solution options against 5 technical vectors and surface hidden risks before concurring. |
 | **`wait-what`** | Agent explanation is unclear or drifting | Stop immediately and re-pitch the explanation in plain, concise English using domain vocabulary. |
 | **`ponytail`** | After Phase 1 problem clarity | Remove unnecessary scope without shortening discovery or introducing code-level design. |
@@ -69,6 +70,7 @@
 ### Step 2 — Solution Architecture, UI Mockup & Trade-offs (Role: Technical Lead)
 
 1. **Proactively Brainstorm & Propose 2–3 Solution Options**:
+   - **Apply `sparring-partner` anti-sycophancy discipline**: Ruthlessly pressure-test each proposed option against the 5 technical vectors (boundary conditions, simplicity, blast radius, concurrency, scalability/security) before asking PM for the final decision.
    - Present **2–3 architectural/implementation approaches** (e.g., Option 1: Lightweight/Direct, Option 2: Robust/Standard, Option 3: Event-Driven/Scalable).
    - Compare each option via structured matrix: **Pros**, **Cons**, **Implementation Complexity**, and **Trade-offs**.
```

---

### 5. `[MODIFY]` `assets/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: `only-one-plan.md` chưa tích hợp `sparring-partner` để phản biện over-engineering trong diffs.
- **Target Symbols / AST Seams**: `Section 1. Skills Catalog & Step 3 Pre-Diff Compliance Gate`.
- **Invariants**: Giữ nguyên định dạng task block Section 2 và Unified Diff.
- **Depends On**: `assets/skills/sparring-partner/SKILL.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Thêm `sparring-partner` vào catalog và Pre-Diff Compliance Gate trong `only-one-plan.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Ép phản biện độ phức tạp trước khi phát sinh code diffs.
- **Rejected alternative**: Để sang giai đoạn code review mới phản biện thì đã quá muộn.

```diff
--- a/assets/workflows/only-one-plan.md
+++ b/assets/workflows/only-one-plan.md
@@ -70,6 +70,7 @@
    - Before authoring Section 2 (File Changes), cross-check every planned modification against the rules and framework skills loaded in Step 2.
    - Run `ponytail` for every target file after reading current flow and shared helpers.
    - Record the first sufficient decision rung, reuse target, or evidence-backed reason for new code.
+   - **Activate `sparring-partner`**: Challenge proposed file diffs for unnecessary complexity, speculative abstraction, or unhandled failure modes.
    - Safety and acceptance criteria override minimization.
@@ -90,6 +91,7 @@
 | **`to-tickets`** | Decomposing the plan into orderly file changes with dependencies | Establish tracer bullets and explicit dependency blocking edges (`Depends On`) in Section 2 task blocks. |
 | **`codebase-design`** | Designing new modules, refactoring core abstractions | Design deep modules with small interfaces at clean seams, testable through that interface. |
 | **`grill-me`** | User requests interactive stress-testing of the plan / design | Conduct a relentless interview to uncover hidden assumptions with zero file footprint. |
+| **`sparring-partner`** | Designing file task blocks and architectural seams | Eliminate sycophancy, challenge over-engineering or speculative patterns, and ensure strict 5-vector resilience. |
 | **`doubt-driven-development`** | High-stakes architectural decisions, critical transactional flows, or unfamiliar complex code | Perform an adversarial Red-Team sanity check (`CLAIM` $\rightarrow$ `DOUBT` $\rightarrow$ `RECONCILE`) on critical design points in Section 2. |
```

---

### 6. `[MODIFY]` `assets/workflows/only-one-review.md`

- **Status**: `[x]`
- **Context**: `only-one-review.md` thiếu chỉ thị phản biện thẳng thắn theo nguyên tắc anti-sycophancy.
- **Target Symbols / AST Seams**: `Section 1. Skills Catalog in only-one-review.md`.
- **Invariants**: Giữ nguyên các mode review của OCR và định dạng finding.
- **Depends On**: `assets/skills/sparring-partner/SKILL.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Thêm `sparring-partner` vào catalog của `only-one-review.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đảm bảo review findings luôn thẳng thắn và bám sát bằng chứng.
- **Rejected alternative**: Không đưa vào review làm giảm chất lượng phản biện code.

```diff
--- a/assets/workflows/only-one-review.md
+++ b/assets/workflows/only-one-review.md
@@ -34,6 +34,7 @@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`sparring-partner`** | Evaluating review findings and designing fixes | Challenge superficial fixes, enforce anti-sycophancy, and verify 5 technical vectors. |
 | **`diagnosing-bugs`** | Reproducing or localizing an OCR finding | Prove symptom, root cause, and red feedback loop before proposing a fix. |
 | **`doubt-driven-development`** | Validating each OCR claim | Challenge assumptions and reject unproven claims without inventing findings. |
```

---

### 7. `[NEW]` `.agents/skills/sparring-partner/SKILL.md`

- **Status**: `[x]`
- **Context**: Workspace hiện tại chưa có skill `sparring-partner` trong thư mục `.agents/skills/`.
- **Target Symbols / AST Seams**: `.agents/skills/sparring-partner/SKILL.md`.
- **Invariants**: Nội dung phải đồng bộ hoàn toàn với `assets/skills/sparring-partner/SKILL.md`.
- **Depends On**: `assets/skills/sparring-partner/SKILL.md`.
- **Fast Test Command**: `npx vitest run test/core/skill-registry.test.ts`.

> **Action**: Đồng bộ skill vào `.agents/skills/sparring-partner/SKILL.md` để agent trong workspace có thể sử dụng ngay lập tức.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Sao chép nội dung chuẩn từ assets sang `.agents` để phục vụ runtime hiện tại.
- **Rejected alternative**: Không cài đặt vào workspace khiến agent không thể tự kích hoạt skill.

```diff
--- /dev/null
+++ b/.agents/skills/sparring-partner/SKILL.md
@@ -0,0 +1,78 @@
+---
+name: sparring-partner
+description: Challenge user assumptions, enforce anti-sycophancy, evaluate technical solutions across 5 critical vectors, and propose robust alternatives before concurring. Use when discussing architecture, reviewing design trade-offs, or stress-testing technical decisions.
+---
+
+# Sparring Partner & Anti-Sycophancy
+
+## Core Purpose
+
+Act as a senior technical sparring partner and critical peer. Eliminate sycophancy (the tendency to automatically agree with user proposals). Uncover blind spots, surface hidden risks, and actively advocate for cleaner, more resilient architecture.
+
+---
+
+## 1. Strict Anti-Sycophancy Gate (Cấm Nịnh Bợ)
+
+- **Zero Sycophantic Fillers**: NEVER start responses with praise, validation, or agreement (e.g., "Great idea!", "You're totally right!", "I love this approach!").
+- **Evidence First, Agreement Later**: Do NOT agree with a proposal until you have explicitly pressure-tested it against failure modes and hidden assumptions.
+- **Acknowledge Trade-offs**: If a user's proposal has merits, state the exact trade-offs and constraints under which it holds true.
+
+---
+
+## 2. The 5 Technical Evaluation Vectors (Ngũ Trục Phản Biện)
+
+Every design, architecture, or technical decision must be evaluated against these 5 vectors:
+
+1. **Boundary Conditions & Edge Cases**:
+   - What input, data shape, or state transition will cause this solution to fail?
+   - Are empty states, nulls, timeouts, and network disconnects handled cleanly?
+
+2. **Over-engineering vs. Simplicity**:
+   - Is this adding unnecessary abstraction layers, speculative patterns, or premature optimization?
+   - Can this be solved with half the code or existing built-in utilities?
+
+3. **Blast Radius & Maintainability**:
+   - If this component breaks or changes, what downstream modules are impacted?
+   - Will another engineer understand and safely modify this 6 months from now?
+
+4. **Concurrency & State Invariants**:
+   - Are there race conditions, stale closures, or asynchronous ordering issues?
+   - Is state duplicated across multiple sources of truth?
+
+5. **Scalability & Security**:
+   - Does this introduce prompt injection risks, unbounded memory growth, or performance bottlenecks under 10x load?
+   - Are inputs validated and sanitized at system boundaries?
+
+---
+
+## 3. Structured Sparring Response Format
+
+When evaluating an idea, plan, or architecture, structure your response as follows:
+
+```markdown
+### 1. Unstated Assumptions & Hidden Risks
+- [Vector]: <Point out specific assumption or vulnerability without fluff>.
+
+### 2. Concrete Pushback & Trade-offs
+- [Vector]: <Provide factual technical reasoning why this approach may be suboptimal>.
+
+### 3. Agent Standpoint & Better Alternative
+- **Standpoint**: [Conditionally Viable | Recommend Alternative | Strongly Advise Against]
+- **Counter-Proposal**: <Describe concrete, cleaner, lower-risk solution with trade-offs>.
+```
+
+---
+
+## 4. Collaborative Decision Gate
+
+- **Respect Final User Decision**: If the user acknowledges the highlighted risks and consciously decides to proceed due to business constraints, deadlines, or scope limits, respect the decision and proceed with maximum safety guardrails.
+- **No Endless Arguments**: Challenge once with high rigor and clear evidence. Do not engage in repetitive loops once trade-offs are explicitly accepted.
```

---

### 8. `[MODIFY]` `.agents/workflows/only-one-idea.md`

- **Status**: `[x]`
- **Context**: Đồng bộ `.agents/workflows/only-one-idea.md` với `assets/workflows/only-one-idea.md`.
- **Target Symbols / AST Seams**: `.agents/workflows/only-one-idea.md`.
- **Invariants**: Giữ nguyên tính nhất quán giữa assets và workspace runtime.
- **Depends On**: `assets/workflows/only-one-idea.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung kích hoạt `sparring-partner` vào `.agents/workflows/only-one-idea.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp để môi trường active có hiệu lực ngay.
- **Rejected alternative**: Bỏ qua thư mục `.agents` khiến agent đang chạy không thấy workflow mới.

```diff
--- a/.agents/workflows/only-one-idea.md
+++ b/.agents/workflows/only-one-idea.md
@@ -20,7 +20,7 @@
 - **Enforce Bilingual Hybrid Documentation**:
   - Conduct interactive Q&A, solution sparring, and interview turns in Vietnamese (or user's preferred language).
   - Author `concept.md` with **Vietnamese narrative & explanations**, while strictly preserving standard **English technical terms** (*idempotency, blast radius, out-of-scope, debounce, rollback, race condition, state machine, optimistic UI, fallback...*).
-- Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
+- Activate and follow the Define skills (`grill-with-docs`, `grill-me`, `sparring-partner`, `domain-modeling`, `interview-me`, `idea-refine`, `wait-what`).
 - Activate and follow `karpathy-ste100-discipline` for zero-slop 70% ASD-STE100 specification writing.
 - Before the first user-visible response, read and activate `i-have-adhd`; keep it active throughout this workflow.
@@ -48,6 +48,7 @@
 | **`grill-me`** | User requests fast brainstorming without creating files on disk | Conduct a relentless interview to uncover hidden assumptions with zero file footprint. |
+| **`sparring-partner`** | User proposes architecture or solution options | Pressure-test solution options against 5 technical vectors and surface hidden risks before concurring. |
 | **`wait-what`** | Agent explanation is unclear or drifting | Stop immediately and re-pitch the explanation in plain, concise English using domain vocabulary. |
 | **`ponytail`** | After Phase 1 problem clarity | Remove unnecessary scope without shortening discovery or introducing code-level design. |
@@ -69,6 +70,7 @@
 ### Step 2 — Solution Architecture, UI Mockup & Trade-offs (Role: Technical Lead)
 
 1. **Proactively Brainstorm & Propose 2–3 Solution Options**:
+   - **Apply `sparring-partner` anti-sycophancy discipline**: Ruthlessly pressure-test each proposed option against the 5 technical vectors (boundary conditions, simplicity, blast radius, concurrency, scalability/security) before asking PM for the final decision.
    - Present **2–3 architectural/implementation approaches** (e.g., Option 1: Lightweight/Direct, Option 2: Robust/Standard, Option 3: Event-Driven/Scalable).
    - Compare each option via structured matrix: **Pros**, **Cons**, **Implementation Complexity**, and **Trade-offs**.
```

---

### 9. `[MODIFY]` `.agents/workflows/only-one-plan.md`

- **Status**: `[x]`
- **Context**: Đồng bộ `.agents/workflows/only-one-plan.md` với `assets/workflows/only-one-plan.md`.
- **Target Symbols / AST Seams**: `.agents/workflows/only-one-plan.md`.
- **Invariants**: Giữ nguyên tính nhất quán giữa assets và workspace runtime.
- **Depends On**: `assets/workflows/only-one-plan.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung kích hoạt `sparring-partner` vào `.agents/workflows/only-one-plan.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp để môi trường active có hiệu lực ngay.
- **Rejected alternative**: Bỏ qua thư mục `.agents` khiến agent đang chạy không thấy workflow mới.

```diff
--- a/.agents/workflows/only-one-plan.md
+++ b/.agents/workflows/only-one-plan.md
@@ -70,6 +70,7 @@
    - Before authoring Section 2 (File Changes), cross-check every planned modification against the rules and framework skills loaded in Step 2.
    - Run `ponytail` for every target file after reading current flow and shared helpers.
    - Record the first sufficient decision rung, reuse target, or evidence-backed reason for new code.
+   - **Activate `sparring-partner`**: Challenge proposed file diffs for unnecessary complexity, speculative abstraction, or unhandled failure modes.
    - Safety and acceptance criteria override minimization.
@@ -90,6 +91,7 @@
 | **`to-tickets`** | Decomposing the plan into orderly file changes with dependencies | Establish tracer bullets and explicit dependency blocking edges (`Depends On`) in Section 2 task blocks. |
 | **`codebase-design`** | Designing new modules, refactoring core abstractions | Design deep modules with small interfaces at clean seams, testable through that interface. |
 | **`grill-me`** | User requests interactive stress-testing of the plan / design | Conduct a relentless interview to uncover hidden assumptions with zero file footprint. |
+| **`sparring-partner`** | Designing file task blocks and architectural seams | Eliminate sycophancy, challenge over-engineering or speculative patterns, and ensure strict 5-vector resilience. |
 | **`doubt-driven-development`** | High-stakes architectural decisions, critical transactional flows, or unfamiliar complex code | Perform an adversarial Red-Team sanity check (`CLAIM` $\rightarrow$ `DOUBT` $\rightarrow$ `RECONCILE`) on critical design points in Section 2. |
```

---

### 10. `[MODIFY]` `.agents/workflows/only-one-review.md`

- **Status**: `[x]`
- **Context**: Đồng bộ `.agents/workflows/only-one-review.md` với `assets/workflows/only-one-review.md`.
- **Target Symbols / AST Seams**: `.agents/workflows/only-one-review.md`.
- **Invariants**: Giữ nguyên tính nhất quán giữa assets và workspace runtime.
- **Depends On**: `assets/workflows/only-one-review.md`.
- **Fast Test Command**: `npx vitest run test/core/workflow-registry.test.ts`.

> **Action**: Đồng bộ nội dung kích hoạt `sparring-partner` vào `.agents/workflows/only-one-review.md`.

**Ponytail checklist**
- [x] Required by acceptance criteria.
- [x] Existing implementation searched; stdlib, platform/framework, and installed dependencies considered.
- [x] No duplicate logic or speculative extension point.
- [x] Minimum diff preserves correctness and safety.
- **Decision**: Đồng bộ trực tiếp để môi trường active có hiệu lực ngay.
- **Rejected alternative**: Bỏ qua thư mục `.agents` khiến agent đang chạy không thấy workflow mới.

```diff
--- a/.agents/workflows/only-one-review.md
+++ b/.agents/workflows/only-one-review.md
@@ -34,6 +34,7 @@
 | Skill | Trigger condition (Use When) | Core Purpose (What It Does) |
 | :--- | :--- | :--- |
+| **`sparring-partner`** | Evaluating review findings and designing fixes | Challenge superficial fixes, enforce anti-sycophancy, and verify 5 technical vectors. |
 | **`diagnosing-bugs`** | Reproducing or localizing an OCR finding | Prove symptom, root cause, and red feedback loop before proposing a fix. |
 | **`doubt-driven-development`** | Validating each OCR claim | Challenge assumptions and reject unproven claims without inventing findings. |
```

---

## Section 3. Test Cases & Verification

- **Automated Tests**:
  - [x] `npx vitest run test/core/skill-registry.test.ts test/core/workflow-registry.test.ts` (PASS: 16/16 tests passed across 2 test suites)
  - [x] `npm test` (PASS: 242/242 tests passed across 55 test files, format check clean)
  - [x] `npm run build` (PASS: TypeScript compilation clean, dist package generated with postbuild paths verified)
- **Manual Checks**:
  - [x] `assets/workflows/index.ts` đăng ký `sparring-partner` trong `requiredSkills` của `only-one-idea`, `only-one-plan`, `only-one-review`.
  - [x] `.agents/workflows/*.md` và `assets/workflows/*.md` đồng bộ 100% về `sparring-partner`.
  - [x] `assets/skills/sparring-partner/SKILL.md` và `.agents/skills/sparring-partner/SKILL.md` đồng bộ chuẩn rubric phản biện 5 trục.
