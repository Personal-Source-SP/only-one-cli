# Learning Notes: Architecture & System Design

> Collection of technical English structures, expressions, and vocabulary extracted from task workflows.

## Patterns & Expressions

### 1. To decouple [A] from [B]
- **Meaning (VI)**: Tách rời / giảm bớt sự phụ thuộc lẫn nhau giữa thành phần A và thành phần B để tăng tính độc lập và module hóa.
- **Grammar / Usage**: `decouple [Component A] from [Component B]`
- **Engineering Example**:
  > *"We introduced an event-driven architecture to decouple the notification worker from the core payment service."*
- **Origin Task**: Initial Seed

### 2. To encapsulate [something] within [boundary]
- **Meaning (VI)**: Đóng gói và ẩn giấu chi tiết xử lý nội bộ bên trong một ranh giới/module cụ thể.
- **Grammar / Usage**: `encapsulate [implementation details] within [module / service]`
- **Engineering Example**:
  > *"The service layer encapsulates complex database queries within clean domain interfaces."*
- **Origin Task**: Initial Seed

### 3. To yield higher throughput at the cost of [trade-off]
- **Meaning (VI)**: Đạt được thông lượng cao hơn nhưng phải đánh đổi bằng [độ phức tạp / bộ nhớ...].
- **Grammar / Usage**: `yield [benefit] at the cost of / at the expense of [trade-off]`
- **Engineering Example**:
  > *"Asynchronous processing yields higher throughput at the cost of eventual consistency."*
- **Origin Task**: Initial Seed

### 4. To eliminate race conditions across [nested components]
- **Meaning (VI)**: Triệt tiêu các điều kiện tranh chấp (race condition) giữa các component lồng nhau thông qua cơ chế khóa focus hoặc router điều hướng tập trung.
- **Grammar / Usage**: `eliminate race conditions across [subsystems / components / handlers]`
- **Engineering Example**:
  > *"We centralized input handling into a router context to eliminate race conditions across nested terminal components."*
- **Origin Task**: `20260824-103830-tui-modernization`

### 5. To mitigate [undesired behavior] through [technique]
- **Meaning (VI)**: Giảm thiểu / hạn chế hành vi không mong muốn (ví dụ: giật màn hình, nghẽn mạng) bằng một kỹ thuật cụ thể.
- **Grammar / Usage**: `mitigate [issue] through / by [optimization technique]`
- **Engineering Example**:
  > *"The layout memoizes preview cards to mitigate screen flickering during rapid cursor navigation."*
- **Origin Task**: `20260824-103830-tui-modernization`

### 6. Seam-driven architecture
- **Meaning (VI)**: Kiến trúc phân ranh giới rõ ràng; chia tách hệ thống tại các điểm nối (seams) tự nhiên để tối đa hóa khả năng kiểm thử độc lập và module hóa.
- **Grammar / Usage**: `[Adjective]-driven [Noun]` — Mô hình thiết kế lấy ranh giới/đường nối làm trọng tâm.
- **Engineering Example**:
  > *"By placing the database adapter behind a clean interface, we created an easily testable seam-driven architecture."*
- **Origin Task**: `20260827-142500-optimize-workflows-skills-catalog`

### 7. Dual-layer architecture
- **Meaning (VI)**: Kiến trúc tài liệu 2 lớp; phân tách rõ ràng giữa lớp thân thiện với con người (Human-friendly) và lớp ma trận tối ưu hóa cho máy/AI (Machine-readable) bóc tách nhanh.
- **Grammar / Usage**: `Dual-layer [Noun]` — Cấu trúc phân tách 2 tầng.
- **Engineering Example**:
  > *"Adopting a dual-layer architecture bridges human cognitive ergonomics and machine parsing efficiency."*
- **Origin Task**: `20260827-144600-bilingual-hybrid-doc-mode-and-english-immersion`

### 8. Reuse-first invariant
- **Meaning (VI)**: Nguyên tắc bất biến ưu tiên tái sử dụng (không viết mới hay sinh mã nguồn dư thừa khi đã có sẵn).
- **Grammar / Usage**: `[Noun]-first [Noun]` — Bất biến lấy việc tái sử dụng làm trọng tâm.
- **Engineering Example**:
  > *"The **reuse-first invariant** prevents engineers and agents from re-implementing existing utilities."*
- **Origin Task**: `20260828-101523-codebase-structure-and-reuse-guardrails`

