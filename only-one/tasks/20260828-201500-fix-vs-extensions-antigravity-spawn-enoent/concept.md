# Concept: Fix VS Extensions Sync Antigravity Spawn ENOENT on Windows

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**: Khi người dùng chạy lệnh `only-one extensions-vs` và chọn editor **Antigravity** (hoặc các editor khác có binary dạng `.cmd`/`.bat` trên Windows), CLI gặp lỗi crash nghiêm trọng `Error: spawn antigravity-ide ENOENT` tại `syncVsExtensions`.
- **Root Cause**:
  1. **Windows Child Process Spawn Limitation**: `NodeVsProcessRunner` sử dụng `spawn(command, args, { shell: false })`. Trên môi trường Windows (`win32`), Node.js `child_process.spawn` không thể kích hoạt trực tiếp các file wrapper batch (`antigravity-ide.cmd`, `code.cmd`, `cursor.cmd`) trong `PATH` nếu không bật `shell: true` hoặc không chỉ định rõ phần mở rộng.
  2. **Unvalidated Fallback in Candidate Resolver**: Hàm `resolveVsEditorCommand` kiểm tra các candidate (`antigravity-ide`, `antigravity`). Khi cả 2 đều trả về lỗi `ENOENT` (exit code 127), hàm fallback mặc định trả về `candidate[0]` thay vì báo lỗi command không khả dụng. Khi bước cài extension thực thi, runner tiếp tục spawn và throw unhandled exception.
- **Target Audience & Core Value**: Người dùng `only-one-cli` trên hệ điều hành Windows & macOS có thể đồng bộ extension cho Antigravity IDE mượt mà, ổn định và nhận thông báo lỗi tường minh, thân thiện nếu editor chưa được cài đặt.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Cập nhật cơ chế spawn trong `NodeVsProcessRunner` hỗ trợ thực thi an toàn trên Windows (`shell: process.platform === 'win32'`).
  - Cải tiến `resolveVsEditorCommand` để kiểm tra tính hợp lệ của binary thực thi; trả về lỗi chi tiết kèm hướng dẫn khắc phục (`Actionable Error`) nếu không tìm thấy binary nào trong `PATH`.
  - Bổ sung bước tiền kiểm tra (`pre-flight validation`) trong `extensions-vs` và `doctor` để cảnh báo sớm nếu CLI của editor chưa sẵn sàng.
  - Viết Unit Tests mô phỏng các kịch bản process runner trên Windows và kịch bản missing binary.
- **Explicit Out-of-Scope**:
  - Thay đổi danh mục extension trong `VS_LIBRARY` hoặc cài đặt thêm package ngoài.
  - Can thiệp vào logic merge cấu hình `settings.json` của VS Code / Antigravity.
  - Tự động thay đổi biến môi trường `PATH` của hệ điều hành.

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
- Lệnh `only-one extensions-vs` nhận diện và thực thi thành công `antigravity-ide.cmd` trên Windows, cài đặt các extension đã chọn mà không gặp lỗi `spawn ENOENT`.
- Trong trường hợp Antigravity IDE chưa được cài đặt / chưa có trong PATH, CLI hiển thị thông báo lỗi rõ ràng, có gợi ý khắc phục thay vì in stack trace thô.
- Toàn bộ unit test suite (`npm test`) vượt qua 100% với zero regression.

## 4. Proposed Solution & Core Mechanism (Phương pháp Giải quyết & Cơ chế Xử lý)

### 4.1. Explored Options & Trade-off Analysis (Các Phương án Đã Cân Nhắc)
| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Độ phức tạp | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Recommended)** | **Windows Shell Spawn & Strict Binary Validation**<br>Kích hoạt `shell: process.platform === 'win32'` trong `NodeVsProcessRunner` và bổ sung kiểm tra hợp lệ tại `resolveVsEditorCommand`. | Gọn nhẹ, tận dụng native API của Node.js, không thêm dependency ngoài, tương thích hoàn toàn với `.cmd` / `.bat` trên Windows. | Cần đảm bảo tham số truyền vào không bị parse sai trong shell (đã an toàn vì danh sách extension ID chỉ chứa ký tự chữ/số/dấu chấm/gạch ngang). | Low | **CHỌN (Tối ưu nhất)** |
| **Option 2** | **Tự triển khai PATHEXT Resolution (Lookup `where.exe` / `PATH`)**<br>Duyệt tìm thủ công file `.cmd`/`.exe` trong thư mục `PATH` trước khi gọi `spawn` không shell. | Không cần bật `shell: true`. | Code phức tạp, dễ phát sinh lỗi đường dẫn chứa khoảng trắng, symbolic link hoặc quyền truy cập. | High | **LOẠI (Over-engineering)** |
| **Option 3** | **Cài đặt thư viện bên thứ ba `cross-spawn`**<br>Sử dụng `cross-spawn` để thay thế cho native `child_process.spawn`. | Thư viện phổ biến, xử lý sẵn các corner case của Windows. | Tăng thêm external dependency cho core engine vốn đang lightweight. | Medium | **LOẠI (Không cần thiết)** |

