# Repository Negative Rules & Constraints

> File này được AI tự động đọc ở bước 1b của mọi workflow (`/only-one-plan`, `/only-one-apply`, `/only-one-idea`, `/only-one-debug`).

- **[NEVER]** Không di chuyển nguyên thư mục task thô vào `archives/`. Luôn chắt lọc thành 1 file Markdown duy nhất và xóa thư mục task thô để tránh biến `archives/` thành bãi rác tài liệu.
- **[NEVER]** Không chỉ kiểm tra sự tồn tại của file trong `/only-one-clean`. Bắt buộc phải đối soát chi tiết logic, hàm, contract, schema với codebase thực tế và xóa bỏ dứt điểm các tài liệu đã cũ/không còn đúng.
- **[ALWAYS]** Khai báo bảng `## 1. Skills Catalog` đầy đủ mô tả và trigger condition trong tất cả các file workflow `.md`.
- **[ALWAYS]** Lưu trữ toàn bộ bài học và điều cấm kỵ chắt lọc vào 1 file duy nhất `only-one/rules.md` tại root của `only-one/`.
- **[ALWAYS]** Viết toàn bộ tài liệu kỹ thuật (`concept.md`, `plan.md`, `walkthrough.md`) bằng tiếng Anh chuẩn kỹ thuật.
- **[NEVER]** Không đặt `useInput` toàn cục bắt phím `Enter` ở wrapper cha khi component con cũng có `useInput` mà không qua router/focus lock, để tránh lỗi race condition gây thoát view trước khi action kịp thực thi.
- **[ALWAYS]** Khai báo Machine-Readable Task Matrix đầy đủ các cột (`Order`, `Status`, `Action`, `File Path`, `Target Symbols`, `Depends On`, `Fast Test Command`) trong Section 3 của `plan.md`.
- **[ALWAYS]** Đảm bảo `assets/skills/index.ts`, `assets/workflows/index.ts` và `.agents/workflows/*.md` luôn đồng bộ 100% về danh mục kỹ năng (`SKILLS` và `requiredSkills`), tuyệt đối không để sót tham chiếu không tồn tại (dangling references).
- **[ALWAYS]** Áp dụng nguyên tắc Reuse-First Invariant và quét các thư mục dùng chung (utils, helpers, hooks, common, components) trước khi viết code mới hoặc lập plan để ngăn chặn duplicate logic.
- **[NEVER]** Không sửa source code hoặc thực thi thay đổi dự án trong lượt chạy của workflow `/only-one-idea`. Workflow này chỉ dừng lại ở việc tạo `concept.md` (Strict Lifecycle Isolation).
- **[NEVER]** Không gọi `child_process.spawn` trên Windows (`win32`) với `{ shell: false }` khi thực thi các lệnh CLI hoặc wrapper dạng batch script (`.cmd`/`.bat`) như Antigravity IDE, VS Code, Cursor để tránh crash lỗi `ENOENT`.
- **[NEVER]** Không để ngoại lệ thứ cấp trong quá trình `rollback()` làm ngắt quãng việc dọn dẹp journal/backup file hoặc che giấu lỗi gốc (*Error Masking*). Rollback phải có tính kiên cường (resilient) và bỏ qua các lỗi tài nguyên đã không còn tồn tại.
- **[ALWAYS]** Khai báo và gán `version: string` tuân thủ cơ số 10 (`X.Y.Z`) cho 100% asset manifests trong `assets/` và cập nhật phiên bản khi thay đổi nội dung file template (bảo vệ CI version gate).
- **[NEVER]** Không lưu trữ lockfile trong thư mục ẩn `.only-one/` hoặc phân mảnh ra các file phụ như `skills-lock.json`. Toàn bộ trạng thái phiên bản và remote metadata phải quy tụ duy nhất về `only-one/installed.json` (Single Source of Truth).
- **[AVOID]** Không khởi chạy browser MCP tự động mà không chỉ định thư mục profile cô lập (`--user-data-dir`) nhằm ngăn chặn xung đột khóa tiến trình SingletonLock với trình duyệt cá nhân của developer.
- **[NEVER]** Không tự ý viết code theo thiên kiến hoặc thói quen mặc định của LLM khi thực thi workflow `/only-one-apply`. Luôn đối chiếu và tuân thủ 100% các quy chuẩn, tiêu chuẩn code trong skills ngôn ngữ và `rules.md`.
- **[AVOID]** Tránh sinh tài liệu task (`concept.md`, `plan.md`) dài dòng với văn mẫu sáo rỗng làm loãng nội dung kỹ thuật. Luôn trình bày code changes dưới dạng Unified Diff (`-` và `+`).
