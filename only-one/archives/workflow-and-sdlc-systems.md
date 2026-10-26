---
id: workflow-and-sdlc-systems
title: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Lanes, DAG Sub-agents, 80% ASD-STE100 & Visual Diagrams
domain: workflow
triggers:
  - ".agents/workflows/**"
  - "assets/agents/workflows/**"
  - ".agents/skills/**"
  - "assets/agents/skills/**"
archived_at: 2026-10-27T00:03:00+07:00
status: active
references:
  - only-one/archives/tui-modernization.md
  - only-one/archives/refactor-dev-skills-standards.md
  - only-one/archives/asset-versioning-and-sync-systems.md
  - only-one/archives/mcp-registry-and-servers.md
  - only-one/archives/cli-tooling-and-cocoindex-purge.md
affected_modules:
  - assets/agents/skills
  - assets/agents/workflows
  - assets/agents/combos
  - assets/agents/rules
  - assets/agents/skills/only-one-apply
  - .agents/workflows
  - .agents/skills
  - test/skills
  - only-one/rules.md
---

# Archive: Kiến Trúc Hợp Nhất của Hệ Thống Workflows, SDLC Lanes, DAG Sub-agents, 80% ASD-STE100 & Visual Diagrams

## 1. Problem Statement & Core Value (Bài toán & Giá trị Cốt lõi)

### 1.1. Core Problems
1. **Bệnh béo phì tài liệu & Phân mảnh nguồn chân lý**: Các quy trình trước đây sinh tài liệu dài dòng, rườm rà; file `walkthrough.md` gây trùng lặp lãng phí đĩa.
2. **Kém hiệu quả khi diễn giải kiến trúc bằng văn xuôi**: Đọc khối chữ dài để hiểu tương tác đa module hay luồng lỗi dẫn tới hiểu sai và tốn token ngữ cảnh; thiếu sơ đồ trực quan.
3. **Văn phong rào đón & Bệnh nịnh bợ (AI Slop & Sycophancy)**: LLM thường dùng câu bị động, rào đón xã giao và dễ đồng thuận mù quáng trước thiết kế lỗi của con người.
4. **Chi phí thời gian lớn cho Quick Tasks**: Các tác vụ nhỏ bị bắt buộc phải chạy qua 3 giai đoạn độc lập nặng nề.
5. **Thực thi tuần tự gây nghẽn (Sequential Bottleneck)**: `/only-one-apply` chạy từng file một làm chậm tiến độ và phình to ngữ cảnh Main Agent.
6. **Vi phạm ranh giới vòng đời (Lifecycle Drift)**: Debug tự ý sửa code sản phẩm; review không có định dạng thực thi chuẩn.
7. **Báo cáo Hoàn thành Chat Tùy tiện & Khó Quét Mắt**: Khi `/only-one-apply` kết thúc, báo cáo chat quá sơ sài hoặc phân rã chi tiết từng file rườm rà, pha trộn tiếng Anh thiếu tự nhiên, làm chậm quá trình nghiệm thu.

