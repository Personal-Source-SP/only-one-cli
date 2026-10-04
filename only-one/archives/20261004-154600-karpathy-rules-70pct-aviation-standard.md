---
id: 20261004-154600-karpathy-rules-70pct-aviation-standard
title: Tích hợp 4 Kỷ luật Karpathy & Chuẩn Văn bản Hàng không 70% ASD-STE100
archived_at: 2026-10-04
status: active
references:
  - only-one/archives/20260917-113200-workflow-and-sdlc-systems.md
affected_modules:
  - assets/skills/karpathy-ste100-discipline
  - assets/rules/04-karpathy-ste100-discipline.md
  - assets/combos
---

# Archive: Tích hợp 4 Kỷ luật Karpathy & Chuẩn Văn bản Hàng không 70% ASD-STE100

## 1. Problem & Core Value (Bài toán & Giá trị Cốt lõi)
- **Vấn đề (Problem)**: Tài liệu và quy trình phát triển trước đây dễ bị dài dòng, lẫn lộn văn xuôi rườm rà (AI Slop) và thiếu kỷ luật tinh gọn khi viết code cũng như đặc tả kỹ thuật.
- **Giá trị (Value)**: Chuẩn hóa 4 Kỷ luật cốt lõi của Andrej Karpathy (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Verification) và áp dụng 70% quy chuẩn Aviation Technical Writing (ASD-STE100) cho toàn bộ skill, rule và tài liệu task trong hệ sinh thái.

## 2. Key Architecture & Decisions (Kiến trúc & Quyết định Then chốt)
- **Hướng tiếp cận (Approach)**:
  - Khởi tạo Skill `karpathy-ste100-discipline` tại `assets/skills/karpathy-ste100-discipline/SKILL.md` và `.agents/skills/`.
  - Khởi tạo Rule `04-karpathy-ste100-discipline.md` tại `assets/rules/` và `.agents/rules/`.
  - Tích hợp vào toàn bộ combo (`frontend-flow`, `backend-flow`, `full-sdlc-flow`) và cấu hình `full-sdlc-flow` theo mô hình stack-agnostic (độc lập công nghệ).

## 3. Scope & Key Changes (Phạm vi & Thay đổi Chính)
- [assets/skills/karpathy-ste100-discipline/SKILL.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/karpathy-ste100-discipline/SKILL.md) & [.agents/skills/karpathy-ste100-discipline/SKILL.md](file:///d:/Sources/PERSONAL/only-one-cli/.agents/skills/karpathy-ste100-discipline/SKILL.md)
- [assets/rules/04-karpathy-ste100-discipline.md](file:///d:/Sources/PERSONAL/only-one-cli/assets/rules/04-karpathy-ste100-discipline.md) & [.agents/rules/04-karpathy-ste100-discipline.md](file:///d:/Sources/PERSONAL/only-one-cli/.agents/rules/04-karpathy-ste100-discipline.md)
- [assets/skills/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/skills/index.ts) & [assets/rules/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/rules/index.ts)
- [assets/combos/index.ts](file:///d:/Sources/PERSONAL/only-one-cli/assets/combos/index.ts)
- [test/core/skill-registry.test.ts](file:///d:/Sources/PERSONAL/only-one-cli/test/core/skill-registry.test.ts)

## 4. Verification Evidence & PR (Bằng chứng Nghiệm thu & PR)
- **Trạng thái Test**: 100% Passed (55 test files, 242 tests passed).
- **Branch**: `main`.
