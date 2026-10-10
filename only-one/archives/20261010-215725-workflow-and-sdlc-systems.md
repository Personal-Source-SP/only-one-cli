---
id: 20261010-215725-workflow-and-sdlc-systems
title: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Lanes, DAG Sub-agents & Governance
archived_at: 2026-10-10
status: active
references:
  - only-one/archives/20260824-103830-tui-modernization.md
  - only-one/archives/20260917-101800-refactor-dev-skills-standards.md
  - only-one/archives/20260917-105100-asset-versioning-and-sync-systems.md
  - only-one/archives/20260904-140500-mcp-registry-and-servers.md
  - only-one/archives/20260909-100058-cli-tooling-and-cocoindex-purge.md
affected_modules:
  - assets/skills
  - assets/workflows
  - assets/combos
  - .agents/workflows
  - .agents/skills
  - only-one/rules.md
---

# Archive: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Lanes, DAG Sub-agents & Governance

## 1. Problem Statement & Core Value (Bài toán & Giá trị Cốt lõi)

### 1.1. Core Problems
1. **Bệnh béo phì tài liệu & Phân mảnh nguồn chân lý**: Các quy trình trước đây sinh tài liệu dài dòng, rườm rà; file `walkthrough.md` gây trùng lặp lãng phí đĩa.
2. **Chi phí thời gian lớn cho Quick Tasks**: Các tác vụ nhỏ bị bắt buộc phải chạy qua 3 giai đoạn độc lập nặng nề.
3. **Thực thi tuần tự gây nghẽn (Sequential Bottleneck)**: `/only-one-apply` chạy từng file một khiến thời gian chờ lâu và làm đầy context window của Main Agent.
4. **Sycophancy (Bệnh nịnh bợ của AI)**: Agent dễ đồng thuận mù quáng trước các thiết kế kỹ thuật của người dùng, bỏ lọt lỗi kiến trúc.
5. **Vi phạm ranh giới vòng đời (Lifecycle Drift)**: Debug tự ý sửa code sản phẩm; review không có định dạng thực thi chuẩn.

### 1.2. Core Value & Solutions
1. **Gateway Router (`/only-one`)**: Triage ý đồ của người dùng, kiểm tra trạng thái workspace và tự động điều hướng sang workflow chuyên biệt phù hợp nhất.
2. **Phân cấp 3 Làn Thực Thi SDLC**:
   - **Standard Lane (`/only-one-idea` $\rightarrow$ `/only-one-plan` $\rightarrow$ `/only-one-apply` $\rightarrow$ `/only-one-clean`)**:
     - Chuẩn hóa **3 Sections Tinh gọn** cho `plan.md` & `debug.md`:
       + *Section 1*: Directory Structure Changes (Sơ đồ cây ASCII kèm Action Tags `[NEW]`, `[MODIFY]`, `[DELETE]`).
       + *Section 2*: Machine-Readable File Task Blocks (heading `### <order>. [<ACTION>] <path>`, metadata chuẩn `Status`, `Context`, `Target Symbols`, `Invariants`, `Depends On`, `Fast Test Command`, `Ponytail checklist`, và Git-standard Unified Diff).
       + *Section 3*: Test Cases & Verification Evidence.
     - **Strict Two-File Task Invariant**: Mỗi folder task chỉ chứa duy nhất `concept.md` và `plan.md`/`debug.md`. Nghiêm cấm tạo `walkthrough.md` trên đĩa.
   - **Fast-Track Lane (`/only-one-flash`)**:
     - Xử lý tác vụ nhỏ, hotfix với **Zero Disk Plan Footprint** (không tạo folder task hay markdown trên đĩa).
     - Kế hoạch trình bày trực tiếp qua chat, có Review Gate bắt buộc ở Step 2 trước khi sửa code ở Step 3.
   - **Strict Lifecycle RCA Lane (`/only-one-debug`)**:
     - Tuân thủ nghiêm ngặt 2 pha: Pha 1 chẩn đoán lỗi, dựng Red feedback loop, lập kế hoạch vá trong `debug.md` và **dừng lại tại Review Gate (Zero Direct Code Modifications)**; Pha 2 giao cho `/only-one-apply` thực thi.
