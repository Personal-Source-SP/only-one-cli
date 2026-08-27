# Concept: Tối ưu hóa và Tinh gọn Hệ thống Workflows & Skills Catalog

## 1. Problem Statement & Root Need
- **Core Business Problem**:
  - Hệ thống `only-one-cli` đang tích hợp song song các bộ kỹ năng từ `addyosmani/agent-skills` và `mattpocock/skills`.
  - Một số kỹ năng có sự trùng lặp về chức năng (như `interview-me` vs `grill-me`, `spec-driven-development` vs `plan.md`, `debugging-and-error-recovery` vs `diagnosing-bugs`) khiến AI Agent dễ bị phân vân, thiếu phân định rõ ràng về vai trò chính (Primary) và bổ trợ (Specialist).
  - Thiếu một số quy trình thực chiến giá trị cao từ Matt Pocock như: đồng bộ Living Domain Glossary (`CONTEXT.md`), giải quyết xung đột Git theo ý định (`resolving-merge-conflicts`), nén phiên làm việc khi chuyển session (`handoff`), và cơ chế Task Graph với Blocking Edges (`to-tickets`).
- **Target Audience & Core Value**:
  - Dành cho các kỹ sư phần mềm sử dụng `only-one-cli` để pair-programming với AI Agent.
  - Mang lại quy trình khép kín, mạch lạc, không chồng chéo, loại bỏ triệt để hiện tượng "đoán mò", "nhảy cóc task" hoặc "ô nhiễm ngữ cảnh review".

## 2. Scope Boundaries
- **In-Scope**:
  - **Tái cấu trúc Skills Catalog ([assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts))**: Phân tầng 5 giai đoạn (Define $\rightarrow$ Plan $\rightarrow$ Build $\rightarrow$ Verify/Debug $\rightarrow$ Review/Ship), giữ nguyên và tối ưu hóa `grill-me`, `grill-with-docs`, loại bỏ `spec-driven-development` bị trùng lặp, thêm `resolving-merge-conflicts`, `handoff`, `prototype`, `wizard`.
  - **Nâng cấp các Workflow hiện hữu**:
    - `/only-one-idea`: Tích hợp `grill-with-docs` để cập nhật `CONTEXT.md` & `only-one/adrs/`.
    - `/only-one-plan`: Tích hợp `to-tickets` (bổ sung thuộc tính `depends_on` / blocking edges) và cổng phản biện đối kháng `doubt-driven-development`.
    - `/only-one-apply`: Tối ưu hóa lát cắt mỏng (`incremental-implementation`) và vòng lặp TDD (Beyoncé Rule).
    - `/only-one-debug`: Bắt buộc quy trình **Red Feedback Loop** từ `diagnosing-bugs`.
    - `/only-one-review`: Cấu trúc lại 5 trục review và hướng dẫn sử dụng mô hình Multi-subagents song song.
  - **Tạo 2 Workflows mới**:
    - `/only-one-handoff`: Nén context chuyển giao session.
    - `/only-one-conflict`: Xử lý xung đột Git theo ý định gốc từng hunk.
  - **Cập nhật Index ([assets/workflows/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/index.ts))** và đồng bộ sang `.agents/` runtime.
- **Explicit Out-of-Scope**:
  - Không thay đổi tên hay cú pháp của các slash command cốt lõi hiện có.
  - Không thay đổi cấu trúc lưu trữ thư mục task `only-one/tasks/<YYYYMMDD-HHmmss>-<slug>/`.
  - Không thay đổi logic của các công cụ MCP bên ngoài (`clockify`, `zodinet-timesheet`).

## 3. Success Metrics (Definition of Done)
- **SM1**: Toàn bộ codebase TypeScript biên dịch thành công (`npm run build`) với exit code 0, không có lỗi linter/typechecker.
- **SM2**: `assets/skills/index.ts` phân định rõ ràng 5 tầng vòng đời phần mềm và gán nhãn rõ ràng mục đích kích hoạt cho từng skill.
- **SM3**: Tất cả các file Markdown trong `assets/workflows/` và `.agents/workflows/` có cú pháp YAML frontmatter chuẩn, liên kết hợp lệ và đầy đủ hướng dẫn thực thi.
- **SM4**: 100% các cặp skill tương đương được phân định rõ ràng khi nào kích hoạt cái nào (Trigger Condition).

## 4. Proposed High-Level Approach
- Tinh gọn hóa danh mục kỹ năng bằng cách hợp nhất và phân tầng:
  - Giữ lại `grill-with-docs` (ghi file `CONTEXT.md`) và `grill-me` (phản biện nhanh không tạo file rác) làm hai trụ cột tương tác trong Define & Plan.
  - Loại bỏ các skill trùng lặp hình thức như `spec-driven-development` vì `concept.md` và `plan.md` đã đảm nhiệm xuất sắc.
  - Bổ sung `to-tickets` vào `/only-one-plan` để tạo graph phụ thuộc giữa các file cần sửa.
  - Áp dụng mô hình Sub-agents độc lập cho `/only-one-review` để tránh context bleed.

## 7. Technical English Key Patterns
### 1. Functional overlap
- **Meaning (VI)**: Sự trùng lặp về mặt chức năng/vai trò giữa hai hay nhiều thành phần.
- **Grammar / Usage**: `[Adjective] overlap` $\rightarrow$ Sự chồng chéo về thuộc tính hoặc tính năng.
- **Engineering Example**:
  > *"We resolved the functional overlap between redundant skills by clearly delineating their distinct trigger conditions."*

### 2. Living Domain Glossary
- **Meaning (VI)**: Bảng từ điển thuật ngữ nghiệp vụ sống; liên tục được cập nhật và làm giàu trong suốt vòng đời dự án.
- **Grammar / Usage**: `[Adjective] [Noun Phrase]` $\rightarrow$ Tài liệu tri thức động.
- **Engineering Example**:
  > *"Maintaining a living domain glossary in `CONTEXT.md` prevents agents from hallucinating domain terminology across tasks."*

### 3. Context bleed
- **Meaning (VI)**: Hiện tượng ô nhiễm/rò rỉ ngữ cảnh; khi một tác vụ bị ảnh hưởng thiên lệch bởi thông tin của một tác vụ khác trong cùng một phiên xử lý.
- **Grammar / Usage**: `[Noun] bleed` $\rightarrow$ Hiện tượng tràn/lan ngữ cảnh không mong muốn.
- **Engineering Example**:
  > *"Running review subagents in parallel isolated contexts eliminates context bleed between spec auditing and code style checking."*
