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



