---
slug: refactor-ui-nextjs-structure
created_at: 2026-10-21T00:35:00.000Z
status: concept
---

# Concept: Tái cấu trúc `src/ui` thành Ứng dụng Next.js Chuẩn hóa (Theo Kiến trúc only-one-fe)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Điểm nghẽn & Thiếu sót hiện tại)
- **Context & Trigger**: Module UI trong `only-one-cli` đã chuyển đổi sang Next.js, nhưng cấu trúc thư mục hiện tại đang bị lồng ghép con (`src/ui/dashboard/`) nằm cạnh các thư mục `services/`, `types/`, và `init/`.
- **Symptom & Defect**:
  - Cấu trúc thư mục bị phân mảnh, có thêm tầng lồng không cần thiết (`src/ui/dashboard/app/...`).
  - Không đồng bộ với chuẩn kiến trúc đã được thiết lập và kiểm chứng trong dự án frontend mẫu [only-one-fe](file:///d:/Sources/PERSONAL/only-one-fe).
  - Khó khăn trong việc chia sẻ, tái sử dụng components và convention chuẩn (như phân chia `components/layout`, `components/containers`, `components/feedback`, `services/`, `types/`, `styles/`).
- **Root Cause**:
  - Giai đoạn chuyển giao ban đầu di chuyển trực tiếp từ `packages/dashboard` vào `src/ui/dashboard` như một thư mục tạm thay vì phẳng hóa toàn bộ `src/ui` thành ứng dụng Next.js gốc.
- **Impact / Blast Radius**:
  - Làm tăng độ phức tạp khi mở rộng các tính năng UI, gây bối rối cho lập trình viên quen thuộc với cấu trúc chuẩn của Next.js và hệ sinh thái `only-one-fe`.

### Goal (Kết quả kỹ thuật mục tiêu)
- **Core Goal**: Tái cấu trúc toàn bộ thư mục `src/ui/` thành một ứng dụng Next.js Fullstack hoàn chỉnh, độc lập (standalone sub-app) với cấu trúc phân tầng chuẩn hóa theo [only-one-fe](file:///d:/Sources/PERSONAL/only-one-fe), loại bỏ hoàn toàn thư mục con `dashboard/`.
- **Acceptance Criteria**:
  - Thư mục `src/ui/` đóng vai trò là root của ứng dụng Next.js (chứa `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`).
  - Cấu trúc thư mục chuẩn hóa theo `only-one-fe`:
    - `src/ui/app/`: Layout chính, trang chủ và Server Actions.
    - `src/ui/components/`: Phân chia module rõ ràng gồm `layout/`, `containers/`, `feedback/`, `display/`, `forms/`.
    - `src/ui/services/`: Các dịch vụ thao tác dữ liệu (`taskScanner`, `herdrService`, `configService`, `taskCleaner`, `taskWatcher`).
    - `src/ui/types/`: Định nghĩa kiểu dữ liệu chuẩn (`task.ts`, `config.ts`).
    - `src/ui/styles/`: Quản lý CSS toàn cục và design tokens (`globals.css`).
  - Lệnh CLI `only-one ui` khởi chạy Next.js trực tiếp từ `src/ui/`.
  - Giữ nguyên `src/ui/init/` phục vụ lệnh `only-one init` không gây hồi quy (zero regression).
  - 100% test suite hiện tại (`npm test`) và quy trình build (`npm run build`) vượt qua không lỗi.

---

## 2. Scope Boundaries (Ranh giới phạm vi)

### In-Scope
- **Phẳng hóa & Tái tổ chức cấu trúc `src/ui/`**:
  - Đưa các file cấu hình Next.js (`package.json`, `next.config.mjs`, `tailwind.config.mjs`, `postcss.config.mjs`, `tsconfig.json`) ra trực tiếp thư mục `src/ui/`.
  - Phẳng hóa thư mục `app/` từ `src/ui/dashboard/app/` thành `src/ui/app/`.
  - Phân loại lại components theo chuẩn `only-one-fe`:
    - `components/layout/`: `Header.tsx`
    - `components/containers/`: `KanbanBoard.tsx`, `HerdrPanel.tsx`
    - `components/feedback/`: `MarkdownModal.tsx`
    - `components/display/`: `TaskCard.tsx`
    - `components/forms/`: `SettingsModal.tsx`
  - Di chuyển `globals.css` vào `src/ui/styles/globals.css`.
- **Cập nhật Lệnh khởi chạy CLI**:
  - Sửa đường dẫn thực thi trong `src/commands/ui/command.ts` trỏ tới `src/ui/` thay vì `src/ui/dashboard/`.
- **Bảo toàn Core Services & Init Wizard**:
  - Duy trì `src/ui/services/`, `src/ui/types/`, và `src/ui/init/` với API interfaces không đổi.

### Explicit Out-of-Scope
- Không thay đổi hành vi nghiệp vụ của các core services (`taskScanner`, `herdrService`, v.v.).
- Không gộp các dependencies nặng của Next.js vào `package.json` gốc của CLI (giữ `src/ui` là sub-app độc lập).
- Không can thiệp vào các module khác ngoài `src/ui/` và `src/commands/ui/`.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp đề xuất & Cơ chế cốt lõi)

### So sánh các phương án kiến trúc (Architecture Trade-offs)

| Tiêu chí | Phương án 1: Next.js Sub-app Phẳng tại `src/ui/` (Được chọn) | Phương án 2: Giữ thư mục lồng `src/ui/dashboard/` | Phương án 3: Gộp chung vào package.json gốc |
| :--- | :--- | :--- | :--- |
| **Tính đồng nhất** | **Chuẩn hóa 100% giống only-one-fe** | Phân mảnh, xuất hiện tầng lồng thừa thãi | Xáo trộn dependencies của CLI |
| **Đường dẫn thư mục** | `src/ui/app`, `src/ui/components` trực quan | `src/ui/dashboard/app` rườm rà | Phức tạp trong cấu hình build CLI |
| **Khả năng tái sử dụng** | Copy component qua lại giữa 2 dự án cực dễ | Phải sửa đổi import paths nhiều lần | Xung đột phiên bản React 19 / Next 15 |
| **Bảo trì lâu dài** | Dễ dàng nâng cấp Next.js độc lập | Khó quản lý do cấu trúc dị biệt | Tăng dung lượng bundle của CLI chính |
| **Đánh giá** | **Tối ưu nhất: Đẹp, chuẩn mực, đồng bộ** | Kém trực quan, nợ kỹ thuật tồn đọng | Rủi ro cao gây hỏng các lệnh CLI khác |

---

### Sơ đồ Cấu trúc Thư mục Đề xuất (Next.js App Structure)

```text
src/ui/
├── package.json                   # Dependencies riêng cho UI (Next 15, React 19, @dnd-kit, Tailwind)
├── next.config.mjs                # Standalone output configuration
├── tailwind.config.ts             # Dark mode theme & Linear style tokens
├── postcss.config.mjs             # PostCSS setup
├── tsconfig.json                  # Path alias @/* trỏ về src/ui/*
├── app/
│   ├── layout.tsx                 # Root layout nhúng font & styles
│   ├── page.tsx                   # Dashboard entrypoint page
│   └── actions.ts                 # Server Actions gọi trực tiếp Node.js services
├── components/
│   ├── layout/
│   │   └── Header.tsx             # Thanh điều hướng với status Herdr & quick actions
│   ├── containers/
│   │   ├── KanbanBoard.tsx        # Bảng Kanban kéo thả 4 cột
│   │   └── HerdrPanel.tsx         # Panel giám sát các agent Herdr thời gian thực
│   ├── display/
│   │   └── TaskCard.tsx           # Thẻ task bo cong viền phát sáng
│   ├── feedback/
│   │   └── MarkdownModal.tsx      # Modal xem chi tiết Markdown, Diffs và Mermaid SVG
│   └── forms/
│       └── SettingsModal.tsx      # Bảng cấu hình phân luồng agent và auto-clean
├── services/                      # Core business services dùng chung
│   ├── taskScanner.ts             # Quét và đọc/ghi frontmatter task
│   ├── herdrService.ts            # Điều phối Herdr socket và pane dispatch
│   ├── configService.ts           # Quản lý cấu hình ~/.only-one/config.json
│   ├── taskCleaner.ts             # Dọn dẹp task hoàn thành
│   └── taskWatcher.ts             # File watcher
├── types/                         # Kiểu dữ liệu TypeScript
│   ├── task.ts                    # TaskModel, HerdrAgent, ColumnModel
│   └── config.ts                  # OnlyOneGlobalConfig, AgentRoutingConfig
├── styles/
│   └── globals.css                # CSS variables, animations, custom scrollbar
└── init/                          # Giao diện interactive cho lệnh only-one init
    ├── InitWizardApp.tsx
    ├── components/
    └── services/
```

---

### Sơ đồ Tương tác Hệ thống (Component & Data Flow)

```mermaid
flowchart TD
    User([Người dùng gõ: only-one ui]) --> Command["src/commands/ui/command.ts"]
    Command -->|Start Next.js (cwd: src/ui)| Server["Next.js Standalone Server"]
    Command -->|Mở App Mode| Win["Desktop App Window (--app)"]
    
    subgraph NextJSApp ["src/ui (Next.js Application)"]
        Win --- Page["app/page.tsx"]
        
        subgraph Components ["components/ (Phân tầng theo only-one-fe)"]
            Page --> LayoutComp["layout/Header.tsx"]
            Page --> ContainerComp["containers/KanbanBoard.tsx & HerdrPanel.tsx"]
            Page --> DisplayComp["display/TaskCard.tsx"]
            Page --> FeedbackComp["feedback/MarkdownModal.tsx"]
            Page --> FormComp["forms/SettingsModal.tsx"]
        end
        
        subgraph ServerSide ["Tầng Xử lý Hệ thống"]
            Page -->|Gọi trực tiếp| Actions["app/actions.ts (Server Actions)"]
            Actions --> TaskService["services/taskScanner.ts"]
            Actions --> HerdrService["services/herdrService.ts"]
            Actions --> ConfigService["services/configService.ts"]
            Actions --> CleanerService["services/taskCleaner.ts"]
        end
    end
```

---

### Ma trận Xử lý Trạng thái Giao diện (UI State Handling Matrix)

| Thành phần UI | Empty State | Loading State | Error State | Populated State |
| :--- | :--- | :--- | :--- | :--- |
| **`containers/KanbanBoard`** | Hiển thị hộp nét đứt: "Chưa có task nào", kèm gợi ý tạo task. | Skeleton cards mờ nhạt với hiệu ứng sóng (pulse animation). | Banner cảnh báo đỏ kèm nút "Thử lại". | 4 cột đầy đủ (`CONCEPT`, `PLAN`, `PROCESSING`, `DONE`) kéo thả 120 FPS. |
| **`containers/HerdrPanel`** | Thông báo: "Chưa có Pane nào hoạt động". | Nhấp nháy đèn trạng thái kết nối. | Hiển thị "Mất kết nối tới Herdr socket". | Danh sách agent, badge trạng thái `idle`/`working`/`blocked`. |
| **`feedback/MarkdownModal`** | Thông báo: "Tài liệu trống". | Spinner phát sáng trung tâm modal. | Hiển thị thông báo parse Markdown lỗi. | Render hoàn chỉnh Markdown GFM + Diff GitHub + Mermaid SVG. |

---

## 4. Critical Risks & Edge Cases (Rủi ro & Xử lý ngoại lệ)

- **Xung đột đường dẫn Import Path Alias (`@/*`)**:
  - *Rủi ro*: Khi biến `src/ui/` thành root của Next.js app, alias `@/*` trong `src/ui/tsconfig.json` trỏ về `src/ui/*`, trong khi CLI chính trỏ `@/*` về `src/*`.
  - *Giải pháp*: Cấu hình `tsconfig.json` bên trong `src/ui/` độc lập hoàn toàn, định nghĩa `@/*` trỏ về `./*` trong phạm vi của sub-app.
- **Tác động tới `only-one init`**:
  - *Rủi ro*: Di dời components làm ảnh hưởng tới dynamic import trong `interactive-orchestrator.ts`.
  - *Giải pháp*: Giữ nguyên vị trí `src/ui/init/` và API signature của `promptInitSelectionsViaTui`, đảm bảo không làm gián đoạn luồng `init`.
- **Biên dịch `npm run build` của CLI chính**:
  - *Rủi ro*: `tsc` của dự án gốc có thể cố gắng biên dịch các file Next.js trong `src/ui/app/` nếu không được loại trừ.
  - *Giải pháp*: Cấu hình `tsconfig.json` gốc kiểm tra phạm vi include/exclude hợp lý để CLI chính và UI app không bị xung đột bộ biên dịch.
