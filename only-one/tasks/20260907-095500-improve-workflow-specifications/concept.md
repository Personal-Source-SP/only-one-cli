# Concept: Nâng Cấp Quy Trình Workflows (only-one-idea, only-one-plan, only-one-apply)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Hiện tượng**:
  - Trong workflow `/only-one-idea`, mục "Problem & Goal" trong `concept.md` đang sinh ra dưới dạng các đoạn văn đơn khối (monolithic paragraph) dài dính liền, gây khó khăn khi rà soát nhanh (scannability) và làm lu mờ ranh giới cốt lõi.
  - Trong workflow `/only-one-plan`, tài liệu `plan.md` trực tiếp chuyển từ Section 2 sang Section 3 mà thiếu sơ đồ cây thư mục tổng quan trực quan (visual directory tree) đánh dấu các tệp bị ảnh hưởng bằng nhãn tag (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
  - Trong quá trình lập kế hoạch `/only-one-plan`, việc nạp ồ ạt toàn bộ rules, skills và archives mà không có định hướng sẽ gây ô nhiễm ngữ cảnh (*context pollution*), tốn token và loãng tín hiệu. Ngược lại, nếu không nạp thì agent lại rơi vào bẫy *agent drift* và sinh ra diff code thiếu chính xác. Cần tiếp cận theo luồng **File-Centric / Target-Driven**.
  - **Trùng lặp tài liệu kế hoạch (Document Duplication)**: Tại Step 4 của `only-one-plan.md`, chỉ dẫn cũ (`Create artifact with RequestFeedback: true and UserFacing: true`) khiến các IDE AI (như Antigravity) tự động sinh thêm 1 file `implementation_plan.md` nội bộ trong thư mục brain/artifact của IDE, dẫn đến việc tồn tại 2 bản kế hoạch song song gây rác tài liệu và làm loãng nguồn chân lý duy nhất (*Single Source of Truth*).

- **Nguyên nhân cốt lõi (Root Cause)**:
  - Template `concept.md` trong `only-one-idea.md` chỉ có 2 dòng placeholder ngắn gọn khiến LLM gộp toàn bộ nội dung vào một câu dài duy nhất.
  - Template và hướng dẫn của `only-one-plan.md` chưa chuẩn hóa cây thư mục kèm tag trạng thái tệp trước Task Matrix.
  - Quy trình nghiên cứu trong `only-one-plan.md` chưa định nghĩa luồng làm việc 2 bước: *Xác định tệp mục tiêu trước $\rightarrow$ Truy quét rules/skills/archives tương ứng sau*.
  - Step 4 trong `only-one-plan.md` có dòng lệnh tạo artifact của IDE thay vì chỉ quy tụ về tệp `plan.md` duy nhất trong task folder.

- **Tác động (Impact / Blast Radius)**:
  - Giảm hiệu suất review tài liệu của PM và Tech Lead.
  - Lãng phí tài nguyên đĩa, gây nhầm lẫn phiên bản giữa `plan.md` và `implementation_plan.md` của IDE.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**:
  - Chuẩn hóa format trình bày của `concept.md` và `plan.md` thành các cấu trúc phân cấp, dạng danh sách gạch đầu dòng rõ ràng, trực quan, dễ rà soát nhanh.
  - Thiết lập luồng nghiên cứu **File-Centric / Target-Driven** trong `/only-one-plan`: Xác định các file cần thêm mới/chỉnh sửa/xóa trước, sau đó tìm kiếm và nạp có chọn lọc đúng các rules/skills của IDE và rules/archives của `only-one/` liên quan trực tiếp đến các file đó.
  - **Xóa bỏ hoàn toàn tài liệu kế hoạch trùng lặp của IDE**: Khẳng định `only-one/tasks/<slug>/plan.md` là nguồn chân lý duy nhất, nghiêm cấm sinh thêm file plan của IDE.

- **Hành vi & Tiêu chí Nghiệm thu (Acceptance Criteria)**:
  - `only-one-idea.md`: Mục "Problem & Goal" được tách biệt rành mạch thành danh sách gạch đầu dòng (Context/Trigger, Defect/Symptom, Root Cause, Impact đối với Problem; Core Goal, Expected Behaviors / Acceptance Criteria đối với Goal).
  - `only-one-plan.md`:
    - **Pha Khảo sát File-Centric (Targeted Research)**:
      1. *Bước 1 — Xác định tệp mục tiêu*: Lập danh sách các tệp dự kiến tác động (`[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]`).
      2. *Bước 2 — Truy vết Rules & Skills trúng đích*: Nạp đúng framework skills từ `.agents/rules/`, `.agents/skills/` và governance từ `only-one/rules.md`, `only-one/archives/*.md` tương ứng trực tiếp với các tệp đó.
    - **Section 3.1 Cây thư mục**: Hiển thị sơ đồ ASCII cây thư mục với các tag `[NEW]`, `[MODIFY]`, `[DELETE]`, `[RENAME]` trước bảng Task Matrix (Section 3.2).
    - **Section 4 Code Changes**: Đảm bảo khối diff được sinh ra tuân thủ chính xác 100% các tiêu chuẩn từ rules/skills đã nạp theo tệp.
    - **Triệt tiêu Artifact Phụ của IDE (Zero IDE Plan Artifacts)**: Xóa bỏ chỉ dẫn tạo artifact IDE ở Step 4, chỉ xuất duy nhất 1 file `plan.md` trong task folder.
  - `only-one-apply.md`: Nhận diện cây thư mục Section 3.1 và liên kết mượt mà với Task Matrix Section 3.2.
  - Đồng bộ 100% giữa `assets/workflows/` và `.agents/workflows/`, cập nhật `WORKFLOWS` manifest version.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cải tiến quy trình và template trong `assets/workflows/only-one-idea.md` & `.agents/workflows/only-one-idea.md`.
  - Cải tiến quy trình nghiên cứu File-Centric, cấu trúc Section 3 (3.1 Directory Structure & 3.2 Task Matrix), chốt chặn Rules/Skills Compliance Gate, và loại bỏ lệnh sinh IDE artifact trong `assets/workflows/only-one-plan.md` & `.agents/workflows/only-one-plan.md`.
  - Đồng bộ hóa các bước tiếp nhận và phân giải Section 3 trong `assets/workflows/only-one-apply.md` & `.agents/workflows/only-one-apply.md`.
  - Tăng patch version cho các workflow manifests trong `assets/workflows/index.ts` để đảm bảo Asset Version Gate luôn hợp lệ.
  - Bổ sung quy tắc vào `only-one/rules.md` (nếu cần) để chốt chặn vĩnh viễn tiêu chuẩn mới.

- **Explicit Out-of-Scope**:
  - Không sửa đổi mã nguồn thực thi lệnh CLI của `only-one-cli`.
  - Không tác động đến các workflows khác (`only-one-debug`, `only-one-review`, `only-one-pr-git`, `only-one-clockify`, `only-one-intranet`...).
  - Không can thiệp vào mã nguồn của dự án bên ngoài.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1 So sánh & Lựa chọn Phương án Kiến trúc

| Tiêu chí | Phương án 1: Tinh chỉnh nhẹ (Lightweight) | Phương án 2: Chuẩn hóa File-Centric & Nguồn Chân Lý Duy Nhất (Recommended) | Phương án 3: Tách rời Section Độc lập (Heavyweight) |
| :--- | :--- | :--- | :--- |
| **Cách tiếp cận** | Chỉ sửa template mẫu ở cuối file workflow, giữ nguyên việc sinh artifact IDE. | Định hướng theo tệp mục tiêu (File-Centric) + Cây thư mục 3.1 + Xóa bỏ hoàn toàn lệnh sinh artifact IDE ở Step 4. | Tách cây thư mục thành Section 3 riêng biệt, đẩy Task Matrix thành Section 4, Code Changes thành Section 5. |
| **Ưu điểm** | Nhanh, sửa đổi ít. | **Không ô nhiễm context, không trùng lặp tài liệu kế hoạch, bảo toàn Single Source of Truth, diff chuẩn xác 100%.** | Phân tách tuyệt đối từng phần thành các Section độc lập. |
| **Nhược điểm** | Vẫn sinh ra 2 bản plan song song gây rác tài liệu. | Cần cập nhật cả 3 workflow (`idea`, `plan`, `apply`). | Phá vỡ tính tương thích với `only-one/rules.md` và các quy ước Section 3 Task Matrix hiện hành. |
| **Đánh giá** | ⚠️ Vẫn gây rác tài liệu |  **Lựa chọn Tối ưu** | ❌ Phá vỡ tương thích |

### 3.2 Cơ chế Hoạt động Chi tiết (Option 2)

#### A. Cải tiến `only-one-idea.md`:
1. **Hướng dẫn bước khám phá (Step 1 Protocol)**:
   - Yêu cầu Senior BA bóc tách yêu cầu người dùng thành các gạch đầu dòng độc lập:
     - **Problem**: Context/Trigger, Symptom, Root Cause, Impact.
     - **Goal**: Core Goal, Key Acceptance Criteria.
   - Nghiêm cấm viết thành đoạn văn đơn khối dài dòng.
2. **Template `concept.md` (Step 3 Template)**:
   ```markdown
   ## 1. Problem & Goal (Vấn đề & Mục tiêu)

   ### Problem (Vấn đề & Điểm nghẽn)
   - **Bối cảnh & Hiện tượng**: <Mô tả ngắn gọn tình huống, module hoặc thao tác kích hoạt lỗi>.
   - **Nguyên nhân cốt lõi**: <Lý do kỹ thuật dẫn đến lỗi hoặc nhu cầu phát triển>.
   - **Tác động (Impact)**: <Phạm vi ảnh hưởng tới người dùng, hệ thống hoặc dữ liệu>.

   ### Goal (Mục tiêu Cốt lõi)
   - **Mục tiêu chính**: <Kết quả kỹ thuật bắt buộc đạt được>.
   - **Tiêu chí nghiệm thu (Acceptance Criteria)**:
     - <Gạch đầu dòng 1: Xử lý trạng thái / hành vi cụ thể>.
     - <Gạch đầu dòng 2: Đồng bộ API / dữ liệu>.
     - <Gạch đầu dòng 3: Xử lý ngoại lệ / fallback>.
   ```

#### B. Cải tiến `only-one-plan.md`:
1. **Quy trình Nghiên cứu Định hướng theo Tệp Mục tiêu (File-Centric Research Flow)**:
   - **Bước 1 — Xác định sơ bộ tập tệp bị tác động (Target Files Identification)**:
     - Từ `concept.md` và mã nguồn, liệt kê nhanh danh sách các tệp sẽ thêm mới (`[NEW]`), sửa đổi (`[MODIFY]`), hoặc xóa (`[DELETE]`).
   - **Bước 2 — Truy vết Tri thức Trúng đích (Targeted Knowledge Ingestion)**:
     - **IDE Framework Skills & Rules**: Nạp các rules từ `.agents/rules/` và file `SKILL.md` của đúng các skills framework tương ứng với loại tệp (ví dụ: `nestjs-development` cho NestJS backend). Tuyệt đối **không nạp tràn lan** các skills không liên quan.
     - **Only-One Governance & Targeted Archives**: Đọc `only-one/rules.md` (negative rules) và chỉ quét các file `only-one/archives/*.md` liên quan trực tiếp đến domain/module của các tệp mục tiêu.
   - **Bước 3 — Chốt chặn Kiểm soát Chất lượng Diff (Pre-Diff Compliance Gate)**:
     - Từng khối diff ở Section 4 phải tuân thủ nghiêm ngặt quy ước đã trích xuất từ các skills và rules đã nạp.

2. **Section 3: Hợp nhất Cấu trúc Thư mục và Task Matrix**:
   - **3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)**:
     Sơ đồ cây ASCII trực quan phân loại tất cả tệp bị ảnh hưởng bằng các tag chuẩn:
     ```text
     src/modules/order/
     ├── [MODIFY] order.service.ts         # Xử lý cascading filter và reset ward state
     ├── [NEW]    dto/order-filter.dto.ts  # DTO validate query parameters
     ├── [DELETE] legacy-filter.helper.ts  # Xóa helper cũ đã deprecated
     └── components/
         └── [MODIFY] StationsPage.tsx     # Controlled Select components & event handlers
     ```
   - **3.2 Task Matrix & Dependency Graph**:
     Bảng thứ tự thực thi nguyên tử với đầy đủ các cột chuẩn (`Order`, `Status`, `Action`, `File Path`, `Target Symbols / AST Seams`, `Reused Existing Utilities / Helpers`, `Depends On`, `Fast Test Command`).

