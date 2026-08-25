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

