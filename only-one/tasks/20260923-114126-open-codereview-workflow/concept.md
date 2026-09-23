# Concept: Tái thiết kế Code Review Workflow bằng Open CodeReview

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Trước khi mở Pull Request, người dùng cần review theo nhánh, toàn bộ working tree, hoặc một commit.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Workflow hiện tại tự mô tả nhiều review lenses nhưng chưa tích hợp review engine chuyên dụng, chưa có ba review mode rõ ràng, và report chưa tối ưu cho handoff sang Root Cause Analysis.
- **Nguyên nhân cốt lõi (Root Cause)**: Review orchestration, review intelligence và report normalization đang trộn lẫn. Chưa có canonical finding identity hoặc trạng thái xử lý cho workflow downstream.
- **Tác động (Impact / Blast Radius)**: Review thiếu nhất quán, khó truy vết nguồn nhận định, khó chạy lại đúng phạm vi, và cần thao tác thủ công khi chuyển issue sang `/only-one-debug`.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Dùng Open CodeReview (OCR) làm reviewer duy nhất; workflow chỉ chọn review mode, chạy OCR, chuẩn hóa output và tạo executable review blueprint cho `/only-one-apply`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Hỗ trợ ba mode tường minh: `branch`, `changes`, `commit`.
  - Không truyền mode: review current branch so với `main` bằng merge-base semantics.
  - `branch` nhận source/target refs; `changes` bao phủ staged, unstaged, untracked và ánh xạ sang OCR workspace mode; `commit` nhận SHA.
  - Mỗi lần review tạo task folder timestamped riêng và chỉ lưu `review.md` đã chuẩn hóa.
  - Narrative dịch sang tiếng Việt; giữ nguyên code symbols, paths, commands, technical terms và technical meaning.
  - Findings chia theo severity, có stable ID và lifecycle status.
  - Không thêm finding, severity hoặc technical judgment ngoài OCR output.
  - `/only-one-apply <review.md>` hiển thị multi-select cho các findings `OPEN`, chỉ thực thi findings được người dùng chọn.
  - Preflight `ocr --version`; thiếu OCR thì dừng, báo hướng dẫn official, không tự cài.

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - OCR là single review authority.
  - Explicit mode selection; default branch mode.
  - Validation branch refs và commit SHA.
  - Deterministic normalization sang tiếng Việt.
  - Severity sections, stable finding IDs, lifecycle status, review metadata.
  - Selection và execution contract cho `/only-one-apply`.
- **Explicit Out-of-Scope**:
  - Dual-perspective hoặc 5-axis second review.
  - Tự sửa source code.
  - Tự cài, nâng cấp hoặc cấu hình OCR.
  - Lưu raw OCR report riêng hoặc appendix trùng lặp.
  - Tự chạy `/only-one-apply` hoặc tạo Pull Request.
  - Suy luận bổ sung hoặc thay đổi OCR findings.
  - Review nhiều commit rời rạc trong cùng invocation.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Các phương án đã cân nhắc

| Phương án | Cơ chế | Ưu điểm | Nhược điểm | Quyết định |
| :--- | :--- | :--- | :--- | :--- |
| **A — OCR + deterministic normalizer** | OCR review; workflow dịch, phân severity, gán ID và status theo quy tắc cố định | Dễ audit, nhất quán, handoff tốt; OCR vẫn là reviewer duy nhất | Cần normalization contract chặt | **Chọn** |
| **B — OCR prompt-driven output** | OCR xuất trực tiếp Vietnamese schema | Ít hậu xử lý | Phụ thuộc model/config; schema dễ biến động | Loại |
| **C — OCR raw embedded** | Giữ raw output và thêm finding index | Bảo toàn nguyên văn | Dài, trùng nội dung, khó dùng downstream | Loại |

