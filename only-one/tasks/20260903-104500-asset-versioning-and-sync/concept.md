# Concept: Triển khai Quản lý Phiên bản Độc lập (Asset Versioning) & Cơ chế Đồng bộ (Sync/Update) cho Assets

## 1. Problem Statement & Root Need (Bối cảnh & Vấn đề Cốt lõi)
- **Core Business Problem**:
  - Hiện tại, các tài nguyên mẫu trong thư mục `assets/` (bao gồm `workflows`, `skills`, `rules`, `mcps`, `packages`, `configs`, `combos`, `git`) chưa có thuộc tính `version` độc lập.
  - Cơ chế cập nhật hiện tại (`only-one update`) chủ yếu dựa vào việc đối chiếu toàn cục `cliVersion` (`installedVersion !== cliVersion`). Điều này dẫn đến sự ràng buộc chặt (tight coupling): mỗi khi CLI release phiên bản mới, toàn bộ skills/workflows đều bị coi là outdated, hoặc ngược lại, khi chỉ một workflow/rule nhỏ được cập nhật thì CLI không có cách nào xác định chính xác thành phần nào trong dự án người dùng cần được đồng bộ.
  - Thiếu cơ chế kiểm soát chất lượng (quality gate) để bắt buộc developer phải tăng version khi chỉnh sửa nội dung asset, dẫn đến nguy cơ template bị sửa đổi nhưng không thể phát hiện để migration trong các dự án tiêu dùng (consumer projects).
- **Target Audience & Core Value**:
  - **Target Audience**: Nhà phát triển CLI (`only-one` maintainers) và lập trình viên sử dụng CLI trong các dự án cá nhân/doanh nghiệp.
  - **Core Value**:
    - Quản lý phiên bản chi tiết đến từng thành phần hạt nhân (atomic component-level versioning).
    - Đồng bộ hóa và cập nhật chính xác (granular sync/update), chỉ thay thế hoặc nâng cấp những file thực sự có thay đổi phiên bản.
    - Duy trì tính toàn vẹn (integrity) và khả năng tái lập (reproducibility) giữa repository CLI và môi trường dự án người dùng.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

### In-Scope
- **Asset Manifest Schema Extension**:
  - Bổ sung trường bắt buộc `version: string` vào tất cả các interface manifest trong `assets/types.ts` (`RuleManifest`, `PackageManifest`, `McpManifest`, `SkillManifest`, `WorkflowManifest`, `ConfigManifest`, `ComboManifest`, `GitAssetManifest`).
  - Gán giá trị phiên bản khởi tạo mặc định là `"0.0.1"` cho toàn bộ các asset manifests hiện hữu trong `assets/`.
- **Decimal Rollover Versioning Algorithm**:
  - Xây dựng thuật toán tăng phiên bản cơ số 10 (`0.0.1` $\rightarrow$ `0.0.9` $\rightarrow$ `0.1.0` $\rightarrow$ `0.9.9` $\rightarrow$ `1.0.0`).
- **Developer Experience & Version Gate**:
  - Xây dựng công cụ hỗ trợ tăng version (`pnpm asset:bump <type> <id>` hoặc CLI helper).
  - Thiết lập automated test suite / CI check: kiểm tra `git diff` so với commit gốc/nhánh chính (`main`); nếu bất kỳ file nội dung nào của một asset bị thay đổi mà `version` của manifest đó không tăng thì sẽ fail test ngay lập tức.
- **Consumer Project State Tracking (Lockfile)**:
  - Thiết kế và lưu trữ trạng thái cài đặt tập trung tại `.only-one/installed.json` trong dự án người dùng, ghi nhận chi tiết từng asset ID cùng version được cài đặt tại thời điểm thực thi.
- **Sync / Update Engine Integration**:
  - Nâng cấp lệnh `only-one update` để đọc `.only-one/installed.json`, so sánh với danh mục manifest trong CLI, hiển thị bảng trạng thái chi tiết (Up to date vs Outdated) và cho phép người dùng lựa chọn cập nhật.

### Explicit Out-of-Scope
- Không hỗ trợ Semantic Versioning với số phiên bản vượt quá cơ số 10 (ví dụ: `0.0.10`, `0.0.11` là không hợp lệ theo quy chuẩn bài toán).
- Không tự động commit hoặc push code khi chạy helper script bump version (dev vẫn toàn quyền kiểm soát git commit).
- Không tự động resolve 3-way merge conflict nếu người dùng đã tự chỉnh sửa thủ công sâu vào file asset trong dự án cá nhân (sẽ cảnh báo overwrite hoặc backup file trước khi đè).

---

