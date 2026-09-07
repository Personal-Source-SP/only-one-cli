---
status: done
slug: improve-workflow-specifications
started_at: 2026-09-07
completed_at: 2026-09-07
pr_url: ~
branch: ~
---

# Plan: Nâng Cấp Quy Trình Workflows (only-one-idea, only-one-plan, only-one-apply)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `only-one-idea.md`: Template và hướng dẫn Phần 1 "Problem & Goal" chỉ có 2 placeholder ngắn ngủi, dẫn đến việc agent thường viết thành một đoạn văn đơn khối dài dính liền, rất khó scan và khó nhận diện tiêu chuẩn nghiệm thu.
- `only-one-plan.md`:
  - Thiếu sơ đồ cây thư mục trực quan (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`) trước bảng Task Matrix.
  - Thiếu quy trình nghiên cứu **File-Centric / Target-Driven**: chưa xác định tập tệp mục tiêu trước rồi mới truy quét đúng rules/skills IDE và rules/archives `only-one/`, khiến khối code diff ở Section 4 dễ sai chuẩn framework hoặc phá vỡ invariants cũ.
  - **Trùng lặp tài liệu kế hoạch**: Step 4 có dòng lệnh `Create artifact with RequestFeedback: true and UserFacing: true` khiến các IDE AI (như Antigravity) tự động sinh thêm file `implementation_plan.md` nội bộ, tạo ra 2 bản plan song song gây rác tài liệu và mâu thuẫn nguồn chân lý.
- `only-one-apply.md`: Chưa ghi nhận sự tồn tại của Section 3.1 Directory Structure Changes để định hình layout trước khi chạy Task Matrix.
- **Invariants bắt buộc giữ nguyên**:
  - Giữ nguyên bảng 8 cột chuẩn trong Section 3 Task Matrix (`Order`, `Status`, `Action`, `File Path`, `Target Symbols / AST Seams`, `Reused Existing Utilities / Helpers`, `Depends On`, `Fast Test Command`) để tương thích với `only-one/rules.md`.
  - Giữ chuẩn Unified Diff (` ```diff `) với context lines, `-` và `+` tại Section 4.
  - Bảo đảm Asset Version Gate hợp lệ bằng cách nâng patch version (`X.Y.Z`) trong `assets/workflows/index.ts`.
  - Đồng bộ 100% nội dung giữa `assets/workflows/` và `.agents/workflows/`.
  - Duy trì duy nhất 1 bản kế hoạch tại `only-one/tasks/<slug>/plan.md` (Single Source of Truth).

---

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)

### 1. Chuẩn hóa `only-one-idea.md` (Bullet-Driven Problem & Goal)
- **Step 1 Discovery**: Hướng dẫn Senior BA bóc tách yêu cầu thành các gạch đầu dòng rõ ràng:
  - `Problem`: Bối cảnh/Điểm kích hoạt (*Context/Trigger*), Hiện tượng & Khiếm khuyết (*Defect/Symptom*), Nguyên nhân cốt lõi (*Root Cause*), Tác động (*Impact/Blast Radius*).
  - `Goal`: Mục tiêu cốt lõi (*Core Outcome*), Tiêu chí nghiệm thu cụ thể (*Acceptance Criteria*).
  - Nghiêm cấm viết thành đoạn văn đơn khối dài dòng.
- **Step 3 Template**: Cập nhật mẫu markdown của Section 1 `concept.md` thành cấu trúc phân cấp dạng gạch đầu dòng chuẩn.

