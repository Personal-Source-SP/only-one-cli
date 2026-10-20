---
slug: eslint-rules-assets-and-evolve
created_at: 2026-10-20T14:43:13+07:00
status: concept
---

# Concept: ESLint Custom Rules Assets Catalog & AST Evolution Trong only-one-evolve

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Điểm nghẽn & Thiếu sót hiện tại)
- **Context & Trigger**: Dự án `only-one-cv/eslint-rules` có bộ custom ESLint rules chất lượng nhưng nằm cục bộ, chưa thể tái sử dụng cho các dự án khác.
- **Symptom & Defect**: Các dự án mới (Next.js, NestJS) phải cấu hình linter thủ công. Không có cơ chế chuẩn hóa rule theo từng framework.
- **Root Cause**: `only-one-cli/assets` chưa có catalog quản lý template ESLint rules dạng Flat Config. Kỹ năng `only-one-evolve` hiện chỉ ghi chú bổ sung văn bản vào `SKILL.md` (Soft Guardrail) thay vì chặn lỗi bằng AST linter (Hard Gate).
- **Impact / Blast Radius**: AI liên tục lặp lại các lỗi cú pháp và kiến trúc (sai thứ tự hook, import chéo layer, hardcode token). Reviewer tốn nhiều thời gian nhắc nhở thủ công.

### Goal (Kết quả kỹ thuật mục tiêu)
- **Core Goal**: Đóng gói bộ ESLint Flat Config rules vào `assets/` theo preset modular và nâng cấp `only-one-evolve` tự động chuyển hóa lỗi lặp lại thành AST rules.
- **Acceptance Criteria**:
  - Phân tách 8 custom rules từ `only-one-cv` thành các bộ presets modular trong `assets/eslint-rules/`.
  - Hỗ trợ triển khai template chuẩn ESLint v9 Flat Config (`eslint.config.mjs`) vào dự án người dùng qua CLI / combo.
  - Tích hợp presets tương ứng vào `frontend-flow` (React, Next.js, Tokens) và `backend-flow` (Architecture, Async Safety).
  - Bổ sung tính năng cho `only-one-evolve`: phát hiện lỗi lặp lại ($\ge 2$ lần) trong `only-one/improvements/` và đề xuất sinh ESLint AST rule mới.
  - Cung cấp template sinh rule AST và tự động đăng ký vào `eslint.config.mjs` của dự án mục tiêu.

## 2. Scope Boundaries (Ranh giới phạm vi)
- **In-Scope**:
  - Di chuyển và chuẩn hóa 8 rules từ `only-one-cv/eslint-rules` sang `assets/eslint-rules/`.
  - Phân nhóm thành 5 bộ preset: `typescript-core`, `architecture`, `react-nextjs`, `design-system`, `i18n`.
  - Mẫu cấu hình Flat Config `eslint.config.mjs` dạng plugin độc lập (`customRulesPlugin`).
  - Logic phân tích pattern trong `only-one-evolve` để nhận diện lỗi có thể linter hóa.
  - Script scaffold tự động file rule AST mới và bộ test mẫu `RuleTester`.
- **Explicit Out-of-Scope**:
  - Xuất bản npm package lên public npm registry (triển khai thuần túy qua template files trong project).
  - Hỗ trợ chuẩn Legacy ESLint v8 (`.eslintrc.js`).
  - Tự động sửa mã nguồn (autofix) cho tất cả các rule phức tạp.

## 3. Proposed Solution & Core Mechanism (Giải pháp đề xuất & Cơ chế cốt lõi)

### Core Mechanism (Cơ chế hoạt động)
1. **Modular ESLint Assets Catalog**:
   - Thư mục `assets/eslint-rules/` chứa các rule độc lập và file đăng ký plugin ESM.
   - Các preset modular cho phép từng combo cài đặt đúng các rule cần thiết mà không bị thừa thãi.
2. **Template Deployment Engine**:
   - Khi chạy `only-one init` hoặc cài combo, CLI copy thư mục `eslint-rules/` và `eslint.config.mjs` vào thư mục gốc của dự án.
   - Plugin được export dưới dạng modular để dễ dàng tích hợp vào mảng config có sẵn của người dùng.
3. **AST Evolution Engine trong `only-one-evolve`**:
   - Quét toàn bộ `only-one/improvements/*.md`.
   - Lọc các lỗi lặp lại có tính chất cú pháp tĩnh (imports, call expressions, hook order, naming conventions).
   - Đề xuất hai nhánh tiến hóa:
     - Nhánh 1: Cập nhật prompt text vào `SKILL.md` (nếu là quy trình/tư duy).
     - Nhánh 2: Sinh file rule AST mới tại `eslint-rules/<rule-name>.js` và cập nhật `eslint.config.mjs` (nếu là lỗi code có thể bắt bằng linter).

