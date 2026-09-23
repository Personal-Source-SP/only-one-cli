# Concept: No-Sleep / No Busy-Wait Execution Rule

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)

- **Bối cảnh & Điểm kích hoạt**: Các AI agents (Antigravity, Claude, Cursor) khi chờ một process dài hoặc một cổng mạng sẵn sàng, thường tự phát sinh chuỗi lệnh `sleep` lặp lại — hiện tượng này được gọi là "sleep spam".
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Agent lặp vòng `sleep N && check` thay vì dùng cơ chế chờ đơn lẻ có timeout xác định, dẫn đến busy-wait loop không kiểm soát được.
- **Nguyên nhân cốt lõi (Root Cause)**: Không có rule cứng nào cấm hành vi này. Agent suy luận rằng "chờ" đồng nghĩa với lặp `sleep`, vì đó là pattern phổ biến trong shell scripting thông thường.
- **Tác động (Impact / Blast Radius)**: Tốn tài nguyên terminal, block execution không cần thiết, làm tăng thời gian phản hồi, và tạo ra trải nghiệm kém tin cậy cho người dùng CLI.

### Goal (Mục tiêu Kỹ thuật Cần đạt)

- **Mục tiêu cốt lõi**: Cấm hoàn toàn `sleep` và busy-wait loops; định nghĩa rõ các alternative pattern được chấp thuận.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Rule file `03-execution-terminal.md` được tạo trong `assets/rules/`, format nhất quán với các rule hiện tại (`alwaysApply: true`, sectioned headers, imperative language).
  - Rule được đăng ký trong `assets/rules/index.ts` với đầy đủ `id`, `version`, `description`, `sourceFile`, `supportedTargets`.
  - Rule bao phủ 4 pattern thay thế (increase timeout, background process, one-shot port check, hard-stop on timeout).
  - `supportedTargets` bao gồm Antigravity, Claude, và Cursor — nhất quán với các rule hiện tại.

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Tạo file rule mới `assets/rules/03-execution-terminal.md`
  - Đăng ký rule vào `assets/rules/index.ts`
  - Nội dung rule: cấm `sleep`, cấm busy-wait polling loop, định nghĩa 4 alternative patterns được dùng thay thế
- **Explicit Out-of-Scope**:
  - Không thay đổi rule logic của các file hiện tại (`01-`, `02-`)
  - Không thêm unit test cho rule (rules là markdown, không cần test)
  - Không thay đổi cách CLI deploy/distribute rules (đó là behavior của `index.ts` hiện tại)
  - Không thêm linting hoặc CI check để enforce rule này tự động

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

- **Core Mechanism**:
  - Tạo một rule file mới `03-execution-terminal.md` với `alwaysApply: true` để rule này luôn được inject vào agent context, bất kể project type.
  - Rule có 2 phần chính:
    1. **Prohibition block**: NEVER/DO NOT — cấm rõ ràng `sleep` và busy-wait patterns.
    2. **Alternative patterns block**: MUST — 4 alternative được chấp thuận thay thế:
       - Tăng `block_until_ms` / execution timeout trực tiếp
       - Start true background process, inspect log ở một bước xác định sau
       - One-shot port/socket check bằng `wait-on`, `nc -z`, hoặc `curl --retry`
       - Hard-stop nếu quá timeout — báo trạng thái và hỏi người dùng
  - Đăng ký vào `index.ts` với `id: 'execution-terminal'`, `version: '0.0.1'`, tất cả targets.

- **Conceptual Flow / Domain Model**:

  ```
  Agent gặp tình huống "cần chờ"
        │
        ├─ Thời gian chờ có thể ước lượng?
        │     └─ YES → Tăng block_until_ms/timeout trực tiếp
        │
        ├─ Process cần chạy nền (async)?
        │     └─ YES → Start background process → inspect log tại 1 bước sau xác định
        │
        ├─ Chờ port/socket sẵn sàng?
        │     └─ YES → one-shot check (wait-on / nc -z / curl --retry) với timeout
        │
        └─ Vượt timeout mà không có kết quả?
              └─ STOP → Báo trạng thái hiện tại → Hỏi người dùng
  ```

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rule conflict tiềm năng**: Nếu một skill khác đang hướng dẫn dùng `sleep` (ví dụ: script CI legacy), rule này sẽ override. Cần xem xét trong `/only-one-plan` khi scan skill files.
- **Scope của "polling"**: Rule cần phân biệt rõ "busy-wait terminal polling" (cấm) với "cron/schedule polling qua tool system" (cho phép, vì đây là reactive wakeup, không phải sleep loop).
- **Edge case port check**: `wait-on` có thể chưa được cài trong một số project. Rule nên liệt kê fallback options (`nc -z`, `curl --retry`) để tránh bị hiểu là chỉ cho phép một tool cụ thể.
