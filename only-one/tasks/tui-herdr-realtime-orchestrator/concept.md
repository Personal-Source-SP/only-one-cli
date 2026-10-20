---
slug: tui-herdr-realtime-orchestrator
created_at: 2026-10-20T14:18:33+07:00
status: concept
---

# Concept: TUI Realtime Task Watcher & Bộ Điều Phối Herdr Agent

## 1. Problem & Goal

### Problem (Điểm nghẽn & Thiếu sót hiện tại)
- **Context & Trigger**: Người dùng quản lý task qua TUI, nhưng task board chỉ scan dữ liệu 1 lần lúc khởi chạy.
- **Symptom & Defect**: Board yêu cầu khởi động lại TUI mới thấy task mới. Task ở trạng thái pending phải mở terminal riêng để chạy thủ công.
- **Root Cause**: TUI chưa có file watcher, thiếu cơ chế điều phối process và chưa có file cấu hình global.
- **Impact / Blast Radius**: Quy trình làm việc bị gián đoạn. Người dùng tốn nhiều thao tác gõ lệnh thủ công và dọn dẹp task board.

### Goal (Kết quả kỹ thuật mục tiêu)
- **Core Goal**: Biến TUI thành trung tâm điều phối realtime, tương tác và quản lý lifecycle task qua Herdr.
- **Acceptance Criteria**:
  - Theo dõi liên tục thư mục `only-one/tasks/` và cập nhật board realtime không cần khởi động lại.
  - Điều phối task pending tới đúng AI Agent qua lệnh Herdr CLI (`pane split`, `agent start`, `agent prompt`).
  - Đọc và lưu trữ cấu hình người dùng tại file global `~/.only-one/config.json`.
  - Cung cấp màn hình Settings tương tác trực tiếp trên TUI để cấu hình agent routing và ngưỡng clean.
  - Tự động chuyển task đã hoàn thành sang `only-one/archives/` khi vượt ngưỡng số lượng thiết lập (> 5 tasks).

## 2. Scope Boundaries (Ranh giới phạm vi)
- **In-Scope**:
  - File watcher theo dõi realtime với cơ chế debounce xử lý sự kiện file.
  - Thao tác dispatch tương tác (`[D]`) định tuyến task phase sang AI Agent qua Herdr.
  - Schema lưu trữ cấu hình global tại `~/.only-one/config.json`.
  - Màn hình Settings chuyên biệt trên TUI (`[S]`) để chỉnh sửa policy clean và routing agent.
  - Kiểm tra môi trường Herdr session (`HERDR_ENV`) với badge hiển thị và fallback an toàn.
  - Dịch vụ tự động archive task khi số lượng task hoàn thành vượt ngưỡng cấu hình.
- **Explicit Out-of-Scope**:
  - Tích hợp trực tiếp AI API vào trong source code TUI (Herdr chịu trách nhiệm quản lý agent process).
  - Background daemon chạy ngầm độc lập 24/7 khi TUI đã đóng.
  - Chỉnh sửa trực tiếp nội dung chi tiết markdown của task trên màn hình TUI.

## 3. Proposed Solution & Core Mechanism (Giải pháp đề xuất & Cơ chế cốt lõi)

### Core Mechanism (Cơ chế hoạt động)
Hệ thống sử dụng kiến trúc Hybrid Herdr Context Engine:
1. **Realtime Watcher Engine**: Background file watcher theo dõi thay đổi trong `only-one/tasks/`. Áp dụng debounce (300ms–500ms) trước khi refresh state trên React Ink board.
2. **Global Configuration Manager**: Quản lý đọc/ghi file `~/.only-one/config.json`. Cấu hình định nghĩa bảng routing agent và ngưỡng auto-archive.
3. **Interactive Settings Screen**: Màn hình cấu hình trực quan (`[S]`). Người dùng tinh chỉnh policy bằng phím điều hướng mà không cần sửa file JSON bằng tay.
4. **Herdr Dispatch Supervisor**: Kiểm tra session context. Khi kích hoạt, chia sibling pane (`herdr pane split`), khởi tạo agent tương ứng (`herdr agent start`), và gửi prompt thực thi (`herdr agent prompt`).
5. **Lifecycle Cleaner Service**: Giám sát số lượng task hoàn thành. Khi vượt ngưỡng, tự động di chuyển thư mục task sang `only-one/archives/`.