### 2. Chuẩn hóa `only-one-plan.md` (File-Centric Research, Section 3.1 Tree & Zero IDE Artifacts)
- **Step 1b & 1c Quy trình Nghiên cứu File-Centric / Target-Driven**:
  - *Bước 1 — Xác định Tập tệp Mục tiêu*: Lập danh sách sơ bộ các file sẽ tạo mới (`[NEW]`), chỉnh sửa (`[MODIFY]`), hoặc xóa (`[DELETE]`).
  - *Bước 2 — Truy vết Tri thức Trúng đích*:
    - **IDE Rules & Framework Skills**: Dựa vào framework/loại tệp của từng file mục tiêu, nạp các rules trong `.agents/rules/` và đọc file `SKILL.md` của các skill framework liên quan (ví dụ: file NestJS $\rightarrow$ `nestjs-development`; file React $\rightarrow$ frontend skills; DTO $\rightarrow$ class-validator). Tuyệt đối **không nạp tràn lan** các skill không liên quan để tránh ô nhiễm ngữ cảnh (*context pollution*).
    - **Only-One Governance & Targeted Archives**: Đọc `only-one/rules.md` (negative rules) và chỉ quét các file `only-one/archives/*.md` liên quan đến domain/module của các file mục tiêu để nắm vững invariants và rationale quá khứ.
  - *Chốt chặn Pre-Diff Compliance Gate*: Đối soát từng dòng code trong Section 4 với các quy chuẩn đã trích xuất từ rules/skills đã nạp.
- **Section 3 Template**: Tách thành 2 mục con:
  - `### 3.1 Directory Structure Changes`: Cây thư mục ASCII kèm tag `[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]` và mô tả 1 câu cho mỗi tệp.
  - `### 3.2 Task Matrix & Dependency Graph`: Bảng 8 cột chuẩn.
- **Step 4 Loại bỏ IDE Artifact (Single Source of Truth)**:
  - Xóa bỏ chỉ dẫn tạo artifact IDE (`Create artifact with RequestFeedback: true...`).
  - Quy định cứng: Chỉ lưu tài liệu kế hoạch duy nhất tại `only-one/tasks/<slug>/plan.md`. Nghiêm cấm sinh các file plan phụ của IDE.
- **Guardrails**: Bổ sung điều cấm kỵ vi phạm chuẩn rules/skills, bắt buộc tuân thủ luồng File-Centric và cấm sinh duplicate plan artifacts.

### 3. Đồng bộ `only-one-apply.md`
- **Step 3 Ingestion**: Cập nhật hướng dẫn AI đọc lướt Section 3.1 Directory Structure Changes trước để nắm cấu trúc tệp, sau đó phân giải Section 3.2 Task Matrix để áp dụng diff theo thứ tự phụ thuộc.

### 4. Manifests & Đồng bộ Workspace
- Cập nhật phiên bản trong `assets/workflows/index.ts`:
  - `only-one-idea`: `0.0.3` $\rightarrow$ `0.0.4`
  - `only-one-plan`: `0.0.3` $\rightarrow$ `0.0.4`
  - `only-one-apply`: `0.0.2` $\rightarrow$ `0.0.3`
- Sao chép nội dung đã chỉnh sửa từ `assets/workflows/*.md` sang `.agents/workflows/*.md`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
assets/workflows/
├── [MODIFY] only-one-idea.md   # Format lại Problem & Goal thành bullet points có cấu trúc
├── [MODIFY] only-one-plan.md   # File-Centric Research, Cây thư mục 3.1, và Zero IDE Artifact
├── [MODIFY] only-one-apply.md  # Cập nhật Step 3 ingest Section 3.1 & 3.2
└── [MODIFY] index.ts           # Nâng patch versions (0.0.4, 0.0.4, 0.0.3)
.agents/workflows/
├── [MODIFY] only-one-idea.md   # Đồng bộ 100% từ assets/workflows/only-one-idea.md
├── [MODIFY] only-one-plan.md   # Đồng bộ 100% từ assets/workflows/only-one-plan.md
└── [MODIFY] only-one-apply.md  # Đồng bộ 100% từ assets/workflows/only-one-apply.md
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-idea.md` | `Step 1 & Step 3 Template` | None | `None` | `npm test test/commands/workflow.test.ts` |
| **2** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-plan.md` | `Step 1b, Section 3, Step 4 & Guardrails` | None | `None` | `npm test test/commands/workflow.test.ts` |
| **3** | `[x]` | `[MODIFY]` | `assets/workflows/only-one-apply.md` | `Step 3 Parse Task Matrix` | None | `Order 2` | `npm test test/commands/workflow.test.ts` |
| **4** | `[x]` | `[MODIFY]` | `assets/workflows/index.ts` | `WORKFLOWS manifest versions` | None | `Order 1, 2, 3` | `npm test test/core/assets/version-gate.test.ts` |
| **5** | `[x]` | `[MODIFY]` | `.agents/workflows/only-one-idea.md`, `.agents/workflows/only-one-plan.md`, `.agents/workflows/only-one-apply.md` | Sync from assets | None | `Order 1, 2, 3` | `diff -r assets/workflows .agents/workflows` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `assets/workflows/only-one-idea.md`
> **Action**: Chuẩn hóa Problem & Goal thành dạng danh sách liệt kê phân cấp ở Step 1 và Step 3 Template.

