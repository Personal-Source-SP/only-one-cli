---
id: 20260917-113200-workflow-and-sdlc-systems
title: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Fast-Track (Flash), Strict Lifecycle Debug & Governance
archived_at: 2026-09-17
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
  - assets/mcps
  - assets/combos
  - .agents/workflows
  - .agents/skills
  - src/core/templates
  - src/core/combo
  - test/core
  - only-one/rules.md
---

# Archive: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Fast-Track (Flash), Strict Lifecycle Debug & Governance

## 1. Problem Statement & Core Value (Bài toán & Giá trị Cốt lõi)

### 1.1. Core Problems (Vấn đề Cốt lõi)
1. **Bệnh béo phì tài liệu & Phân mảnh nguồn chân lý (Documentation Bloat & Fragmented Truth)**:
   - Các quy trình trước đây sinh tài liệu rườm rà, nhồi nhét văn xuôi lý thuyết vào `concept.md` và `plan.md`.
   - File riêng biệt `walkthrough.md` trên đĩa trùng lặp hơn 80% với `plan.md`.
2. **Chi phí thời gian và disk footprint lớn cho Quick Tasks**:
   - Các tác vụ nhỏ, hotfixes hoặc tinh chỉnh 1–2 file bị bắt buộc phải chạy qua 3 giai đoạn độc lập (`/only-one-idea` $\rightarrow$ `/only-one-plan` $\rightarrow$ `/only-one-apply`), sinh các file markdown dài và folder `only-one/tasks/` không cần thiết.
3. **Vi phạm ranh giới vòng đời trong Debug (Lifecycle Boundary Violation)**:
   - `/only-one-debug` trước đây tự ý sửa đổi code sản phẩm ngay trong quá trình điều tra, bỏ qua Review Gate của developer và xâm lấn trách nhiệm của `/only-one-apply`.
   - Cấu trúc `debug.md` chưa được chuẩn hóa rõ ràng giữa phân tích nguyên nhân cơ học (RCA) và mô tả chi tiết code changes kèm Unified Diff.
4. **Bỏ sót Task Debug khi Dọn dẹp**:
   - `only-one-clean` trước đây chỉ quét `plan.md`, bỏ sót các task `debug.md` (`status: fixed`).

### 1.2. Core Value & Solutions (Giá trị Cốt lõi & Giải pháp)
1. **Phân cấp 2 Làn Thực Thi SDLC (Standard Lane vs Fast-Track Lane)**:
   - **Standard Lane (Medium/Large Features & Refactor)**: Quy trình 3 bước chuẩn:
     + `/only-one-idea`: Single Source of Truth cho WHAT & WHY (`concept.md`).
     + `/only-one-plan`: 5 sections tinh gọn (`plan.md` với Task Matrix & Unified Diff, không duplicate concept).
     + `/only-one-apply`: Thực thi từng file theo dependency order và test verification.
     + **Strict Two-File Task Invariant**: Mỗi thư mục task chỉ duy trì duy nhất `concept.md` và `plan.md`. Triệt tiêu hoàn toàn `walkthrough.md` trên đĩa.
   - **Fast-Track Lane (`/only-one-flash` cho Quick Tasks & Hotfixes)**:
     + Thực thi tác vụ nhỏ, hotfixes với **Zero Disk Plan Footprint** (không sinh thư mục `only-one/tasks/` hay tệp markdown trên đĩa).
     + **Ultra-Clean In-Chat Plan**: Trình bày rõ ràng gồm **Mô tả** (hỗ trợ bullet points con khi có nhiều ý), **Target Structure** (sơ đồ cây ASCII trực quan có Action Tags `[MODIFY]`, `[NEW]`, `[DELETE]`, `[RENAME]` kèm `# Seam: ...`), và **Verification** (lệnh test/build).
     + **Mandatory Confirmation Review Gate**: Bắt buộc tạm dừng tại Step 2 để người dùng xem xét, trao đổi và xác nhận trước khi thực hiện Step 3 (Direct Strict Apply).
2. **Quy trình Debug 2 Pha Chuẩn Mực & Strict Lifecycle Isolation**:
   - **Pha 1 (`/only-one-debug`)**: Dựng Red feedback loop (test tái hiện lỗi), phân tích Mechanical Root Cause & Violated Invariants, phác thảo Target Source Structure, thiết lập Task Matrix và Unified Diff chi tiết trong `debug.md`, sau đó **DỪNG LẠI TẠI REVIEW GATE (Zero Direct Code Modifications)**.
   - **Pha 2 (`/only-one-apply`)**: Tiếp nhận `debug.md`, áp dụng diffs theo thứ tự phụ thuộc, chạy test chống hồi quy (chuyển Red $\rightarrow$ Green), cập nhật Section 5 và đánh dấu `status: fixed`.
   - **Chuẩn hóa 5 Section cho `debug.md`**:
     + Section 1: Symptom & Red Feedback Loop.
     + Section 2: RCA & Proposed Solution (2.1 Mechanical Root Cause & Invariants; 2.2 Core Fix Mechanism & Target Structure).
     + Section 3: Machine-Readable Task Matrix & Dependency Graph.
     + Section 4: Code Changes (Unified Diff & Chi tiết thay đổi: Action, Rationale, AST Seams).
     + Section 5: Verification & Regression Guard.