### 9. Defense-in-depth architecture
- **Meaning (VI)**: Kiến trúc phòng thủ theo chiều sâu; thiết lập nhiều lớp bảo vệ độc lập từ định hướng skill, lập kế hoạch đến thực thi.
- **Grammar / Usage**: `Defense-in-depth [Noun]` — Mô hình phòng thủ đa tầng.
- **Engineering Example**:
  > *"By applying **defense-in-depth**, we catch redundant code at the planning, skill guidance, and application stages."*
- **Origin Task**: `20260828-101523-codebase-structure-and-reuse-guardrails`

### 10. Pre-implementation audit
- **Meaning (VI)**: Bước kiểm toán / khảo sát mã nguồn có sẵn trước khi bắt tay vào triển khai thực tế.
- **Grammar / Usage**: `Pre-[Noun] [Noun]` — Khảo sát tiền triển khai.
- **Engineering Example**:
  > *"Performing a **pre-implementation audit** prevents redundant utilities from being created."*
- **Origin Task**: `20260828-101523-codebase-structure-and-reuse-guardrails`

### 11. Lazy-loading reference matrix
- **Meaning (VI)**: Ma trận điều hướng nạp tài liệu tham khảo theo nhu cầu nhằm tối ưu hóa context token cho AI Agent.
- **Grammar / Usage**: `Lazy-loading [Noun]` — Cơ chế nạp tài liệu tham chiếu chọn lọc.
- **Engineering Example**:
  > *"The **lazy-loading reference matrix** ensures agents inspect only relevant architecture references rather than polluting context."*
- **Origin Task**: `20260828-102831-standardize-nestjs-nextjs-skills`

### 12. Headless hook & UI separation
- **Meaning (VI)**: Kiến trúc phân tách giữa tầng logic/API (Headless Hook) và tầng trình diễn giao diện (UI Orchestration).
- **Grammar / Usage**: `Headless [Noun] & [Noun] separation` — Mô hình tách biệt logic và render.
- **Engineering Example**:
  > *"Adopting **headless hook & UI separation** keeps the main page component strictly focused on presentation layout below 200 lines."*
- **Origin Task**: `20260828-102831-standardize-nestjs-nextjs-skills`

### 13. Atomic Per-Component Versioning
- **Meaning (VI)**: Cơ chế định phiên bản độc lập ở cấp độ từng thành phần nguyên tử, ngăn chặn việc tăng version dây chuyền không cần thiết.
- **Grammar / Usage**: `Adjective phrase` bổ nghĩa cho danh từ kiến trúc.
- **Engineering Example**:
  > *"Atomic per-component versioning ensures that hotfixing a single workflow manifest will not inflate the version counters of unrelated rules or packages."*
- **Origin Task**: `20260903-104500-asset-versioning-and-sync`

### 14. Base-10 / Decimal Rollover
- **Meaning (VI)**: Sự cuốn chiếu cơ số 10 (chạm ngưỡng 9 thì reset về 0 và tăng 1 đơn vị ở nấc cao hơn liền kề).
- **Grammar / Usage**: `Subject + rolls over to + Target`.
- **Engineering Example**:
  > *"Once the patch identifier reaches nine, it rolls over to zero and increments the minor version accordingly."*
- **Origin Task**: `20260903-104500-asset-versioning-and-sync`

### 15. Deterministic Path Resolution
- **Meaning (VI)**: Quá trình phân giải đường dẫn mang tính xác định tuyệt đối (không phụ thuộc vào fallback ngẫu nhiên hoặc các điều kiện phỏng đoán).
- **Grammar / Usage**: `Noun phrase`.
- **Engineering Example**:
  > *"Deterministic path resolution guarantees that all asset installation operations resolve to the exact same 'only-one/installed.json' location."*
- **Origin Task**: `20260903-105930-relocate-installed-lockfile-to-only-one`

### 16. Unified Schema Consolidation
- **Meaning (VI)**: Quá trình quy chuẩn hóa và hợp nhất các lược đồ dữ liệu phân mảnh vào một lược đồ duy nhất.
- **Grammar / Usage**: `Noun phrase`.
- **Engineering Example**:
  > *"Unified schema consolidation avoids data drift by keeping version history and remote provenance within the same record."*
- **Origin Task**: `20260903-110500-consolidate-skills-lock-into-installed-json`

### 17. Backward-Compatible Adapter Layer
- **Meaning (VI)**: Tầng chuyển đổi tương thích ngược giúp giữ nguyên API hiện tại cho các callers mà không phải sửa đổi mã nguồn ở nhiều nơi.
- **Grammar / Usage**: `Adjective + Noun phrase`.
- **Engineering Example**:
  > *"The lockfile functions serve as a backward-compatible adapter layer, abstracting the underlying single lockfile format."*
- **Origin Task**: `20260903-110500-consolidate-skills-lock-into-installed-json`