```diff
@@ line 46 @@
 1. **One-Question-At-A-Time Problem Discovery**:
    - Ask focused questions to uncover the **Root Problem / Business Pain Point** (Why are we building this? Who is it for?).
+   - **Deconstruct Problem & Goal into Structured Bullet Points**: Never write monolithic paragraphs. Deconstruct the problem into *Context/Trigger*, *Defect/Symptom*, *Root Cause*, and *Impact*. Deconstruct goals into *Core Outcome* and *Detailed Acceptance Criteria*.
    - Extract and define strict **`In-Scope` vs `Explicit Out-of-Scope`** boundaries to eliminate scope creep.
@@ line 78 @@
 ## 1. Problem & Goal (Vấn đề & Mục tiêu)
-- **Problem**: <Mô tả ngắn gọn 1-2 câu về điểm nghẽn hoặc nhu cầu kỹ thuật thực tế>.
-- **Goal**: <Kết quả cốt lõi cần đạt được>.
+### Problem (Vấn đề & Điểm nghẽn Hiện tại)
+- **Bối cảnh & Điểm kích hoạt**: <Nơi xảy ra vấn đề hoặc hành động dẫn đến lỗi>.
+- **Hiện tượng & Khiếm khuyết kỹ thuật**: <Hành vi lỗi cụ thể hoặc điểm nghẽn kỹ thuật>.
+- **Nguyên nhân cốt lõi (Root Cause)**: <Lý do kỹ thuật (state bất đồng bộ, thiếu validation, race condition...)>.
+- **Tác động (Impact / Blast Radius)**: <Ảnh hưởng tới người dùng, hệ thống hoặc dữ liệu>.
+
+### Goal (Mục tiêu Kỹ thuật Cần đạt)
+- **Mục tiêu cốt lõi**: <Kết quả kỹ thuật chính bắt buộc đạt được>.
+- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
+  - <Gạch đầu dòng 1: Xử lý trạng thái UI/State, reset giá trị, disabled state...>.
+  - <Gạch đầu dòng 2: Đồng bộ query params / payload API...>.
+  - <Gạch đầu dòng 3: Xử lý fallback, edge cases hoặc thông báo...>.
```

---

### 2. `[MODIFY]` `assets/workflows/only-one-plan.md`
> **Action**: Bổ sung quy trình nghiên cứu File-Centric, nạp IDE rules/skills và Only-One rules/archives, bổ sung Section 3.1 Directory Tree, loại bỏ lệnh sinh IDE artifact ở Step 4 và cập nhật Guardrails.