3. **Quét Task Đa hình trong Auto-Archive (`task-lifecycle-resolution`)**:
   - Step 0 của `only-one-clean` tự động nhận diện cả `plan.md` (`status: done`) và `debug.md` (`status: fixed`), chắt lọc negative rules vào `only-one/rules.md`, sinh archive chuẩn và xóa raw task folder; đồng thời bảo vệ các active tasks (`in-progress`, `planned`, `diagnosing`, `planning`).

---

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)

### 2.1. Ma trận Phân loại Workflow SDLC

| Workflow | Mục đích | Output Artifacts | Vòng lặp Kiểm thử |
| :--- | :--- | :--- | :--- |
| **`/only-one-idea`** | Khảo sát nhu cầu, mô hình hóa domain, chốt phạm vi | `only-one/tasks/<slug>/concept.md` | Non-code (Review Gate) |
| **`/only-one-plan`** | Thiết kế kỹ thuật, Task Matrix, Unified Diff | `only-one/tasks/<slug>/plan.md` | Non-code (Review Gate) |
| **`/only-one-apply`** | Áp dụng plan/debug theo Task Matrix | Cập nhật Section 5 `plan.md` / `debug.md` | Fast Test Command từng file |
| **`/only-one-flash`** | Sửa đổi nhỏ, hotfix nhanh kèm Review Gate | In-Chat Plan (Zero Disk Doc) | Fast Test / Build Command |
| **`/only-one-debug`** | Điều tra, RCA, dựng Red loop & lập patch plan | `only-one/tasks/<slug>/debug.md` | Red Test Loop (Review Gate) |
| **`/only-one-clean`** | Auto-archive task, đối soát codebase, dọn dẹp | `only-one/archives/<domain>.md` | Source-Driven Audit |

### 2.2. Sơ đồ Vận hành Tổng thể

```mermaid
flowchart TD
    subgraph FastTrack["⚡ Fast-Track Lane (Micro-changes & Hotfixes)"]
        F1["/only-one-flash"] --> F2["Rapid Ingestion & Reuse-First Audit"]
        F2 --> F3["In-Chat Plan (Mô tả, Target, Verification)"]
        F3 --> F4["🛑 Confirmation Review Gate (Pause)"]
        F4 -->|Confirmed| F5["Direct Apply & Fast Verification"]
    end

    subgraph StandardSDLC["🏗️ Standard SDLC Lane (Features & Refactors)"]
        S1["/only-one-idea"] -->|concept.md| S2["/only-one-plan"]
        S2 -->|plan.md| S3["/only-one-apply"]
        S3 -->|plan.md done| S4["/only-one-clean"]
    end

    subgraph DebugLane["🩺 Debugging Lane (Strict Lifecycle Isolation)"]
        D1["/only-one-debug"] -->|debug.md (Red Loop + RCA + Diffs)| D2["🛑 Review Gate (Hard Stop)"]
        D2 -->|Review Approved| S3
        S3 -->|debug.md fixed (Green Loop)| S4
    end

    S4 -->|Auto-Archive| A["only-one/archives/*.md & rules.md"]
```

---

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)

- [assets/workflows/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/index.ts): Đăng ký đầy đủ 11 workflows chuẩn (`only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-flash` v0.0.3, `only-one-debug` v0.0.4, `only-one-review`, `only-one-conflict`, `only-one-clockify`, `only-one-intranet`, `only-one-pr-git`, `only-one-clean`).
- [assets/combos/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/combos/index.ts): Tích hợp `only-one-flash` vào toàn bộ các combo `frontend-flow`, `backend-flow`, `full-sdlc-flow`.
- [assets/workflows/only-one-flash.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-flash.md) & [.agents/workflows/only-one-flash.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-flash.md): Định nghĩa workflow fast-track kèm Confirmation Review Gate tại Step 2.
- [assets/workflows/only-one-debug.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md) & [.agents/workflows/only-one-debug.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/.agents/workflows/only-one-debug.md): Quy trình RCA khép kín, cô lập vòng đời và dừng tại Review Gate.
- [assets/workflows/only-one-apply.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md): Hỗ trợ thực thi đa tài liệu (`plan.md` và `debug.md`).
- [only-one/rules.md](file:///Users/kiem/Sources/PERSONAL/only-one-cli/only-one/rules.md): Cập nhật negative rules cho `only-one-flash` (Zero Disk Plan Footprint + Confirmation Review Gate), anti-concept-duplication, và `only-one-debug` lifecycle isolation.

---

## 4. Verification Evidence (Bằng chứng Nghiệm thu)

- **Trạng thái Test**:
  - `npm test`: 55 test files, 231 tests passed (100% Pass).
  - `npm run format:check && npm run build`: 0 errors.
