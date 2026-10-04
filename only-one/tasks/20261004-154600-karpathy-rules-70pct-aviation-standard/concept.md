# Concept: Tích hợp 4 Quy tắc Vàng Karpathy & Chuẩn Văn bản Hàng không 70% ASD-STE100

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Các workflows trong hệ thống (`/only-one-idea`, `/only-one-plan`, `/only-one-debug`) khi sinh các file Markdown (`concept.md`, `plan.md`, `debug.md`) thường bị ảnh hưởng bởi thiên kiến mặc định của LLM: sinh văn bản rườm rà ("AI Slop"), câu văn dài phức tạp, nhiều từ đệm xã giao và thiếu cấu trúc có thể kiểm chứng nhị phân (Pass/Fail).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  - Câu văn ghép nhiều mệnh đề khiến người đọc và các sub-agent tiếp theo khó parse thông tin trọng tâm.
  - Sử dụng thuật ngữ thiếu nhất quán (lúc dùng `terminate`, lúc dùng `abort`, `kill`, `stop` cho cùng một trạng thái).
  - Thiếu quy chuẩn kiểm soát độ dài câu và cấu trúc thực thi theo chuẩn hàng không (Prerequisites $\to$ Action $\to$ Verification).
- **Nguyên nhân cốt lõi (Root Cause)**: Hệ thống chưa có bộ quy tắc viết (Writing Stylebook) dạng controlled language và chưa tích hợp 4 kỷ luật thực thi cốt lõi (Core Disciplines) của Andrej Karpathy vào tầng quy chuẩn (`rules.md`) và kỹ năng (`assets/skills/index.ts`).
- **Tác động (Impact / Blast Radius)**: Làm loãng thông tin kỹ thuật, tăng số token lãng phí trong context window, và dễ dẫn đến sai lệch khi Agent chuyển tiếp từ bước Plan sang bước Apply.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Thiết lập bộ quy chuẩn "70% ASD-STE100" (Aviation Simplified Technical English phù hợp ngữ cảnh song ngữ Việt - Anh) kết hợp bộ 4 quy tắc vàng của Andrej Karpathy vào hệ thống kỹ năng và quy tắc của `only-one-cli`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **Khai báo Kỹ năng mới**: Tạo skill `karpathy-ste100-discipline` trong `assets/skills/index.ts` và thư mục kỹ năng tương ứng.
  - **Ràng buộc 70% ASD-STE100**:
    - Câu mệnh lệnh hành động (instruction): $\le 25$ từ.
    - Câu mô tả/bối cảnh (description): $\le 30$ từ.
    - 100% các bước hành động tuân thủ cấu trúc 3 tầng: `Prerequisites` $\to$ `Action` (bắt đầu bằng động từ hành động) $\to$ `Verification` (tiêu chí đo lường rõ ràng).
    - Cấm triệt để từ đệm sáo rỗng ("please", "should", "it is recommended", "cần lưu ý rằng", "như đã biết").
    - Nhất quán từ vựng: Chuẩn hóa bộ Action Verbs kỹ thuật (`Create`, `Update`, `Delete`, `Inspect`, `Verify`, `Refactor`).
  - **Ràng buộc 4 Kỷ luật Karpathy**:
    - `Think Before Coding`: Xác lập giả định rõ ràng, không suy diễn ngầm.
    - `Simplicity First`: Giải pháp tối giản nhất thỏa mãn bài toán (YAGNI).
    - `Surgical Changes`: Sửa đúng vị trí cần thiết, cấm format/refactor lan man.
    - `Goal-Driven Execution`: Định nghĩa Definition of Done có thể kiểm chứng tự động.
  - **Tích hợp Quy tắc Repository**: Bổ sung các điều khoản `[ALWAYS]` và `[NEVER]` vào `only-one/rules.md`.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Thiết kế đặc tả chi tiết cho chuẩn "70% ASD-STE100" và "Karpathy 4 Disciplines".
  - Thêm entry skill `karpathy-ste100-discipline` vào `assets/skills/index.ts`.
  - Tạo tài liệu hướng dẫn kỹ năng `SKILL.md` cho `karpathy-ste100-discipline`.
  - Cập nhật các ràng buộc trong `only-one/rules.md`.
  - Cập nhật hướng dẫn sinh văn bản trong các workflow nòng cốt (`only-one-idea.md`, `only-one-plan.md`, `only-one-debug.md`).
- **Explicit Out-of-Scope**:
  - Không áp dụng chuẩn 100% ASD-STE100 nguyên bản (vì từ điển giới hạn ~900 từ của ngành hàng không quân sự không tương thích với từ vựng phần mềm và ngữ cảnh song ngữ).
  - Không viết lại toàn bộ nội dung của các tài liệu cũ đã nằm trong `only-one/archives/`.
  - Không can thiệp vào mã nguồn logic của CLI ngoài các file định nghĩa assets/skills và workflows.

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. Phân tích 3 Phương án Kiến trúc