## 3. Success Metrics (Thước đo Thành công / Definition of Done)
1. **Schema & Asset Coverage**: 100% các thành phần asset trong `assets/` có trường `version` với giá trị ban đầu `"0.0.1"`, vượt qua typecheck TypeScript (`tsc --noEmit`).
2. **Version Arithmetic Accuracy**: 100% unit tests của bộ tăng phiên bản Decimal Rollover vượt qua kiểm thử (bao gồm các bước nhảy biên: `0.0.9` $\rightarrow$ `0.1.0`, `0.1.9` $\rightarrow$ `0.2.0`, `0.9.9` $\rightarrow$ `1.0.0`).
3. **CI Gate Zero-Bypass**: Test suite CI chặn thành công 100% các trường hợp sửa file nội dung asset (ví dụ file `.md` hoặc `.ts`) mà quên tăng `version` trong manifest tương ứng.
4. **Lockfile Reliability**: Lệnh cài đặt (`workflow`, `skill`, `rule`...) và lệnh `update` tự động ghi nhận chính xác 100% danh mục asset và version tương ứng vào `.only-one/installed.json` mà không làm hỏng cấu hình dự án.
5. **Update Experience**: Lệnh `only-one update` phát hiện chính xác trạng thái outdated của từng asset đơn lẻ trong thời gian dưới 500ms đối với dự án tiêu chuẩn.

---

## 4. Proposed Solution & Core Mechanism (Phương pháp Giải quyết & Cơ chế Xử lý)

### 4.1. Explored Options & Trade-off Analysis (Các Phương án Đã Cân Nhắc)

| Option | Hướng tiếp cận | Ưu điểm (Pros) | Nhược điểm (Cons) | Độ phức tạp | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1** | **Manual Manifest Bump + Git Diff CI Gate** | Đơn giản, không sinh thêm tooling trung gian. | Dev dễ gõ nhầm version sai quy tắc (e.g. gõ `0.0.10`), tốn thao tác thủ công. | Low | Loại (trải nghiệm dev chưa tối ưu). |
| **Option 2 (Chosen)** | **Scripted Helper Bump + Automated CI Gate + Project Lockfile** | Chuẩn hóa quy tắc nhảy version cơ số 10; CI chặn lỗi triệt để; lockfile `.only-one/installed.json` rõ ràng, tách bạch với file mã nguồn. | Cần cài đặt thêm script helper và quản lý vòng đời file lockfile. | Medium | **Lựa chọn chính thức (Best Practice)**. |
| **Option 3** | **Content-Hash Driven Auto-Bump via Pre-commit Hook** | Tự động hoàn toàn, dev không cần nhớ việc bump version. | Hành vi tự sửa file khi commit (magic behavior) dễ gây bất ngờ, khó phân định khi rebase/merge conflict. | High | Loại (tiềm ẩn rủi ro cao). |

- **Chosen Strategy**: **Option 2** - Kết hợp script hỗ trợ tính toán Decimal Rollover chuẩn xác, test suite kiểm soát chặt chẽ trên git diff, và lockfile `.only-one/installed.json` theo dõi trạng thái cài đặt tại consumer project.

---

### 4.2. Core Processing Flow (Luồng Xử lý / Chuyển trạng thái Chính)

#### A. Luồng Phát triển & Kiểm soát Version trong CLI (Developer Lifecycle)
1. **Trigger**: Developer chỉnh sửa nội dung của một thành phần (ví dụ: `assets/workflows/only-one-idea.md`).
2. **Version Bump**:
   - Dev chạy lệnh helper: `pnpm asset:bump workflow only-one-idea`.
   - Tool đọc `WORKFLOWS` trong `assets/workflows/index.ts`, tìm manifest `only-one-idea`, áp dụng thuật toán Decimal Rollover (ví dụ: `0.0.1` $\rightarrow$ `0.0.2`), và ghi lại vào file manifest.
3. **Validation / CI Gate**:
   - Khi chạy test hoặc mở PR, script kiểm tra chạy: `git diff origin/main -- assets/`.
   - Phân tích các file thay đổi theo từng nhóm component. Nếu `assets/workflows/only-one-idea.md` đổi mà `version` trong manifest không đổi $\rightarrow$ **Ném lỗi và chặn build**.

#### B. Luồng Cài đặt & Cập nhật trong Dự án Người dùng (Consumer Project Lifecycle)
```mermaid
flowchart TD
    A[Người dùng chạy only-one update] --> B[Đọc file .only-one/installed.json]
    B --> C{Lockfile tồn tại?}
    C -- Không --> D[Thông báo chưa có asset nào được quản lý / Hướng dẫn cài đặt]
    C -- Có --> E[Đối chiếu từng asset: Installed Version vs CLI Latest Version]
    E --> F{Có asset nào Outdated?}
    F -- Không --> G[Hiển thị: All assets up to date]
    F -- Có --> H[Hiển thị bảng so sánh & Interactive Multi-select]
    H --> I[Người dùng xác nhận cập nhật các assets đã chọn]
    I --> J[Ghi đè file template mới vào thư mục tương ứng]
    J --> K[Cập nhật version mới tương ứng trong .only-one/installed.json]
    K --> L[In báo cáo hoàn tất (Success Report)]
```

---

### 4.3. UI Wireframe / Visual Mockup (Mẫu Phác thảo Giao diện CLI Update)

