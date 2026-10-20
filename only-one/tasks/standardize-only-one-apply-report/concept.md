---
slug: standardize-only-one-apply-report
created_at: 2026-10-20T18:27:00.000Z
status: concept
---

# Concept: Tinh gọn Báo cáo Hoàn thành của `only-one-apply`

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Current Bottlenecks & Deficiencies)
- **Context & Trigger**: Khi kết thúc thực thi lệnh `/only-one-apply`, hệ thống xuất báo cáo kết quả hoàn thành tác vụ trực tiếp trong chat.
- **Symptom & Defect**:
  - Báo cáo hoặc quá sơ sài không rõ việc đã làm, hoặc phân rã chi tiết từng file gây dài dòng, mất thời gian đọc.
  - Ngôn ngữ thuyết minh pha trộn tiếng Anh, thiếu tự nhiên.
- **Root Cause**:
  - Chưa có một mẫu báo cáo trực quan, tóm tắt nhanh công việc đã xử lý trong toàn bộ quá trình gắn với cấu trúc source.
- **Impact / Blast Radius**:
  - Người dùng mất thời gian đọc mà không nắm bắt được ngay tổng quan công việc vừa được thực hiện.

### Goal (Target Technical Outcomes)
- **Core Goal**: Thiết lập mẫu báo cáo hoàn thành cực kỳ ngắn gọn, 100% tiếng Việt, thể hiện cấu trúc source và tóm tắt nhanh các công việc đã xử lý cùng điều kiện nghiệm thu.
- **Acceptance Criteria**:
  - Thuyết minh 100% bằng tiếng Việt ngắn gọn.
  - Cung cấp cây thư mục cấu trúc source thay đổi (`[NEW]`, `[MODIFY]`, `[DELETE]`).
  - Tóm tắt tổng quan các công việc đã xử lý trong quá trình qua vài gạch đầu dòng (không mô tả chi tiết lặp lại theo từng file riêng lẻ).
  - Nêu rõ điều kiện hoàn thành: Trạng thái task (`status: done`/`fixed`), kết quả test passed.
  - Gợi ý bước hành động tiếp theo trên một dòng ngắn.

---

## 2. Scope Boundaries (Phạm vi giải pháp)

### In-Scope
- Cập nhật Step 5 trong `assets/skills/only-one-apply/SKILL.md` theo mẫu báo cáo tinh gọn.
- Đồng bộ sang global skill `C:\Users\ADMIN\.gemini\config\skills\only-one-apply\SKILL.md`.
- Tạo test kiểm tra định dạng báo cáo tinh gọn và kiểm tra tiêu chuẩn ASD-STE100.

### Explicit Out-of-Scope
- Không sinh file `walkthrough.md` trên đĩa.
- Không chia nhỏ mô tả chi tiết theo từng file riêng lẻ.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp đề xuất & Cơ chế cốt lõi)

### Mẫu báo cáo hoàn thành đề xuất (Crisp Completion Report)

```markdown
# 🏁 Hoàn thành tác vụ: `<slug>`

### 1. Cấu trúc source thay đổi
\`\`\`text
src/
├── [NEW]    path/to/newFile.ts
└── [MODIFY] path/to/modFile.ts
\`\`\`

### 2. Các công việc đã xử lý
- <Tóm tắt công việc 1 đã thực hiện trong quá trình>.
- <Tóm tắt công việc 2 đã thực hiện trong quá trình>.
- <Tóm tắt công việc 3 đã thực hiện trong quá trình>.

### 3. Nghiệm thu & Kiểm thử
- **Trạng thái**: Hoàn tất (`status: done` / `fixed`).
- **Kiểm thử**: `<Lệnh test>` -> `PASS (X test passed)`.

### 4. Bước tiếp theo
- `/only-one-review` | `/only-one-pr-git` | `/only-one-clean`
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Trường hợp biên)

- Không có rủi ro kỹ thuật nào. Định dạng này hoàn toàn tối ưu hóa tốc độ đọc và khả năng nắm bắt nhanh của người dùng.