### 1.2. Core Value & Solutions
1. **Direct Specialized Workflow Invocation**: Loại bỏ gateway router trung gian, cho phép kích hoạt trực tiếp các workflows chuyên biệt (`/only-one-idea`, `/only-one-plan`, `/only-one-apply`, `/only-one-flash`, `/only-one-debug`, `/only-one-review`, `/only-one-conflict`, `/only-one-clean`, `/only-one-pr-git`).
2. **Dedicated Persona & Authority Invariant**: Mỗi workflow tự định danh rõ Persona, Mindset, Allowed Actions và Forbidden Actions ngay trong phần `Role & Collaboration Model` (không tạo thư mục `.agents/agents/` ngoài luồng).
3. **Chuẩn hóa 100% Tiếng Anh Kỹ thuật**: Toàn bộ hướng dẫn, khuôn mẫu và chốt chặn trong workflow sử dụng 100% tiếng Anh chuẩn quốc tế.
4. **Kiến Trúc Bộ Nhớ Phân Tầng (Tiered Context System)**: Quản trị tri thức tinh gọn qua `only-one/INDEX.md`, `only-one/rules/<domain>.md` và `only-one/archives/`.
5. **Phân cấp 3 Làn Thực Thi SDLC**:
   - **Standard Lane (`/only-one-idea` $\rightarrow$ `/only-one-plan` $\rightarrow$ `/only-one-apply` $\rightarrow$ `/only-one-clean`)**:
     - Chuẩn hóa **3 Sections Tinh gọn** cho [`plan.md`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-plan.md) & [`debug.md`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md):
       + *Section 1*: Directory Structure Changes (Sơ đồ cây ASCII kèm Action Tags `[NEW]`, `[MODIFY]`, `[DELETE]`).
       + *Section 2*: Machine-Readable File Task Blocks (heading `### <order>. [<ACTION>] <path>`, metadata chuẩn `Status`, `Context`, `Target Symbols`, `Invariants`, `Depends On`, `Fast Test Command`, `Ponytail checklist`, và Git-standard Unified Diff).
       + *Section 3*: Test Cases & Verification Evidence.
     - **Strict Two-File Task Invariant**: Mỗi thư mục task chỉ chứa duy nhất `concept.md` và `plan.md`/`debug.md`. Cấm tuyệt đối tạo `walkthrough.md` trên đĩa.
   - **Fast-Track Lane (`/only-one-flash`)**:
     - Xử lý tác vụ nhỏ, hotfix với **Zero Disk Plan Footprint** (không tạo thư mục task hay markdown trên đĩa).
     - Kế hoạch trình bày trực tiếp qua chat, có Review Gate bắt buộc ở Step 2 trước khi sửa code ở Step 3.
   - **Strict Lifecycle RCA Lane (`/only-one-debug`)**:
     - Tuân thủ 2 pha tách biệt: Pha 1 chẩn đoán lỗi, dựng Red feedback loop, lập kế hoạch vá trong `debug.md` và dừng tại Review Gate (Zero Direct Code Modifications); Pha 2 giao cho `/only-one-apply` thực thi.
6. **Mẫu Báo Cáo Hoàn Thành Tinh Gọn 4 Mục (Crisp In-Chat Completion Report)**:
   - Chuẩn hóa Step 5 của `only-one-apply` với 4 mục súc tích bằng tiếng Việt:
     1. Cấu trúc source thay đổi (cây thư mục trực quan kèm tag `[NEW]`, `[MODIFY]`, `[DELETE]`).
     2. Các công việc đã xử lý (tóm tắt toàn bộ tiến trình thay vì mô tả rời rạc theo file).
     3. Nghiệm thu & Kiểm thử (trạng thái task `done`/`fixed` và kết quả test).
     4. Bước tiếp theo (gợi ý lệnh kế tiếp trên 1 dòng).
   - Bảo toàn triệt để invariant không sinh file `walkthrough.md` trên đĩa.
7. **Quy Chuẩn Viết 80% ASD-STE100 & Triệt Tiêu Thể Bị Động ([`karpathy-ste100-discipline`](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/karpathy-ste100-discipline/SKILL.md))**:
   - Khống chế trần từ: Câu chỉ dẫn $\le 20$ từ, câu mô tả/ngữ cảnh $\le 25$ từ.
   - Cấm triệt để thể bị động (*passive voice*); 100% sử dụng câu chủ động trực diện.
   - Cấu trúc 3 tầng: Prerequisites $\rightarrow$ Action $\rightarrow$ Verification.
8. **Bắt Buộc Trực Quan Hóa Bằng Sơ Đồ ([`c4-diagrams`](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/c4-diagrams/SKILL.md))**:
   - `concept.md`: Bắt buộc Mermaid Flowchart/State Diagram cho luồng dữ liệu nghiệp vụ và máy trạng thái.
   - `plan.md`: Bắt buộc C4 Component Diagram hoặc Mermaid Sequence Diagram khi có $\ge 2$ modules tương tác hoặc luồng bất đồng bộ.
   - `debug.md`: Bắt buộc Mermaid Failure Call Trace Diagram hoặc State Divergence Diagram chứng minh cơ học điểm gãy vỡ của hợp đồng hệ thống.
9. **Cơ chế Thực thi Song song Sub-agent theo DAG trong `/only-one-apply`**:
   - Phân tích trường `Depends On` để nhóm các task độc lập thành các Execution Waves.
   - Áp dụng **Disjoint File Invariant** ngăn chặn 2 Sub-agents sửa chung 1 file cùng lúc.
   - Parallel Dispatch với 3-4 Sub-agents chạy song song và Barrier Synchronization giữa các wave.
