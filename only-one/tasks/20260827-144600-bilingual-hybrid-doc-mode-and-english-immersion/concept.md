# Concept: Chế độ Tài liệu Song ngữ Lai & Lộ trình Tiếp thu Tiếng Anh Tăng dần (Bilingual Hybrid Doc Mode & Progressive English Immersion)

## 1. Problem Statement & Root Need
- **Core Business Problem**:
  - Toàn bộ tài liệu quy trình (`concept.md`, `plan.md`, `walkthrough.md`, `archives/*.md`) hiện tại đang được mặc định viết bằng 100% tiếng Anh nguyên khối.
  - Đối với lập trình viên đang trong giai đoạn bắt đầu học tiếng Anh, việc này tạo ra **gánh nặng nhận thức quá mức (excessive cognitive load)**, làm giảm tốc độ nắm bắt logic kỹ thuật, tăng nguy cơ hiểu sai yêu cầu và gây nản lòng khi đọc hiểu các kế hoạch dài.
  - Tuy nhiên, nếu chuyển đổi 100% sang tiếng Việt thuần túy, lập trình viên sẽ mất đi cơ hội tiếp xúc với các thuật ngữ chuẩn ngành quốc tế và không cải thiện được trình độ ngoại ngữ.
- **Target Audience & Core Value**:
  - Dành cho các lập trình viên muốn vừa làm việc hiệu quả, hiểu sâu 100% kiến trúc dự án, vừa tiếp thu tiếng Anh kỹ thuật một cách tự nhiên, không áp lực.

## 2. Scope Boundaries
- **In-Scope**:
  - **Mô hình Song ngữ Lai (Bilingual Hybrid Documentation)**:
    - Ngôn ngữ diễn giải logic, nghiệp vụ, phân tích rủi ro trong tất cả các file docs (`concept.md`, `plan.md`, `walkthrough.md`, `archives/*.md`) được viết bằng **Tiếng Việt trong sáng, dễ hiểu**.
    - Các thuật ngữ kỹ thuật chuyên ngành (**technical terms**), từ khóa kiến trúc (**architectural keywords**), tên biến/hàm/interface, đường dẫn file, lệnh terminal (**CLI commands**) và mã nguồn được giữ nguyên bằng **Tiếng Anh kèm từ gốc trong ngoặc đơn**.
  - **Tối ưu hóa Section 6 / Section 7 (Technical English Key Patterns)**:
    - Luôn có phần giải nghĩa tiếng Việt chi tiết, phân tích ngữ pháp trực quan và ví dụ thực tế gắn liền với task đang làm.
  - **Cơ chế Tích lũy Tri thức Tiếng Anh Tự động (`only-one/learn/`)**:
    - Khi chạy `/only-one-archive`, tự động trích xuất các mẫu câu, thuật ngữ và cấu trúc đã học vào các chủ đề trong thư mục `only-one/learn/` (ví dụ: `git.md`, `architecture.md`, `debugging.md`).
  - **Cập nhật quy chuẩn trong toàn bộ Workflows ([assets/workflows/](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows))**.
- **Explicit Out-of-Scope**:
  - Không dịch tiếng Việt cho các tên mã nguồn, tên class, type, enum, file path hoặc commit message Git.
  - Không ép buộc người dùng phải gõ prompt bằng tiếng Anh khi tương tác với Agent.

## 3. Success Metrics (Definition of Done)
- **SM1**: 100% các file hướng dẫn Workflow trong `assets/workflows/` và `.agents/workflows/` cập nhật chỉ dẫn định dạng tài liệu sang chế độ **Bilingual Hybrid**.
- **SM2**: Lập trình viên đọc hiểu nhanh toàn bộ bản kế hoạch mà không cần dùng đến công cụ dịch bên ngoài, đồng thời nắm bắt được tối thiểu 2–3 thuật ngữ/mẫu câu tiếng Anh mới sau mỗi task.
- **SM3**: Thư mục `only-one/learn/` tự động lưu trữ và phân loại các mẫu câu tiếng Anh sau khi archive task.

## 4. Proposed High-Level Approach
1. **Chuẩn hóa Hướng dẫn Ngôn ngữ trong Workflows**:
   - Cập nhật mục `### Language` trong `/only-one-idea`, `/only-one-plan`, `/only-one-apply`, `/only-one-debug`, `/only-one-review`, `/only-one-archive` sang chuẩn:
     > *"Viết nội dung tài liệu bằng tiếng Việt làm ngôn ngữ diễn giải chính, kết hợp giữ nguyên thuật ngữ chuyên ngành và mã nguồn bằng tiếng Anh."*
2. **Nâng cấp Cơ chế Trích xuất Sổ tay Học tập (`only-one/learn/`)**:
   - Tự động gom góp các kiến thức tiếng Anh theo từng chủ đề để lập trình viên có thể mở ra ôn tập bất kỳ lúc nào.

## 7. Technical English Key Patterns
### 1. Progressive immersion
- **Meaning (VI)**: Phương pháp tiếp cận thẩm thấu/nhúng ngôn ngữ tăng dần theo từng cấp độ; không gây sốc tâm lý cho người học.
- **Grammar / Usage**: `[Adjective] immersion` $\rightarrow$ Sự nhúng chìm/thẩm thấu có lộ trình.
- **Engineering Example**:
  > *"Adopting progressive immersion enables developers to absorb technical English naturally without cognitive burnout."*

### 2. Cognitive load
- **Meaning (VI)**: Gánh nặng nhận thức; tổng lượng năng lượng tâm trí mà não bộ phải sử dụng để xử lý và hiểu thông tin.
- **Grammar / Usage**: `[Adjective] load` $\rightarrow$ Tải trọng nhận thức.
- **Engineering Example**:
  > *"Bilingual hybrid documentation significantly reduces cognitive load while preserving core technical keywords."*

### 3. Dual-language scaffolding
- **Meaning (VI)**: Giàn giáo hỗ trợ song ngữ; kỹ thuật dùng tiếng mẹ đẻ làm bệ đỡ để từng bước xây dựng năng lực ngoại ngữ chuyên ngành.
- **Grammar / Usage**: `Dual-language [Noun]` $\rightarrow$ Cấu trúc bệ đỡ song ngữ.
- **Engineering Example**:
  > *"The workflow provides dual-language scaffolding, ensuring complete technical clarity while fostering vocabulary acquisition."*
