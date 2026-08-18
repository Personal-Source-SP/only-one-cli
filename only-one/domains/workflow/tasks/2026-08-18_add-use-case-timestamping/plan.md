---
status: done
slug: add-use-case-timestamping
domain: workflow
started_at: 2026-08-18
completed_at: 2026-08-18
pr_url: ~
branch: main
---

# Kế hoạch bổ sung ghi chú thời gian (Timestamping) cho Use Cases trong workflow /only-one-sync

## Section 1. Current state

### Hiện trạng ghi nhận thời gian của Use Cases
Hiện tại trong [assets/workflows/only-one-sync.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-sync.md):
- **Template Use Case mới** (Step 4a) chỉ có trường `updated_at`:
  ```markdown
  ---
  id: UC-<DOMAIN-ABBR>-<NNN>
  title: <Title in English>
  domain: <domain>
  status: draft
  implemented_by: []
  updated_at: <YYYY-MM-DD>
  ---
  ```
- **Thiếu `created_at`**: Không theo dõi được ngày use case được tạo ban đầu.
- **Index `README.md`** (Step 4b) hiện tại chỉ có 3 cột:
  ```markdown
  | ID | Title | Status |
  |---|---|---|
  | UC-<ABBR>-<NNN> | <Title> | draft |
  ```
  Bảng mục lục chưa hiển thị thời gian cập nhật gần nhất (`Updated At`), khiến người đọc khó biết use case nào mới được đồng bộ hoặc đã cũ.

### Vấn đề cần giải quyết
Cần bổ sung cơ chế quản lý thời gian rõ ràng và nhất quán cho từng use case:
1. Thêm trường `created_at` vào frontmatter khi tạo use case mới.
2. Cập nhật trường `updated_at` mỗi khi use case được chỉnh sửa/đồng bộ.
3. Bổ sung cột `Updated At` vào bảng mục lục `only-one/domains/<domain>/use-cases/README.md` để theo dõi tổng quan thời gian đồng bộ của domain.

### Bằng chứng và tệp tham chiếu
- File workflow nguồn: [assets/workflows/only-one-sync.md](file:///Users/kiem/Sources/Personal/only-one-cli/assets/workflows/only-one-sync.md#L140-L188)
- File workflow runtime local: [.agents/workflows/only-one-sync.md](file:///Users/kiem/Sources/Personal/only-one-cli/.agents/workflows/only-one-sync.md#L140-L188)

---

## Section 2. Design

### Đề xuất cấu trúc thời gian chuẩn cho Use Cases

#### 1. Frontmatter Use Case (`.md`)
```yaml
---
id: UC-<DOMAIN-ABBR>-<NNN>
title: <Title in English>
domain: <domain>
status: draft
implemented_by: []
created_at: <YYYY-MM-DD>
updated_at: <YYYY-MM-DD>
---
```
- Khi **tạo mới (NEW)**: Cả `created_at` và `updated_at` được gán ngày hiện tại (`<YYYY-MM-DD>`).
- Khi **chỉnh sửa (CHANGED)**: Giữ nguyên `created_at` ban đầu, cập nhật `updated_at: <YYYY-MM-DD>` thành ngày hiện tại.

#### 2. Bảng mục lục Index (`README.md`)
```markdown
# <Domain Name> — Use Cases

| ID | Title | Status | Updated At |
|---|---|---|---|
| UC-<ABBR>-<NNN> | <Title> | draft | <YYYY-MM-DD> |
```

---

## Section 3. Implementation architecture

### Cấu trúc tệp thay đổi

```text
[MODIFY] assets/workflows/only-one-sync.md
[MODIFY] .agents/workflows/only-one-sync.md
```

### Trách nhiệm các tệp:
- `assets/workflows/only-one-sync.md`: Cập nhật hướng dẫn Step 2a (đọc `created_at`, `updated_at`), Step 4a (quản lý `created_at` và `updated_at` khi tạo mới/chỉnh sửa), và Step 4b (bảng index có cột `Updated At`).
- `.agents/workflows/only-one-sync.md`: Đồng bộ nội dung vào runtime workflow của workspace.

---

## Section 4. Implementation code examples

### [MODIFY] `assets/workflows/only-one-sync.md`
**Overview:** Cập nhật các bước trong `only-one-sync.md` để ghi nhận thời gian `created_at`, `updated_at` cho từng use case và hiển thị trong index `README.md`.

**Chi tiết các mục cập nhật:**

#### 1. Step 2a — Read existing use cases
Ghi nhận thêm `created_at` và `updated_at` từ frontmatter của từng file.

#### 2. Step 4a — Process Use Cases
- **CHANGED use cases**: Giữ nguyên `created_at`, cập nhật `updated_at: <YYYY-MM-DD>` theo ngày chạy sync.
- **NEW use cases**: Khởi tạo template với cả `created_at` và `updated_at`:
```markdown
---
id: UC-<DOMAIN-ABBR>-<NNN>
title: <Title in English>
domain: <domain>
status: draft
implemented_by: []
created_at: <YYYY-MM-DD>
updated_at: <YYYY-MM-DD>
---
```

#### 3. Step 4b — Update Domain Index
Cập nhật định dạng bảng trong `only-one/domains/<domain>/use-cases/README.md`:
```markdown
# <Domain Name> — Use Cases

| ID | Title | Status | Updated At |
|---|---|---|---|
| UC-<ABBR>-<NNN> | <Title> | draft | <YYYY-MM-DD> |
```

### [MODIFY] `.agents/workflows/only-one-sync.md`
**Overview:** Đồng bộ toàn bộ nội dung từ `assets/workflows/only-one-sync.md`.

---

## Section 5. Test cases

### Kịch bản kiểm thử

#### 1. Kiểm thử định dạng Use Case Template & README Index
- **Objective:** Đảm bảo hướng dẫn trong workflow mô tả chính xác cách tạo `created_at`, `updated_at` và cấu trúc 4 cột trong `README.md`.
- **Action:** Kiểm tra nội dung Step 4a và Step 4b trong `assets/workflows/only-one-sync.md` và `.agents/workflows/only-one-sync.md`.
- **Expected result:** Hướng dẫn đầy đủ, rõ ràng và nhất quán bằng tiếng Anh.

#### 2. Kiểm thử CLI Build & Test
- **Objective:** Đảm bảo toàn bộ test suites và build của `only-one-cli` thành công.
- **Action:** Chạy `npm run test && npm run build`.
- **Expected result:** Tất cả test cases pass, build thành công.

### Lệnh kiểm chứng
```bash
npm run test && npm run build
```
