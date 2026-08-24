# Learning Notes: Code Review & Refactoring

> Collection of technical English structures, expressions, and vocabulary extracted from task workflows.

## Patterns & Expressions

### 1. To prune [something] in favor of [something]
- **Meaning (VI)**: Cắt tỉa / loại bỏ bớt phần dư thừa, lỗi thời để chuyển sang giải pháp gọn gàng và tối ưu hơn.
- **Grammar / Usage**: `prune [dead/legacy code] in favor of [cleaner abstraction]`
- **Engineering Example**:
  > *"We pruned 200 lines of repetitive boilerplate code in favor of a shared TypeScript utility."*
- **Origin Task**: Initial Seed

### 2. To violate the Single Responsibility Principle (SRP)
- **Meaning (VI)**: Vi phạm nguyên lý đơn nhiệm (một module/class ôm đồm quá nhiều trách nhiệm khác nhau).
- **Grammar / Usage**: `[Class / Function] violates the Single Responsibility Principle by [Action]`
- **Engineering Example**:
  > *"This controller violates the Single Responsibility Principle by mixing HTTP transport logic with raw SQL execution."*
- **Origin Task**: Initial Seed

### 3. To adhere to [standard / convention]
- **Meaning (VI)**: Tuân thủ nghiêm ngặt theo một tiêu chuẩn, quy ước hoặc thiết kế định sẵn.
- **Grammar / Usage**: `adhere to [coding style / architectural convention]`
- **Engineering Example**:
  > *"All entity definitions strictly adhere to our project naming conventions."*
- **Origin Task**: Initial Seed
