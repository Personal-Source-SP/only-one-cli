# Concept: Sparring Partner & Anti-Sycophancy Skill cho Agentic AI

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Người dùng thảo luận giải pháp kỹ thuật, đề xuất kiến trúc hoặc đặt câu hỏi mang tính định hướng (confirmatory prompt) cho AI Agent trong quá trình phân tích ý tưởng và lập kế hoạch.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: AI Agent mắc hội chứng Sycophancy (nịnh bợ, đồng thuận mù quáng), liên tục tán dương đề xuất của người dùng và gật đầu trước các thiết kế còn điểm mù.
- **Nguyên nhân cốt lõi (Root Cause)**: Mô hình LLM được huấn luyện alignment (RLHF) ưu tiên tính thân thiện và dễ chịu; thiếu cơ chế ràng buộc cấu trúc (structural constraints) để kích hoạt tư duy phản biện trước khi đưa ra nhận định.
- **Tác động (Impact / Blast Radius)**: Bỏ lọt các điểm mù kiến trúc, che giấu rủi ro edge cases, gia tăng technical debt và mở rộng blast radius khi giải pháp thiếu sót được triển khai thực tế.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Xây dựng một Skill chuyên trách theo mô hình Sparring Partner, ép Agent phải thực hiện phân tích phản biện độc lập, chỉ ra rủi ro và bảo vệ lập trường kỹ thuật trước khi đồng thuận.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Loại bỏ hoàn toàn các câu mào đầu tán dương sáo rỗng (Sycophantic Fillers).
  - Bắt buộc thẩm định giải pháp qua 5 trục kỹ thuật (Boundary Conditions, Over-engineering, Blast Radius & Maintainability, Concurrency & State Race, Scalability & Security).
  - Đưa ra nhận định kỹ thuật độc lập (Agent's Standpoint) và phương án đề xuất thay thế tối ưu hơn nếu giải pháp ban đầu tồn tại rủi ro.
  - Tôn trọng quyết định cuối cùng của người dùng (Tech Lead/PM) sau khi các rủi ro và trade-offs đã được minh bạch hóa.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**:
  - Đặc tả hành vi và trigger cho Skill phản biện theo tiêu chuẩn cấu trúc Agentic Skill (`SKILL.md`).
  - Bộ quy tắc thẩm định 5 trục (Evaluation Rubric) và cấu trúc phản hồi bắt buộc (Response Template).
  - Tích hợp nguyên tắc Evidence-First (đưa luận cứ phản biện trước khi đồng thuận).
- **Explicit Out-of-Scope**:
  - Không sửa đổi mã nguồn TypeScript hoặc hệ thống build CLI trong giai đoạn này.
  - Không can thiệp vào các workflow triển khai mã nguồn chi tiết (`/only-one-apply`).
  - Không xây dựng cơ chế tranh luận vô tận hoặc từ chối thực thi khi người dùng đã chốt quyết định.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)
- **Core Mechanism**:
  - Áp dụng nguyên lý "Ask Don't Tell" kết hợp cơ chế Structural Anti-Sycophancy: Biến các câu hỏi xác nhận thành bài toán stress-test hệ thống.
  - Cơ chế 3 tầng phản hồi:
    1. *Tầng rà soát giả định (Unstated Assumptions Check)*: Bóc tách các giả định ngầm có thể sai sót trong đề xuất của người dùng.
    2. *Tầng phản biện đa chiều (Multi-Vector Pushback)*: Soi xét rủi ro qua 5 khía cạnh kỹ thuật cốt lõi.
    3. *Tầng lập trường & đề xuất thay thế (Agent Standpoint & Counter-Proposal)*: Đưa ra kết luận kỹ thuật rõ ràng và gợi ý kiến trúc tốt hơn.
- **Conceptual Flow / Domain Model**:
  - `User Idea / Query` ➔ `Hypothesis & Premise Extraction` ➔ `Adversarial Stress Test (5 Vectors)` ➔ `Substantive Risks Surfaced` ➔ `Agent's Independent Standpoint` ➔ `Collaborative Decision Gate`.

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Rủi ro cản trở tiến độ (Friction Overload)**: Agent phản biện quá mức ngay cả với những câu hỏi đơn giản hoặc tác vụ vụn vặt; cần cơ chế nhận diện ngữ cảnh để chỉ kích hoạt phản biện sâu khi thảo luận thiết kế, kiến trúc hoặc kế hoạch.
- **Rủi ro tranh cãi vô hạn (Argument Loop)**: Agent cố tình bảo thủ lập trường cá nhân mà không chấp nhận sự đánh đổi có chủ đích của dự án; giải quyết bằng quy ước User Override rõ ràng.
