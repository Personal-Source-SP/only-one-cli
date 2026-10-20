---
slug: unified-global-agents-standard
created_at: 2026-10-20T10:03:00+07:00
status: concept
---

# Concept: Chuẩn hóa Global Agents và Manifest Skills Đa Nền tảng

## 1. Bài toán & Mục tiêu (Problem & Goal)

### Bài toán (Current Bottlenecks & Deficiencies)
- **Bối cảnh & Tác nhân**: Người dùng cài đặt skills, workflows hoặc rules ở chế độ global bằng cờ `--global` cho nhiều công cụ AI agent.
- **Triệu chứng & Khiếm khuyết**: Tài nguyên bị phân tán rải rác trong các thư mục cấu hình riêng lẻ (`.gemini/config`, `.cursor`, `.claude`), dẫn đến nhân bản dữ liệu và trạng thái lệch pha.
- **Nguyên nhân cốt lõi**: Kiến trúc CLI định tuyến đích đến global dựa trên ID của từng tool thay vì quy tụ về chuẩn mở chung `~/.agents`.
- **Tác động & Phạm vi ảnh hưởng**: Lãng phí dung lượng lưu trữ, gây mất đồng bộ tài nguyên giữa các trình soạn thảo và phá vỡ cơ chế tự động khám phá của các công cụ tuân thủ chuẩn Agent Skills.

### Mục tiêu (Target Technical Outcomes)
- **Mục tiêu cốt lõi**: Hợp nhất toàn bộ tài nguyên cài đặt global vào một thư mục gốc chuẩn (Canonical Directory) duy nhất, tự động tạo manifest bridge để các runtime agent tương thích tự nhận diện.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Lưu trữ vật lý toàn bộ global skills, workflows, và rules tại `~/.agents/{skills,workflows,rules}`.
  - Tự động sinh và cập nhật `~/.agents/skills.json` làm catalog manifest gốc của kho `.agents`.
  - Tự động merge an toàn entry `~/.agents/skills` vào `~/.gemini/config/skills.json` của Antigravity mà không ghi đè cấu hình sẵn có của người dùng.
  - Cung cấp cơ chế liên kết an toàn trên đa nền tảng (Symlink / Junction) cho các môi trường agent yêu cầu đường dẫn kế thừa.

## 2. Ranh giới Phạm vi (Scope Boundaries)
- **Trong phạm vi (In-Scope)**:
  - Logic định tuyến đường dẫn global cho skills, workflows và rules trỏ về `~/.agents`.
  - Logic đọc, merge không phá hủy và ghi file `skills.json` tại thư mục `.agents` và thư mục config của agent.
  - Cầu nối tương thích ngược (Symlink / Junction) cho các tool cần namespace riêng.
  - Các chu trình kiểm tra, đồng bộ hóa (sync) và gỡ bỏ (prune) tuân thủ kho lưu trữ canonical và manifest.
- **Ngoài phạm vi (Explicit Out-of-Scope)**:
  - Thay đổi cấu trúc thư mục `.agents` ở cấp độ workspace (project local).
  - Giao thức tải gói từ xa hoặc schema registry upstream trên `skills.sh`.
  - Can thiệp trực tiếp vào file nhị phân của IDE hoặc cấu hình cloud sync riêng của nhà phát triển.

## 3. Giải pháp Đề xuất & Cơ chế Cốt lõi (Proposed Solution & Core Mechanism)
- **Cơ chế cốt lõi**:
  - CLI coi `~/.agents/` là nguồn sự thật duy nhất (Single Source of Truth) lưu trữ toàn bộ assets được cài global.
  - Bộ điều phối manifest (Manifest Coordinator) kiểm tra các thư mục cấu hình agent tương thích trong quá trình cài đặt global.
  - Nếu phát hiện cấu hình Antigravity/Gemini, bộ điều phối tự động thêm thư mục skill chuẩn vào danh sách `entries` của `skills.json` một cách bất biến (idempotent).
  - Đối với các tool yêu cầu cấu trúc thư mục trực tiếp, thiết lập cầu nối liên kết trỏ ngược về thư mục canonical.

- **Mô hình Miền & Luồng Khái niệm (Conceptual Flow / Domain Model)**:

```mermaid
flowchart TD
    subgraph HanhDongNguoiDung["Thao tác CLI"]
        Cmd["only-one skill install <name> --global"]
    end

    subgraph KhoLuuTruGoc["Kho lưu trữ chuẩn (~/.agents)"]
        StoreSkills["~/.agents/skills/<name>/"]
        StoreWf["~/.agents/workflows/"]
        StoreRules["~/.agents/rules/"]
        ManifestRoot["~/.agents/skills.json"]
    end

    subgraph CauNoiAgent["Cầu nối khám phá đa Agent"]
        GeminiConfig["~/.gemini/config/skills.json"]
        LegacyBridge["~/.claude/skills (Symlink/Junction)"]
    end

    Cmd --> StoreSkills
    Cmd --> ManifestRoot
    StoreSkills -.->|Đăng ký đường dẫn| GeminiConfig
    StoreSkills -.->|Link về kho chuẩn| LegacyBridge
```

## 4. Rủi ro Kỹ thuật & Ca biên (Critical Risks & Edge Cases)
- **Ghi Manifest đồng thời**: Nhiều tiến trình CLI cập nhật `skills.json` cùng lúc cần tránh xung đột bằng cơ chế ghi an toàn (atomic write).
- **Chuẩn hóa đường dẫn đa nền tảng**: Đường dẫn ghi vào `skills.json` trên Windows cần xử lý dấu gạch chéo chuẩn (`/`) để mọi runtime đều đọc hiểu.
- **Dọn dẹp khi gỡ bỏ**: Khi gỡ bỏ một global asset, hệ thống phải dọn dẹp sạch cả file vật lý lẫn tham chiếu trong manifest, không để lại symlink mồ côi.
