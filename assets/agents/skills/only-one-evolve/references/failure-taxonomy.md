# Skill Deficiency Classification Taxonomy

## 1. Ambiguous Instruction (Chỉ dẫn mơ hồ)
- **Symptom**: Agent hiểu sai intent, tạo code sai naming convention hoặc gọi sai API.
- **Fix Pattern**: Bổ sung định nghĩa ranh giới rõ ràng hoặc ví dụ cụ thể.

## 2. Missing Guardrail (Thiếu chốt chặn an toàn)
- **Symptom**: Agent chỉnh sửa mã nguồn ngoài phạm vi task hoặc tự động bypass test fail.
- **Fix Pattern**: Thêm mục `🛑 STRICTLY FORBIDDEN` trong Section Guardrails.

## 3. Missing Checklist Item (Thiếu mục kiểm tra trước cổng)
- **Symptom**: Agent quên chạy lint, quên kiểm tra dependency hoặc quên type check trước khi kết luận.
- **Fix Pattern**: Bổ sung một mục checkbox `[ ]` vào Section Protocol trước Terminal Gate.

## 4. Premature Exit Gate (Thoát sớm chưa đạt nghiệm)
- **Symptom**: Agent báo hoàn thành khi test chưa pass 100% hoặc chưa chạy build check.
- **Fix Pattern**: Thêm điều kiện tiên quyết (Prerequisite barrier) trước bước completion.