| Tiêu chí | Phương án 1: Chỉ cập nhật `rules.md` | Phương án 2: Tạo Skill độc lập | Phương án 3 (Khuyến nghị): Hybrid (Skill + Rules + Workflow Update) |
| :--- | :--- | :--- | :--- |
| **Cơ chế** | Thêm vài dòng quy tắc vào `only-one/rules.md`. | Tạo 1 skill `karpathy-ste100-discipline` trong `assets/skills/index.ts`. | Tạo Skill chi tiết + Đặt Rule bắt buộc trong `rules.md` + Nhúng định dạng mẫu vào các workflow `.md`. |
| **Ưu điểm** | Nhanh, không tăng thêm file cấu hình. | Tái sử dụng linh hoạt, có tài liệu hướng dẫn và ví dụ chi tiết. | Triệt để nhất: Agent vừa có skill tra cứu, vừa bị chặn bởi negative rules, vừa có template mẫu để bám sát. |
| **Nhược điểm** | Thiếu ví dụ minh họa và từ điển động từ; Agent dễ quên hoặc áp dụng hời hợt. | Nếu workflow không chủ động nạp skill thì quy chuẩn không được kích hoạt. | Cần cập nhật đồng bộ ở 3 vị trí (assets skill, rules, workflows). |
| **Đánh giá** | Tạm thời | Khá | **Tối ưu & Bền vững nhất** |

---

### 3.2. Đặc tả Chi tiết Quy chuẩn 70% ASD-STE100

```
┌────────────────────────────────────────────────────────────────────────┐
│               70% ASD-STE100 AVIATION SPECIFICATION                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Length Gate:                                                       │
│    - Instruction sentences: <= 25 words (tiếng Việt/Anh)               │
│    - Descriptive sentences: <= 30 words                               │
│                                                                        │
│ 2. Tri-Part Action Block:                                              │
│    - [PREREQUISITE] : Trạng thái/Dữ liệu cần có trước                 │
│    - [ACTION]        : Động từ hành động + Đối tượng cụ thể            │
│    - [VERIFICATION]  : Tiêu chí kiểm chứng Pass/Fail nhị phân          │
│                                                                        │
│ 3. Controlled Action Verbs:                                            │
│    - Create, Update, Delete, Refactor, Inspect, Verify, Rollback       │
│    (Cấm dùng lẫn lộn: make, fix up, tweak, check out, look at)         │
│                                                                        │
│ 4. Bilingual Rule:                                                     │
│    - Narrative & giải thích: Tiếng Việt súc tích                       │
│    - Thuật ngữ kỹ thuật: Giữ nguyên tiếng Anh chuẩn                    │
│                                                                        │
│ 5. Anti-Slop Filter:                                                   │
│    - Cấm tuyệt đối văn phong rào đón, xã giao, cảm thán                │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3.3. Đặc tả 4 Kỷ luật Karpathy (Karpathy Core Disciplines)

1. **Think Before Coding**:
   - Mọi giả định kỹ thuật phải được viết thành văn bản rõ ràng.
   - Khi có điểm mơ hồ, dừng lại hỏi người dùng hoặc liệt kê các nhánh rủi ro thay vì tự suy diễn ngầm.
2. **Simplicity First**:
   - Cấm tạo các wrapper abstractions, factory hoặc generic layer trước khi có ít nhất 3 use-cases cụ thể (Rule of Three / YAGNI).
   - Dừng lại ở giải pháp đơn giản nhất đạt tiêu chuẩn an toàn (Ponytail Principle).
3. **Surgical Changes**:
   - Phạm vi can thiệp code giới hạn nghiêm ngặt trong ranh giới của task.
   - Cấm "tiện tay" reformat khoảng trắng, đổi tên biến hoặc dọn dẹp các file không thuộc task.
4. **Goal-Driven Execution**:
   - Mọi task bắt buộc đi kèm lệnh kiểm thử nhanh (`Fast Test Command`) hoặc kịch bản kiểm thử độc lập.
   - Vòng lặp chỉ kết thúc khi toàn bộ Verification Checklist chuyển sang trạng thái đã nghiệm thu.

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro 1: Rào cản độ dài câu trong tiếng Việt**: Tiếng Việt có nhiều từ ghép và trợ từ hơn tiếng Anh, nếu áp mức $\le 20$ từ của 100% STE100 sẽ làm câu què cụt hoặc tối nghĩa.
  - *Chiến lược khắc phục*: Nâng trần lên $\le 25$ từ cho câu chỉ dẫn và $\le 30$ từ cho câu mô tả (chính là bản chất của việc hạ chuẩn xuống 70%).
- **Rủi ro 2: Dangling reference giữa assets và workflows**: Sửa `assets/skills/index.ts` nhưng quên khai báo trong `workflows/*.md` sẽ vi phạm rule 12 trong `only-one/rules.md`.
  - *Chiến lược khắc phục*: Khi triển khai ở `/only-one-plan`, lập task đồng bộ đồng thời cả 3 vị trí: `assets/skills/index.ts`, `only-one/rules.md` và các file `.agents/workflows/*.md`.