### Core Mechanism
- Cú pháp: `/only-one-review branch [from] [to]`, `/only-one-review workspace`, `/only-one-review commit <sha>`.
- Invocation không tham số canonicalize thành `branch(main, current-branch)`.
- Preflight xác nhận OCR executable, Git repository và mode-specific inputs. Failure dừng sớm, không tạo report giả.
- OCR chạy đúng một lần và là nguồn duy nhất tạo findings.
- Deterministic normalization:
  - dịch narrative sang tiếng Việt;
  - bảo toàn technical meaning, evidence, paths, line references, symbols, commands và snippets;
  - giữ severity OCR; thiếu severity dùng `UNCLASSIFIED`, không suy đoán;
  - gán ID theo severity và encounter order, ví dụ `OCR-BLOCKER-001`;
  - gán initial status `OPEN`;
  - không merge hoặc tạo findings mới.
- `review.md` là single artifact authority của lần review.

### Conceptual Flow / Domain Model
1. **Input Resolution**: resolve default hoặc explicit mode.
2. **Preflight**: OCR version, Git repository, refs/SHA validity.
3. **Review Execution**: chạy OCR với scope đã resolve và output target.
4. **Normalization**: parse, dịch, phân severity, gán ID/status, ghi metadata.
5. **Executable Blueprint**: Với mỗi OCR finding, workflow thực hiện evidence-first investigation để bổ sung Reproduction, Root Cause, Fix Constraints, ordered File Changes, Unified Diffs và Verification mà không sửa source code.
6. **Selection & Apply**: `/only-one-apply <review.md>` hiển thị multi-select findings `OPEN`, ghi lựa chọn thành `SELECTED`, rồi chỉ thực thi file tasks thuộc findings đó. Findings không chọn giữ `OPEN`.

### Canonical `review.md` Contract
- **Metadata**: review mode, source/target refs hoặc commit, timestamp, OCR version, execution status.
- **Summary**: bản dịch trung thực overall assessment từ OCR.
- **Findings**: `BLOCKER`, `WARNING`, `SUGGESTION`, `NIT`, `UNCLASSIFIED`.
- **Mỗi finding**: stable ID, lifecycle status, original severity, title, OCR evidence, Diagnosis, Reproduction, proven Root Cause, Fix Constraints, ordered machine-readable File Changes và Verification.
- **Handoff**: command `/only-one-apply <review.md>`; interactive multi-select chỉ liệt kê findings `OPEN`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Semantic drift khi dịch**: Chỉ dịch narrative; giữ nguyên technical tokens, snippets và evidence.
- **OCR schema biến động**: Nội dung không parse được vào `UNCLASSIFIED`; không bỏ hoặc đoán severity.
- **Không có findings**: Tạo clean report với empty findings; không tạo synthetic finding.
- **OCR thất bại/output rỗng**: Dừng với actionable error; không xuất report có vẻ hoàn chỉnh.
- **`main` không tồn tại**: Dừng và yêu cầu source ref; không âm thầm dùng branch khác.
- **Detached HEAD**: Dừng default mode; yêu cầu explicit branch hoặc commit.
- **Workspace sạch**: Báo no-op/clean theo OCR behavior; không đổi sang branch review.
- **SHA sai hoặc merge commit mơ hồ**: Validate và báo lỗi; không tự chọn parent.
- **Binary/large files**: Report ghi rõ omissions/limitations do OCR trả về.
- **Stable ID qua rerun**: Chỉ ổn định trong một report; không cam kết khi OCR đổi ordering.
- **Finding lifecycle**: `OPEN` → `SELECTED` → `IN_PROGRESS` → `FIXED`; findings không chọn giữ `OPEN`, finding thất bại giữ trạng thái có thể resume.
- **Trust boundary**: OCR finding là review evidence/hypothesis. Finding chỉ trở thành executable khi workflow chứng minh Root Cause và tạo đủ patch blueprint; nếu chưa chứng minh được thì giữ non-executable và không cho chọn apply.