- **Chosen Strategy (Phương án Được Chọn)**: **Option 1**. Bật `shell: process.platform === 'win32'` trong runner và ném lỗi rõ ràng khi không tìm thấy executable.

### 4.2. Core Processing Flow (Luồng Xử lý / Chuyển trạng thái Chính)
- **Workflow / Logic Flow**:
  1. **Input / Trigger**: Người dùng chạy `only-one extensions-vs` và chọn editor mục tiêu (e.g. `Antigravity`).
  2. **Resolution & Validation**:
     - `resolveVsEditorCommand` duyệt qua `candidate` (ví dụ `['antigravity-ide', 'antigravity']`).
     - Runner gọi `candidate --version` với cờ `shell: process.platform === 'win32'`.
     - Nếu tìm thấy candidate trả về exit code 0 $\rightarrow$ Trả về tên command khả dụng.
     - Nếu tất cả candidate đều thất bại $\rightarrow$ Throw `EditorExecutableNotFoundError` có ngữ cảnh (editor name, path suggestion).
  3. **Execution & Side Effects**:
     - Quá trình sync extension kích hoạt `[command] --install-extension [id]`.
     - Output / Progress hiển thị mượt mà trên giao diện CLI.
- **Sequence Diagram**:
  ```mermaid
  sequenceDiagram
    autonumber
    actor User as Developer
    participant CLI as extensions-vs Command
    participant Resolver as resolveVsEditorCommand
    participant Runner as NodeVsProcessRunner
    participant OS as Windows / Host Shell

    User->>CLI: only-one extensions-vs
    CLI->>Resolver: Resolve command for Antigravity
    loop Each candidate in ['antigravity-ide', 'antigravity']
        Resolver->>Runner: run(candidate, ['--version'])
        Runner->>OS: spawn(candidate, ['--version'], { shell: isWin32 })
        OS-->>Runner: Exit Code 0 (Found antigravity-ide.cmd)
        Runner-->>Resolver: Success
    end
    Resolver-->>CLI: Return 'antigravity-ide'
    CLI->>Runner: run('antigravity-ide', ['--install-extension', extId])
    Runner->>OS: spawn('antigravity-ide', ['--install-extension', extId], { shell: isWin32 })
    OS-->>Runner: Exit Code 0
    Runner-->>CLI: Installed successfully
    CLI-->>User: Progress 100% & Summary Report
  ```

### 4.3. Critical Edge Cases & Risk Handling (Kịch bản Biên & Xử lý Rủi ro)
- **Edge Case 1: Editor CLI hoàn toàn không có trong PATH**:
  - *Xử lý*: Bắt lỗi ngay tại khâu validation trước khi bắt đầu transaction, hiển thị thông báo: `Không tìm thấy lệnh CLI cho [Editor]. Vui lòng đảm bảo [Editor] đã được cài đặt và thêm vào biến môi trường PATH.`
- **Edge Case 2: Đường dẫn chứa khoảng trắng trên Windows**:
  - *Xử lý*: Node.js `spawn` khi kết hợp với `args` array và `shell: true` tự động bọc quote các argument an toàn.
- **Edge Case 3: Chạy trên macOS / Linux**:
  - *Xử lý*: `shell: process.platform === 'win32'` đảm bảo trên Unix/macOS vẫn dùng trực tiếp binary spawn tiêu chuẩn mà không khởi tạo sub-shell không cần thiết.

## 5. Technical English Key Patterns
### 1. Fallback Gracefully / Fail-Fast Validation
- **Meaning (VI)**: Cơ chế dừng sớm khi phát hiện điều kiện tiên quyết không hợp lệ thay vì tiếp tục thực thi gây crash dây chuyền.
- **Grammar / Usage**: `Subject + fail(s) fast when + condition, providing + descriptive context`
- **Engineering Example**: *"The editor command resolver should fail fast when no candidate executable is found in PATH, rather than falling back blindly to an invalid binary."*

### 2. Platform-Agnostic Process Execution
- **Meaning (VI)**: Thực thi tiến trình độc lập nền tảng, tự động tương thích với đặc thù của Windows (`.cmd` batch wrappers) và Unix binaries.
- **Grammar / Usage**: `Achieve platform-agnostic execution by + gerund/noun phrase`
- **Engineering Example**: *"We achieve platform-agnostic process execution by conditionally enabling shell wrapping on Windows environments."*

### 3. Actionable Diagnostic Message
- **Meaning (VI)**: Thông báo chẩn đoán lỗi mang tính hành động, cung cấp giải pháp cụ thể cho người dùng thay vì chỉ hiển thị mã lỗi thô.
- **Grammar / Usage**: `Provide actionable diagnostic messages that guide users on how to + verb`
- **Engineering Example**: *"Instead of throwing a raw ENOENT stack trace, the CLI should provide actionable diagnostic messages guiding the user to verify their PATH configuration."*