3. **Cơ chế Thực thi Song song Sub-agent theo DAG trong `/only-one-apply`**:
   - **DAG Wave Partitioning**: Tự động phân tích trường `Depends On` để nhóm các task độc lập thành các Execution Waves.
   - **Disjoint File Invariant**: Chặn tuyệt đối 2 Sub-agents sửa chung 1 file cùng lúc.
   - **Parallel Dispatch & Barrier Synchronization**: Spawn 3-4 Sub-agents chạy song song cho mỗi wave, đồng bộ hóa kết quả trước khi sang wave tiếp theo.
4. **Chống Nịnh bợ & Tư duy Phản biện (`sparring-partner`)**:
   - Ép Agent loại bỏ các câu khen ngợi sáo rỗng (*Zero Sycophantic Fillers*), áp dụng rubric 5 trục kỹ thuật (Boundary conditions, Simplicity, Blast radius, Concurrency, Security) và đưa phương án thay thế tối ưu hơn trước khi đồng thuận.
5. **Kỷ luật Trình bày & Viết chuẩn Hàng không**:
   - `i-have-adhd`: Presentation adapter định hình phản hồi hành động trước, trực quan và ngắn gọn.
   - `karpathy-ste100-discipline`: 4 Kỷ luật Thực thi (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution) kết hợp tiêu chuẩn 70% ASD-STE100 (câu chỉ dẫn <= 25 từ, câu mô tả <= 30 từ, cấu trúc Prerequisites -> Action -> Verification).
   - `ponytail`: Thẩm định giải pháp tối thiểu đủ dùng (First sufficient solution rung) và ưu tiên tái sử dụng (Reuse-first).

---

## 2. Key Architecture & Workflows Matrix

| Workflow | Vai trò & Trọng trách Cốt lõi | Input & Artifacts |
| :--- | :--- | :--- |
| **`/only-one`** | Gateway router, triage ý đồ & điều hướng | Input tự do $\rightarrow$ gợi ý workflow đích |
| **`/only-one-idea`** | Senior BA (Problem Discovery) & Tech Lead (Solution Architecture, UI Mockup, Trade-offs) | `concept.md` (SSOT cho What & Why) |
| **`/only-one-plan`** | Architect phân tích codebase & lập kế hoạch 3 sections diff-centric | Ingest `concept.md` $\rightarrow$ `plan.md` |
| **`/only-one-apply`** | Senior Engineer thực thi DAG waves song song với Sub-agents & Fast Tests | Ingest `plan.md`/`debug.md` $\rightarrow$ Code & Verification |
| **`/only-one-flash`** | Fast-track hotfix & quick tasks với Review Gate | Zero Disk Plan (In-chat plan & direct apply) |
| **`/only-one-debug`** | Điều tra RCA cơ học, dựng Red feedback loop, lập kế hoạch vá (Strict Lifecycle Isolation) | `debug.md` (Zero direct source edits) |
| **`/only-one-review`** | Chuẩn hóa kết quả Open CodeReview (OCR) thành executable findings | `review.md` $\rightarrow$ multi-select apply |
| **`/only-one-conflict`** | Giải quyết xung đột git merge/rebase theo từng hunk an toàn | Conflict hunks $\rightarrow$ clean resolution |
| **`/only-one-clean`** | Tự động archive task hoàn thành, đối soát code thực tế & thanh lọc tài liệu | Purge task folder $\rightarrow$ Consolidated Living Archives |

---

## 3. Verification Evidence
- Toàn bộ workflows và kỹ năng đồng bộ 100% giữa `assets/` và `.agents/`.
- 100% test suites vượt qua: `test/core/workflow-registry.test.ts`, `test/core/skill-registry.test.ts`, và full `npm test` (242 tests passed).