### Conceptual Flow (Biểu đồ luồng hoạt động)
```mermaid
flowchart TD
    subgraph Assets["only-one-cli/assets/eslint-rules"]
        Core["presets/core.js (async-safety, interface-order)"]
        Arch["presets/architecture.js (boundaries)"]
        ReactNext["presets/react-nextjs.js (hooks, page-isolation)"]
        Tokens["presets/design-tokens.js"]
        I18n["presets/i18n.js"]
        FlatConfig["eslint.config.mjs"]
    end

    subgraph TargetProject["Dự án Mục tiêu (Project Root)"]
        Deploy["only-one combo / init"] --> LocalRules["eslint-rules/"]
        Deploy --> LocalConfig["eslint.config.mjs"]
    end

    subgraph EvolveProcess["only-one-evolve Workflow"]
        Improvements["only-one/improvements/*.md"]
        Analyzer["Pattern & Frequency Analyzer (>= 2 lần)"]
        Decision{"Có thể bắt bằng AST?"}
        PromptBranch["Cập nhật Guardrail vào SKILL.md"]
        LinterBranch["Sinh AST Rule mới: eslint-rules/custom-rule.js"]
        HookConfig["Đăng ký Rule vào eslint.config.mjs"]
    end

    Improvements --> Analyzer --> Decision
    Decision -->|Không (Workflow/Thinking)| PromptBranch
    Decision -->|Có (Cú pháp/Import/Pattern)| LinterBranch
    LinterBranch --> LocalRules
    LinterBranch --> HookConfig
```

### CLI Interaction Wireframes (Giao diện tương tác terminal)

#### 1. Setup Preset khi chạy `only-one init` / `combo`
```text
┌─ ONLY-ONE ESLINT SETUP ─────────────────────────────────────────────────────┐
│ Chọn các bộ preset ESLint Custom Rules muốn áp dụng:                        │
│                                                                             │
│ [x] TypeScript Core     (async-safety, interface-member-ordering)           │
│ [x] Architecture        (architectural-boundaries)                          │
│ [x] React & Next.js     (react-hooks-order, page-file-isolation)            │
│ [ ] Strict Design Tokens(chặn hardcode màu/padding tự do)                    │
│ [ ] Strict I18n         (chặn hardcode text trong JSX)                      │
│                                                                             │
│ Template deployed: ./eslint-rules/ & ./eslint.config.mjs                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Luồng đề xuất sinh AST Rule trong `only-one-evolve`
```text
┌─ ONLY-ONE EVOLVE: DETECTED RECURRENT MISTAKE ───────────────────────────────┐
│ Phát hiện lỗi lặp lại 3 lần trong only-one/improvements/:                   │
│ Pattern: "Agent liên tục import trực tiếp private internal helper qua tầng" │
│                                                                             │
│ [Đề xuất Tiến hóa]:                                                         │
│ ( ) Cập nhật thêm câu nhắc vào only-one-apply/SKILL.md (Soft Guardrail)     │
│ (•) Sinh ESLint AST Rule: eslint-rules/no-private-imports.js                │
│     và tự động hook vào eslint.config.mjs (Hard Linter Gate)                │
│                                                                             │
│ [Enter] Xác nhận sinh mã rule  [Esc] Bỏ qua                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Critical Risks & Edge Cases (Rủi ro & Xử lý ngoại lệ)
- **Xung đột cấu hình Flat Config sẵn có**: Người dùng đã có file `eslint.config.js` phức tạp. Hệ thống thiết kế `customRulesPlugin` độc lập để user chỉ cần import plugin vào mảng cấu hình mà không làm mất cấu hình cũ.
- **AST Selector sai lệch (False Positive)**: Rule sinh tự động có thể bắt nhầm code hợp lệ. Hệ thống bắt buộc sinh kèm file kiểm thử `RuleTester` và script verify nhanh: `npx eslint <target-file>`.
- **Hiệu năng linter khi số lượng custom rules tăng**: Các AST visitor duyệt sâu cây cú pháp có thể làm chậm quá trình lint. Mỗi rule bắt buộc định danh chính xác selector ở cấp node (vd: `ImportDeclaration`, `CallExpression`) thay vì duyệt toàn bộ node `Program`.