```diff
@@ line 47 @@
-### 1b. Research Current Code & Reuse-First Audit
-1. Start with files, symbols, errors, and requirements from `concept.md` or user input.
-2. Read direct callers, dependencies, entities, DTOs, contracts, and tests in the codebase to verify exact current behavior.
-3. **Mandatory Reuse-First Audit**:
-   - Actively search (`grep_search` / `list_dir`) in `src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/`, `src/components/`, `src/shared/` to identify existing utilities, helper functions, base classes, and custom hooks before designing new logic.
-   - ❌ **Strict Anti-Reinvention**: Do not propose new utility functions or duplicate components if existing ones can be reused or extended.
-4. Read `only-one/rules.md` to strictly observe mandatory negative rules and past lessons learned.
-5. Check `only-one/CONTEXT.md` for domain terminology and `only-one/archives/*.md` for past architecture decisions.
-6. Check `only-one/skills/` (and `.agents/skills/`) for relevant technology skills. Read their `SKILL.md` before analyzing affected code.
-7. Check existing repository patterns before proposing a new abstraction.
-8. Keep research bounded to the requested change; do not scan unrelated repository areas.
-9. Do not modify source code, dependencies, configuration, database state, or Git state.
+### 1b. File-Centric Research & Target-Driven Knowledge Ingestion Flow
+Do NOT bulk-load all rules, skills, and archives blindly (avoids context pollution and token waste). Follow the disciplined **File-Centric 2-Step Ingestion Flow**:
+
+1. **Step 1 — Identify Target Files & Impact Scope**:
+   - From `concept.md` and codebase analysis, assemble the preliminary list of affected files with their action tags: `[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`.
+   - Read direct callers, dependencies, entities, DTOs, contracts, and tests to verify exact current behavior.
+   - **Mandatory Reuse-First Audit**: Actively search (`grep_search` / `list_dir`) in shared directories (`src/utils/`, `src/helpers/`, `src/hooks/`, `src/common/`, `src/components/`, `src/shared/`) to identify existing utilities, helper functions, and custom hooks. ❌ **Strict Anti-Reinvention**: Do not propose duplicate logic if existing helpers can be reused or extended.
+
+2. **Step 2 — Target-Driven Rules & Skills Lookup**:
+   - **IDE Framework Skills & Rules**:
+     - Match each target file against its framework and technology stack (e.g. `src/modules/*/*.service.ts` $\rightarrow$ `nestjs-development`; `src/components/*/*.tsx` $\rightarrow$ frontend UI/React skills; `*.dto.ts` $\rightarrow$ class-validator).
+     - Read `.agents/rules/`, `.cursorrules`, and the `SKILL.md` of ONLY the matched framework skills. ❌ **Strict No-Bulk-Loading**: Do NOT load unrelated tech skills into working memory.
+     - Extract exact naming conventions, DTO decorators, typing rules, and architectural constraints.
+   - **Only-One Governance & Targeted Archives**:
+     - Read `only-one/rules.md` to strictly enforce mandatory negative rules (`[NEVER]`, `[ALWAYS]`, `[AVOID]`).
+     - Search and read ONLY the relevant `only-one/archives/*.md` files matching the domain/module of the target files to understand past architectural decisions, rationale, and invariants.
+     - Check `only-one/CONTEXT.md` for domain terminology.
+
+3. **Step 3 — Mandatory Pre-Diff Blueprint Compliance Gate**:
+   - Before authoring Section 4 (Code Changes Unified Diff), cross-check every planned modification against the rules and framework skills loaded in Step 2.
+   - 🛑 **Zero-Tolerance Anti-Agent-Drift**: All proposed code changes in `plan.md` must be 100% compliant with the project's loaded skills and repository negative rules.
@@ line 116 @@
-## Section 3. Task Matrix & Dependency Graph
-
-| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
-| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
-| **1** | `[ ]` | `[NEW]` | `path/to/file.ts` | `Class.methodName` | `src/utils/date.ts (formatUtc)` | `None` | `npm test path/to/file.test.ts` |
-| **2** | `[ ]` | `[MODIFY]` | `path/to/caller.ts` | `Caller.handler` | `src/hooks/useCustomTable.ts` | `Order 1` | `npm test path/to/caller.test.ts` |
+## Section 3. Directory Structure & Task Matrix
+
+### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)
+Sơ đồ cây ASCII trực quan thể hiện tất cả các tệp sẽ được thêm mới, sửa đổi hoặc xóa kèm nhãn tag chuẩn:
+
+```text
+src/modules/order/
+├── [MODIFY] order.service.ts         # Xử lý cascading filter và reset ward state
+├── [NEW]    dto/order-filter.dto.ts  # DTO validate query parameters
+├── [DELETE] legacy-filter.helper.ts  # Xóa helper cũ đã deprecated
+└── components/
+    └── [MODIFY] StationsPage.tsx     # Controlled Select components & event handlers
+```
+
+### 3.2 Task Matrix & Dependency Graph
+
+| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
+| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
+| **1** | `[ ]` | `[NEW]` | `path/to/file.ts` | `Class.methodName` | `src/utils/date.ts (formatUtc)` | `None` | `npm test path/to/file.test.ts` |
+| **2** | `[ ]` | `[MODIFY]` | `path/to/caller.ts` | `Caller.handler` | `src/hooks/useCustomTable.ts` | `Order 1` | `npm test path/to/caller.test.ts` |
@@ line 147 @@
 ## 4. Review Gate & Next Steps

-1. Create artifact with `RequestFeedback: true` and `UserFacing: true`.
+1. **Single Plan Document Authority (Zero IDE Artifact Duplication)**:
+   - Save ONLY to `only-one/tasks/<YYYYMMDD-HHmmss>-<kebab-case-slug>/plan.md`.
+   - ❌ **Strict No-Duplicate Artifacts**: Do NOT create secondary IDE-specific planning artifacts (such as `implementation_plan.md` in IDE brain/artifact directories). Present `plan.md` directly to the user.
 2. Stop after presenting the plan.
@@ line 157 @@
 ## Guardrails
 
 - **Enforce Dev-First & Diff-Centric Architecture**: Author narrative in Section 1 and 2 with punchy dev technical terms; present Section 4 in Git-standard Unified Diff (` ```diff `) format.
+- **🛑 Mandatory File-Centric Research & Compliance Gate**: Always identify target files first, then selectively load matching IDE framework skills and `only-one` rules/archives. Proposed diffs must comply 100% with loaded skills and rules.
+- **🛑 Strict Single-Document Invariant (Zero IDE Plan Artifacts)**: Only produce the canonical `only-one/tasks/<YYYYMMDD-HHmmss>-<slug>/plan.md`. Never generate duplicate IDE internal plan files (e.g. `implementation_plan.md`).
 - **Enforce Reuse-First Invariant**: Always identify and declare reused existing utilities/helpers in Section 3 & 4; never propose reinventing existing functions.
```

---

### 3. `[MODIFY]` `assets/workflows/only-one-apply.md`
> **Action**: Cập nhật Step 3 để AI duyệt qua Section 3.1 Directory Structure Changes trước khi thực thi Task Matrix ở Section 3.2.

```diff
@@ line 79 @@
-### Step 3 — Parse Task Matrix & Dependency Graph
-
-1. Jump directly to **Section 3. Task Matrix & Dependency Graph** in `plan.md`.
-2. Extract the ordered sequence: `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
-3. Skip rows already marked `[x]` (Done), identify the first pending row `[ ]` or in-progress row `[/]`.
+### Step 3 — Ingest Directory Structure & Parse Task Matrix
+
+1. **Review Section 3.1 Directory Structure Changes**: Ingest the ASCII directory tree to establish an immediate mental model of all touched files (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
2. **Parse Section 3.2 Task Matrix & Dependency Graph**:
   - Extract the ordered sequence: `Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`.
   - Skip rows already marked `[x]` (Done), identify the first pending row `[ ]` or in-progress row `[/]`.
```

---

### 4. `[MODIFY]` `assets/workflows/index.ts`
> **Action**: Tăng patch version cho các workflows manifests đã được cải tiến.

```diff
@@ line 6 @@
     {
         name: 'only-one-idea',
-        version: '0.0.3',
+        version: '0.0.4',
         description:
@@ line 20 @@
     {
         name: 'only-one-plan',
-        version: '0.0.3',
+        version: '0.0.4',
         description:
@@ line 36 @@
     {
         name: 'only-one-apply',
-        version: '0.0.2',
+        version: '0.0.3',
         description:
```

---

### 5. `[MODIFY]` `.agents/workflows/only-one-idea.md`, `.agents/workflows/only-one-plan.md`, `.agents/workflows/only-one-apply.md`
> **Action**: Đồng bộ 100% nội dung từ `assets/workflows/` sang thư mục runtime `.agents/workflows/`.

*(Nội dung đồng bộ hoàn toàn khớp với `assets/workflows/*.md`)*

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `npm test test/core/assets/version-gate.test.ts` (Xác thực 100% manifest có version hợp lệ).
  - `npm test test/core/workflow-registry.test.ts` (Xác thực registry nạp đủ workflows).
  - `npm test test/commands/workflow.test.ts` (Xác thực command workflow vận hành ổn định).
  - `npm test` (Kiểm tra toàn bộ test suite của repository).
- **Manual Checks & Consistency Audits**:
  - Chạy `diff -r assets/workflows .agents/workflows` để kiểm tra độ đồng bộ giữa thư mục assets và runtime agents.
