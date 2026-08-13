---
status: done
slug: add-architecture-and-graphics-skills
domain: skill
started_at: 2026-08-13
completed_at: 2026-08-13
pr_url: ~
branch: ~
---

# Kế hoạch triển khai bổ sung 8 bộ skill mở rộng: Architecture & Systems và AI Graphics/Design

Tài liệu kế hoạch triển khai bổ sung 8 bộ skill chuyên sâu vào hệ thống prebuilt asset (`assets/skills/`) của `only-one-cli`:

### Nhóm 1: Architecture & Systems (từ wondel.ai)
1. `clean-architecture`: Kiến trúc phần mềm sạch theo Uncle Bob (Dependency Rule, Entities, Use Cases, Interface Adapters, Framework Isolation).
2. `domain-driven-design`: Thiết kế hướng tên miền theo Eric Evans (Bounded Context, Ubiquitous Language, Aggregates, Value Objects, Domain Events).
3. `ddia-systems`: Thiết kế hệ thống dữ liệu chuyên sâu theo Martin Kleppmann (Data Models, Storage Engines, Replication, Sharding, Transactions, Event Sourcing).
4. `release-it`: Mẫu thiết kế phần mềm sẵn sàng cho Production theo Michael Nygard (Circuit Breakers, Bulkheads, Graceful Degradation, Failover, Chaos Engineering).
5. `high-perf-browser`: Tối ưu hóa hiệu năng mạng trình duyệt theo Ilya Grigorik (HTTP/2 & HTTP/3, TLS, WebSockets, Server-Sent Events, Resource Prioritization).

### Nhóm 2: AI Graphics & Visual Design (từ Kimi & Design Systems)
6. `ai-graphic-designer`: Hướng dẫn AI Agent tạo đồ họa & hình ảnh nghệ thuật (Prompt engineering cho Flux/Midjourney/DALL-E, Vector assets, Banner & Banner Social).
7. `brand-identity-design`: Thiết kế bộ nhận diện thương hiệu & Style Guide (Color Systems, Typography Pairs, Logo Usage Guidelines, Brand Voice).
8. `ui-component-spec`: Quy chuẩn thiết kế linh kiện giao diện & Design System (Component Props, Variants, Accessibility WCAG 2.1, Motion Tokens).

---

## User Review Required

> [!IMPORTANT]
> - Tất cả 8 skill mới sẽ được đóng gói sẵn trong `assets/skills/<skill-name>/SKILL.md` và đăng ký tập trung tại [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts).
> - Mọi tên skill và frontmatter `name` sẽ được đồng bộ chính xác với bộ test tự động [`test/core/skill-registry.test.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/skill-registry.test.ts).

---

## Open Questions

Không có câu hỏi mở nguyên tắc nào. Tất cả 8 skill đã được đồng ý bổ sung đầy đủ theo yêu cầu người dùng.

---

## Section 1. Current state

### Trạng thái hiện tại
Hiện tại `only-one-cli` đang hỗ trợ 9 prebuilt skills tại thư mục [`assets/skills/`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills):
1. `c4-diagrams`
2. `gherkin-authoring`
3. `grill-me`
4. `only-one-nestjs-development`
5. `only-one-nextjs-development`
6. `only-one-clockify-skill`
7. `only-one-pr-git-skill`
8. `system-design`
9. `ux-flow-designer`

### Nhu cầu mở rộng
Cần bổ sung thêm 8 bộ skill mở rộng chuyên sâu về **Architecture & Systems** (Clean Architecture, DDD, DDIA, Release It!, High Perf Browser) và **AI Graphics/Visual Design** (AI Graphic Designer, Brand Identity, UI Component Spec) để CLI hỗ trợ đầy đủ các workflow AI Agent.

---

## Section 2. Design

### Phương án: Đóng gói Prebuilt Assets Local trong `assets/skills/`

**Ưu điểm:**
- Hoạt động offline 100%, không phụ thuộc vào kết nối mạng internet hay `npx` bên thứ 3.
- Cài đặt và sync ngay lập tức tới mọi IDE agent (Antigravity, Cursor, Claude Code, Codex, Cline, OpenCode,...).
- Được tự động kiểm tra tính toàn vẹn và regression test qua `npm test`.

---

## Section 3. Implementation architecture

### Các tệp tạo mới & sửa đổi:

#### [NEW] [`assets/skills/clean-architecture/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/clean-architecture/SKILL.md)
#### [NEW] [`assets/skills/domain-driven-design/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/domain-driven-design/SKILL.md)
#### [NEW] [`assets/skills/ddia-systems/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/ddia-systems/SKILL.md)
#### [NEW] [`assets/skills/release-it/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/release-it/SKILL.md)
#### [NEW] [`assets/skills/high-perf-browser/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/high-perf-browser/SKILL.md)
#### [NEW] [`assets/skills/ai-graphic-designer/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/ai-graphic-designer/SKILL.md)
#### [NEW] [`assets/skills/brand-identity-design/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/brand-identity-design/SKILL.md)
#### [NEW] [`assets/skills/ui-component-spec/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/ui-component-spec/SKILL.md)
#### [MODIFY] [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts)

---

## Section 4. Implementation code examples

### Cấu trúc mảng SKILLS trong `assets/skills/index.ts`

```typescript
export const SKILLS: SkillManifest[] = [
    // ... các skill hiện có
    {
        name: 'clean-architecture',
        description: 'Building maintainable, testable software architectures based on Robert C. Martin Clean Architecture principles.',
    },
    {
        name: 'domain-driven-design',
        description: 'Modeling complex business domains in software based on Eric Evans Domain-Driven Design methodology.',
    },
    {
        name: 'ddia-systems',
        description: 'Designing reliable, scalable data-intensive applications based on Martin Kleppmann DDIA framework.',
    },
    {
        name: 'release-it',
        description: 'Production-ready software patterns for stability, resilience, and failure handling based on Michael Nygard Release It!',
    },
    {
        name: 'high-perf-browser',
        description: 'Browser networking performance optimization, HTTP/2, HTTP/3, WebSockets, and TLS optimization based on Ilya Grigorik.',
    },
    {
        name: 'ai-graphic-designer',
        description: 'AI-assisted visual assets generation, prompt engineering for image generation, vector graphics, and social media visual assets.',
    },
    {
        name: 'brand-identity-design',
        description: 'Designing comprehensive brand identities, color systems, typography pairs, and visual style guides for AI agents.',
    },
    {
        name: 'ui-component-spec',
        description: 'Specification and design systems for UI components, prop contracts, component variants, WCAG accessibility, and motion tokens.',
    },
];
```

---

## Section 5. Test cases

### Automated Tests
1. `npm test test/core/skill-registry.test.ts` (Pass 100%)
2. `npm test test/commands/skill/skill.test.ts` (Pass 100%)
3. `npm run build` (Build & Format Clean)
