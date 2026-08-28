# Learning Notes: Debugging & Troubleshooting

> Collection of technical English structures, expressions, and vocabulary extracted from task workflows.

## Patterns & Expressions

### 1. To trace the root cause to [something]
- **Meaning (VI)**: Truy vết và tìm ra nguyên nhân gốc rễ dẫn đến lỗi hoặc sự cố.
- **Grammar / Usage**: `trace the root cause of [Issue] to [Component / Code / State]`
- **Engineering Example**:
  > *"During RCA, the engineering team traced the root cause of the memory leak to unclosed database connections."*
- **Origin Task**: Initial Seed

### 2. To pinpoint the regression
- **Meaning (VI)**: Xác định chính xác vị trí/commit gây ra sự suy giảm chất lượng hoặc tái xuất hiện lỗi.
- **Grammar / Usage**: `pinpoint the regression introduced in [Commit / PR]`
- **Engineering Example**:
  > *"Using git bisect, we pinpointed the regression to the recent query optimization commit."*
- **Origin Task**: Initial Seed

### 3. To reproduce [an issue] consistently under [conditions]
- **Meaning (VI)**: Tái hiện được lỗi một cách nhất quán/liên tục dưới những điều kiện cụ thể.
- **Grammar / Usage**: `reproduce [bug/error] consistently under [high load / edge conditions]`
- **Engineering Example**:
  > *"The QA engineer managed to reproduce the deadlock consistently under concurrent load."*
- **Origin Task**: Initial Seed

### 4. Red feedback loop
- **Meaning (VI)**: Vòng phản hồi kiểm thử đỏ; quy trình bắt buộc phải viết hoặc chạy một automated test thất bại để tái hiện chính xác lỗi trước khi thực hiện sửa mã nguồn.
- **Grammar / Usage**: `[Adjective] feedback loop` — Chu trình lặp kiểm chứng.
- **Engineering Example**:
  > *"Before writing the bug fix, establish a reliable red feedback loop that reliably fails on the reported issue."*
- **Origin Task**: `20260827-142500-optimize-workflows-skills-catalog`

### 5. Error masking
- **Meaning (VI)**: Hiện tượng lỗi thứ cấp hoặc ngoại lệ phát sinh trong quá trình xử lý/cleanup làm che giấu mất nguyên nhân lỗi gốc ban đầu.
- **Grammar / Usage**: `[Noun] masking` — Hiện tượng che giấu hoặc ghi đè lỗi.
- **Engineering Example**:
  > *"We must catch cleanup errors separately to prevent error masking from hiding the root installation failure."*
- **Origin Task**: `20260828-201500-fix-vs-extensions-antigravity-spawn-enoent`

### 6. Platform-agnostic process spawning
- **Meaning (VI)**: Kỹ thuật khởi tạo tiến trình con độc lập với hệ điều hành, tự động thích ứng với cơ chế thực thi của Windows batch scripts (`.cmd`) và Unix binaries.
- **Grammar / Usage**: `Enable platform-agnostic process spawning by + [gerund / noun phrase]`
- **Engineering Example**:
  > *"We enable platform-agnostic process spawning by conditionally toggling the shell execution option on Win32 hosts."*
- **Origin Task**: `20260828-201500-fix-vs-extensions-antigravity-spawn-enoent`

### 7. Resilient rollback
- **Meaning (VI)**: Cơ chế hoàn tác có khả năng tự phục hồi, tiếp tục hoàn tất các hạng mục dọn dẹp còn lại ngay cả khi một vài thao tác thành phần gặp lỗi lành tính (như tài nguyên không tồn tại).
- **Grammar / Usage**: `Implement a resilient rollback mechanism to + [verb phrase]`
- **Engineering Example**:
  > *"Transaction managers should implement a resilient rollback to ensure journals and temp files are cleared even if an individual uninstall fails."*
- **Origin Task**: `20260828-201500-fix-vs-extensions-antigravity-spawn-enoent`