```text
=====================================================================
                     ONLY-ONE ASSETS UPDATE INSPECTOR
=====================================================================

Target Project: /Users/kiem/Sources/PERSONAL/my-app
Lockfile: .only-one/installed.json

  Component Type   Asset Name         Installed   Latest   Status
  -------------------------------------------------------------------
  [workflow]       only-one-idea      0.0.1       0.0.2    ▲ Outdated
  [workflow]       only-one-plan      0.0.1       0.0.1    ✓ Up to date
  [skill]          c4-diagrams        0.0.1       0.1.0    ▲ Outdated
  [rule]           01-context-tools   0.0.1       0.0.1    ✓ Up to date

? Select assets to update:
  [x] [workflow] only-one-idea (0.0.1 -> 0.0.2)
  [x] [skill]    c4-diagrams   (0.0.1 -> 0.1.0)
  -------------------------------------------------------------------
  [Space: Toggle | A: Select All | Enter: Confirm Update | Esc: Cancel]
```

- **State Handling Matrix**:
  - **Empty State**: Không tìm thấy `.only-one/installed.json` hoặc trường `installed` trống $\rightarrow$ In thông báo hướng dẫn: *"No tracked assets found in this project. Use `only-one init` or install individual components first."*
  - **All Up-to-Date State**: Toàn bộ `installed_version == latest_version` $\rightarrow$ In thông báo màu xanh dịu: *"✓ All installed assets are up to date (0 pending updates)."*
  - **Outdated State**: Phát hiện ít nhất 1 asset có version cũ hơn $\rightarrow$ Hiển thị danh sách đánh dấu `▲ Outdated`, tự động chọn các mục cần update và cho phép bấm Enter để thực thi.
  - **Corrupted Lockfile State**: File `.only-one/installed.json` không parse được JSON hợp lệ $\rightarrow$ In cảnh báo lỗi cấu trúc kèm hướng dẫn khôi phục bằng cờ `--repair`.

---

### 4.4. Critical Edge Cases & Risk Handling (Kịch bản Biên & Xử lý Rủi ro)

1. **Local File Modifications (File người dùng đã sửa đổi thủ công)**:
   - *Risk*: Khi update ghi đè template mới, những tùy biến riêng của người dùng trong project có nguy cơ bị mất.
   - *Mitigation*: Khi chạy lệnh update không có cờ `--force`, CLI sẽ kiểm tra checksum nội dung; nếu phát hiện file bị modified so với phiên bản ban đầu, CLI sẽ tự động tạo bản sao dự phòng `.bak` (ví dụ: `only-one-idea.md.bak`) trước khi cập nhật.
2. **Partial Failure During Multi-Asset Update**:
   - *Risk*: Quá trình cập nhật 5 assets bị dừng đột ngột ở asset thứ 3 do lỗi phân quyền (EACCES) hoặc disk full.
   - *Mitigation*: Áp dụng cơ chế **Atomic Per-Asset Commit**: Chỉ cập nhật version vào `.only-one/installed.json` cho những asset đã hoàn tất việc sao chép file thành công.
3. **Decimal Rollover Overflow (`0.9.9` $\rightarrow$ `1.0.0`)**:
   - *Risk*: Lỗi logic parsing chuỗi khi chuyển cấp độ từ patch lên minor hoặc từ minor lên major.
   - *Mitigation*: Đảm bảo thuật toán xử lý qua mảng số nguyên `[major, minor, patch]` và được bao phủ 100% bằng unit tests chuyên biệt trước khi tích hợp vào core.

---

## 5. Technical English Key Patterns

### 1. Atomic Component-Level Isolation
- **Meaning (VI)**: Sự cô lập phiên bản ở cấp độ thành phần hạt nhân, đảm bảo thay đổi của một phần tử không làm ảnh hưởng tới các phần tử độc lập khác.
- **Grammar / Usage**: `Noun phrase` thường dùng trong thiết kế kiến trúc vi mô (micro-architecture) hoặc quản lý dependency.
- **Engineering Example**: *"By enforcing atomic component-level isolation, updating a single workflow manifest will not trigger unnecessary version increments across unrelated skills."*

### 2. Rollover Mechanism
- **Meaning (VI)**: Cơ chế cuốn chiếu / nhảy nấc số khi chạm ngưỡng giới hạn (ví dụ từ 9 quay về 0 và đẩy 1 đơn vị sang hàng bên trái).
- **Grammar / Usage**: `[Subject] rolls over to [Target]` hoặc `A rollover mechanism triggers when [Condition]`.
- **Engineering Example**: *"Under the decimal versioning strategy, any patch version exceeding 9 automatically rolls over to increment the minor version."*

### 3. Drift Detection
- **Meaning (VI)**: Cơ chế phát hiện sự sai lệch giữa trạng thái thực tế và trạng thái khai báo trong tài liệu/lockfile.
- **Grammar / Usage**: `Detect drift between [State A] and [State B]`.
- **Engineering Example**: *"The CI gate utilizes git diff analysis to detect any drift between modified asset contents and their corresponding manifest versions."*

### 4. Outdated Asset Reconciliation
- **Meaning (VI)**: Quá trình đối soát và đồng bộ hóa các tài nguyên đã lỗi thời về phiên bản mới nhất.
- **Grammar / Usage**: `Reconcile [Source] with [Target]`.
- **Engineering Example**: *"The update command inspects the project's lockfile to reconcile outdated assets against the latest templates provided by the CLI."*