### Conceptual Flow & State Transitions (Luồng hoạt động)
```mermaid
flowchart TD
    subgraph Filesystem
        Tasks["only-one/tasks/*"]
        Config["~/.only-one/config.json"]
        Archives["only-one/archives/"]
    end

    subgraph TUI["only-one TUI Engine"]
        Watcher["File Watcher (Debounced)"]
        BoardState["Board State Store"]
        Dispatcher["Herdr Dispatcher"]
        SettingsUI["Settings Screen [S]"]
        CleanService["Lifecycle Cleaner"]
    end

    subgraph HerdrSession["Herdr Session (Multiplexer)"]
        SplitPane["Split Sibling Pane (--no-focus)"]
        StartAgent["Start Assigned Agent (antigravity/claude)"]
        SubmitPrompt["Submit Prompt to Agent"]
    end

    Tasks -->|Filesystem Events| Watcher
    Watcher -->|Debounced Update| BoardState
    Config <-->|Read / Write| SettingsUI
    Config -->|Routing Rules| Dispatcher
    Config -->|Threshold Rule| CleanService

    BoardState -->|User nhấn [D] Dispatch| Dispatcher
    Dispatcher -->|Kiểm tra HERDR_ENV| SplitPane
    SplitPane --> StartAgent
    StartAgent --> SubmitPrompt

    BoardState -->|Task Done vượt ngưỡng| CleanService
    CleanService -->|Move Task Directory| Archives
```

### UI Wireframes (Giao diện wireframe)

#### 1. Realtime Task Board với Trạng thái Herdr
```text
┌─ ONLY-ONE TASK MANAGER ───────────────────────────────── [HERDR: CONNECTED] ─┐
│                                                                             │
│  [1] IDEA (1)        [2] PLAN (2)          [3] IMPLEMENT (1)   [4] DONE (6) │
│ ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ ┌───────────┐ │
│ │ auth-flow      │  │►tui-herdr-sync   │  │ payment-v2      │ │ init-cli  │ │
│ │ Pending        │  │  Ready to Run    │  │ Running (Claude)│ │ [Archived]│ │
│ └────────────────┘  ├──────────────────┤  └─────────────────┘ └───────────┘ │
│                     │ api-gateway      │                      │ ... +5 more │
│                     │ Pending          │                      └───────────┘ │
│                     └──────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Task: tui-herdr-sync | Target Agent: antigravity (từ config)                │
│ Status: Sẵn sàng dispatch | Clean: 6 done tasks (Ngưỡng: 5) ⚠️              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [↑↓←→] Điều hướng  [D] Dispatch qua Herdr  [C] Clean Ngay  [S] Settings  [Q] Thoát│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Màn hình Cấu hình Tương tác (`[S]`)
*(Đồng bộ 2 chiều với `~/.only-one/config.json`)*
```text
┌─ ONLY-ONE SETTINGS (~/.only-one/config.json) ───────────────────────────────┐
│                                                                             │
│  1. CHÍNH SÁCH AUTO-CLEAN                                                   │
│     ( ) Vô hiệu hóa                                                         │
│     (•) Khi số task hoàn thành vượt ngưỡng                                  │
│         Số lượng ngưỡng: [ 5 ] task                                         │
│     ( ) Tự động dọn ngay khi task chuyển sang Done                          │
│                                                                             │
│  2. ĐỊNH TUYẾN AGENT (HERDR ROUTING MATRIX)                                 │
│     Phase 'idea'      ──► Agent Kind: [ antigravity            ▼ ]          │
│     Phase 'plan'      ──► Agent Kind: [ antigravity            ▼ ]          │
│     Phase 'apply'     ──► Agent Kind: [ codex                  ▼ ]          │
│     Phase 'debug'     ──► Agent Kind: [ claudecode             ▼ ]          │
│                                                                             │
│  3. CẤU HÌNH HERDR TOPOLOGY                                                 │
│     Hướng chia Pane:  (•) Phải (Right)   ( ) Dưới (Down)                    │
│     Focus khi mở:     ( ) Có             (•) Không (Giữ focus tại TUI)      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Tab / ↑↓] Chọn mục   [Space / Enter] Bật tắt / Sửa   [Esc / S] Lưu & Quay lại│
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Critical Risks & Edge Cases (Rủi ro & Xử lý ngoại lệ)
- **Môi trường ngoài Herdr**: Chạy TUI bên ngoài Herdr khiến lệnh dispatch thất bại. Hệ thống kiểm tra biến môi trường `HERDR_ENV`, hiển thị badge cảnh báo và hướng dẫn mở trong Herdr.
- **Race Condition khi ghi file**: Agent ghi file đồng thời khiến file watcher nhận dữ liệu đứt đoạn. Hệ thống áp dụng debounce window để đảm bảo file ghi xong mới parse.
- **Agent yêu cầu tương tác (Blocked)**: Agent hỏi quyền thực thi lệnh từ người dùng. Pane mới mở ở chế độ `--no-focus` bên cạnh, cho phép người dùng click sang trả lời mà không treo TUI.
- **Thiếu file config global**: Lần đầu chạy chưa có `~/.only-one/config.json`. Hệ thống tự động khởi tạo file với giá trị mặc định an toàn.