3. **Loại bỏ Hoàn toàn Việc Tạo IDE Artifact (Single Plan Invariant)**:
   - Sửa mục `4. Review Gate & Next Steps`: Xóa bỏ dòng `Create artifact with RequestFeedback: true and UserFacing: true`.
   - Quy định rõ ràng: Chỉ lưu kế hoạch duy nhất tại `only-one/tasks/<slug>/plan.md`. Không tạo thêm bất kỳ file artifact kế hoạch nào của IDE (như `implementation_plan.md`).

#### C. Cải tiến `only-one-apply.md`:
- Cập nhật Step 3 để AI duyệt qua **Section 3.1 Directory Structure Changes** nhằm nắm bắt toàn cảnh cấu trúc trước, sau đó phân giải **Section 3.2 Task Matrix** để thực thi lần lượt từng file theo đúng thứ tự phụ thuộc.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro Ô Nhiễm Ngữ Cảnh (Context Pollution)**:
  - *Biện pháp*: Áp dụng luồng File-Centric: chỉ nạp skills và archives liên quan trực tiếp đến danh sách tệp mục tiêu.
- **Rủi ro Lệch Pha Phiên Bản (Asset Version Gate Failure)**:
  - *Biện pháp*: Nâng version tương ứng (`only-one-idea`: 0.0.3 $\rightarrow$ 0.0.4, `only-one-plan`: 0.0.3 $\rightarrow$ 0.0.4, `only-one-apply`: 0.0.2 $\rightarrow$ 0.0.3).
- **Rủi ro Bất Đồng Bộ giữa `assets/` và `.agents/`**:
  - *Biện pháp*: Luôn cập nhật song song cả 2 thư mục và kiểm tra bằng `diff -r`.