10. **Chống Nịnh bợ & Tư duy Phản biện ([`sparring-partner`](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/sparring-partner/SKILL.md))**:
   - Loại bỏ lời khen sáo rỗng (*Zero Sycophantic Fillers*), đánh giá rủi ro theo 5 trục kỹ thuật (Boundary conditions, Simplicity, Blast radius, Concurrency, Security) và đề xuất phương án thay thế tốt hơn trước khi đồng thuận.
11. **Kiến Trúc Dual-Engine Worktree & Rebase-First Guard ([`only-one-apply`](file:///d:/Sources/PERSONAL/only-one-cli/assets/agents/skills/only-one-apply/SKILL.md))**:
   - Hỗ trợ 2 chế độ thực thi: *Worktree Mode* (cô lập an toàn trên `.worktrees/<slug>` với junction symlinks liên kết `node_modules` và shared configs) và *In-Place Mode* (thực thi trực tiếp trên branch hiện tại).
   - Tự động hóa điều phối vòng đời worktree qua `assets/agents/skills/only-one-apply/scripts/worktree-runner.ts` và mẫu cấu hình `templates/worktreeinclude.template`.
   - Step 5b kích hoạt Rebase-First Guard tự động rebase lên upstream và chạy kiểm thử hồi quy trước khi merge thay đổi về nhánh chính.
12. **Section 1.5 Story Board & Trực Quan Hóa Từng Câu Chuyện (Visual Story Board)**:
   - Bắt buộc mỗi story trong `plan.md` phải có mục mô tả Before/After kèm theo một sơ đồ Mermaid biểu diễn sự khác biệt trạng thái hệ thống.
13. **Chu Trình Pragmatic TDD & Self-Healing Red Loop (`only-one-plan` & `only-one-apply`)**:
   - **Test-First Ordering**: Trong Section 2 của `plan.md`, các task block test (e.g. `*.test.ts`) bắt buộc phải xuất hiện trước task block triển khai code tương ứng. Linter `validate-plan.ts` tự động phát hiện vi phạm (`Pragmatic TDD violation`).
   - **Fast Test per File**: `only-one-apply` thực thi theo cặp test-code, chạy ngay `Fast Test Command` sau khi sửa file.
   - **Self-Healing Red Loop (Retry limit: 3)**: Khi test fail, hệ thống tự động phân tích stack trace và thử nghiệm chỉnh sửa tối đa 3 lần. Nếu sau 3 lần vẫn thất bại thì dừng lại và xin chỉ dẫn từ PM.
14. **Lá Chắn Cú Pháp Mermaid (Mermaid Lexer Shield)**:
   - Quote 100% nhãn node và subgraph, cấm dùng cú pháp trần `[/label]` để triệt tiêu lỗi token hình thang `TRAPSTART`. Thay thế ký tự `<` bằng `≤` để tránh lỗi parse unclosed HTML tag.

---

## 2. Key Architecture & Workflows Matrix

```mermaid
flowchart TD
    subgraph GOVERNANCE ["Governance & Quality Specifications"]
        STE100["karpathy-ste100-discipline\n(80% STE100, <=20/25 words, Active Voice)"]
        VisualStd["c4-diagrams\n(Mermaid/ASCII Architecture)"]
        Sparring["sparring-partner\n(5 Technical Risk Vectors)"]
        RepoRules["only-one/rules.md\n(Repository Negative Constraints)"]
    end

    subgraph SDLC_LANES ["SDLC Lanes Pipeline"]
        Router["/only-one (Gateway Router)"]
        
        subgraph STANDARD_LANE ["Standard 4-Phase Lane"]
            Idea["/only-one-idea\n(concept.md + Domain Diagrams)"]
            Plan["/only-one-plan\n(plan.md + C4/Sequence Diagrams)"]
            Apply["/only-one-apply\n(DAG Wave Sub-agents Execution)"]
            Clean["/only-one-clean\n(Auto-Archive & Codebase Purge)"]
        end
        
        subgraph FAST_LANE ["Fast-Track Hotfix Lane"]
            Flash["/only-one-flash\n(Zero Disk Plan Footprint + Review Gate)"]
        end
        
        subgraph RCA_LANE ["Diagnostic RCA Lane"]
            Debug["/only-one-debug\n(debug.md + Failure Call Trace)"]
        end
    end

        subgraph GIT_LANE ["Git & Release Lane"]
            PRGit["/only-one-pr-git\n(GitHub PR Creation via MCP)"]
            Conflict["/only-one-conflict\n(Hunk-by-hunk Conflict Resolution)"]
        end
    end

    User["User Intent"] --> StandardLane
    User --> FastLane
    User --> RCA_LANE
    User --> GIT_LANE
    Idea --> Plan --> Apply --> Clean
    Debug -.->|Approved Patch Plan| Apply
    STE100 -.-> StandardLane
    VisualStd -.-> StandardLane
    VisualStd -.-> Debug
```

### Bảng Ma trận Workflows

| Workflow | Vai trò & Trọng trách Cốt lõi | Input & Artifacts | Sơ đồ Trực quan Bắt buộc |
| :--- | :--- | :--- | :--- |
| **[`/only-one-idea`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-idea.md)** | Khám phá bài toán & kiến trúc giải pháp (BA & Architect) | `concept.md` (SSOT cho What & Why) | Flowchart / State Diagram |
| **[`/only-one-plan`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-plan.md)** | Lập kế hoạch 3 sections diff-centric (Architect & Planner) | Ingest `concept.md` $\rightarrow$ `plan.md` | C4 Component / Sequence ($\ge 2$ modules) |
| **[`/only-one-apply`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-apply.md)** | Thực thi DAG waves song song với Sub-agents (Dev & Lead) | Ingest `plan.md`/`debug.md` $\rightarrow$ Code | Execution Wave Graph |
| **[`/only-one-flash`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-flash.md)** | Fast-track hotfix & quick tasks với Review Gate | Zero Disk Plan (In-chat plan & apply) | ASCII Target Structure |
| **[`/only-one-debug`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-debug.md)** | RCA cơ học, Red feedback loop, plan vá (Investigator) | `debug.md` (Strict Lifecycle Isolation) | Mermaid Failure Call Trace |
| **[`/only-one-review`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-review.md)** | Chuẩn hóa kết quả Open CodeReview (OCR Reviewer) | `review.md` $\rightarrow$ multi-select apply | Không |
| **[`/only-one-conflict`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-conflict.md)** | Giải quyết xung đột git merge/rebase an toàn (Conflict Specialist) | Conflict hunks $\rightarrow$ clean resolution | Không |
| **[`/only-one-clean`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-clean.md)** | Tự động archive task, đối soát & thanh lọc (Archivist & Auditor) | Purge task folder $\rightarrow$ Living Archives | Không |
| **[`/only-one-pr-git`](file:///d:/Sources/PERSONAL/only-one-cli/assets/workflows/only-one-pr-git.md)** | Tạo GitHub PR từ Git state qua GitHub MCP (Release Engineer) | Git preflight $\rightarrow$ GitHub PR | Không |

---

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)

- [`assets/skills/karpathy-ste100-discipline/SKILL.md`](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/karpathy-ste100-discipline/SKILL.md): Nâng chuẩn 80% ASD-STE100, khống chế 20/25 từ, cấm thể bị động.
- [`assets/skills/only-one-apply/SKILL.md`](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/only-one-apply/SKILL.md): Tinh giản thực thi trực tiếp coder-first, bổ sung schema chuẩn mực cho Báo cáo Hoàn thành Chat tinh gọn 4 mục bằng tiếng Việt.
- [`test/skills/applyReportTemplate.test.ts`](file:///d:/Sources/PERSONAL/only-one-cli/test/skills/applyReportTemplate.test.ts): Unit test kiểm thử cấu trúc schema báo cáo 4 mục và kiểm tra độ dài câu theo tiêu chuẩn ASD-STE100.
- [`.agents/hooks/`](file:///d:/Sources/PERSONAL/only-one-cli/.agents/hooks/): Bổ sung 5 chốt chặn an toàn (`block-heavy-scripts.sh`, `no-secrets.sh`, `format-on-edit.sh`, `test-gate.sh`, `protect-configs.sh`).
- [`assets/combos/index.ts`](file:///d:/Sources/PERSONAL/only-one-cli/assets/combos/index.ts): Tích hợp hooks vào combo `only-one-flow` (v0.0.16).
- Hợp nhất toàn diện các workflows vào hệ thống Agent Skills (`assets/skills/only-one-*`), khai tử `.agents/workflows/`.

---

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu)

- **Trạng thái Test**: 100% Passed (Toàn bộ 72 test suites / 290 unit tests).
- **Format & Build**: `npm run format:check && npm run build` (passed, zero errors).
- **Đồng bộ**: 100% giữa `assets/` và `.agents/`.
