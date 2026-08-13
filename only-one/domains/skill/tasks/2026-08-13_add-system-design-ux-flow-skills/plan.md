---
status: done
slug: add-system-design-ux-flow-skills
domain: skill
started_at: 2026-08-13
completed_at: 2026-08-13
pr_url: ~
branch: ~
---

# Kế hoạch triển khai thêm 2 bộ skill: system-design và ux-flow-designer & AI Design System

Tài liệu kế hoạch triển khai bổ sung 2 bộ skill chuyên sâu vào hệ thống prebuilt skill của `only-one-cli`:
1. `system-design`: Skill hướng dẫn phân tích, thiết kế hệ thống phân tán quy mô lớn (High-Scale Distributed Systems), ước tính dung lượng (Back-of-the-envelope estimation), deep dive linh kiện kiến trúc và phân tích đánh đổi (Tradeoff Analysis).
2. `ux-flow-designer`: Skill hướng dẫn thiết kế hành trình người dùng (User Flow), vẽ sơ đồ Mermaid, thiết kế Wireframe (ASCII & Mobile-First HTML), kết hợp nguyên tắc AI Design System (Design Tokens, WCAG accessibility, spacing, typography scale, micro-interactions).

---

## User Review Required

> [!IMPORTANT]
> - Cả 2 skill sẽ được nhúng trực tiếp vào thư mục prebuilt asset (`assets/skills/`) của `only-one-cli`, cho phép cài đặt offline hoặc sync nhanh tới các IDE agent được hỗ trợ (Antigravity, Cursor, Claude Code, Codex, Cline, OpenCode,...).
> - Mọi tên skill và thông tin frontmatter trong `assets/skills/<skill-name>/SKILL.md` sẽ được đồng bộ chính xác với `assets/skills/index.ts` để đảm bảo qua được bộ test tự động trong [`test/core/skill-registry.test.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/skill-registry.test.ts).

---

## Open Questions

Không có câu hỏi mở nguyên tắc nào. Đã xác định rõ nguồn tham khảo:
- `wondelai/skills/system-design` (dựa trên framework System Design Interview của Alex Xu và DDIA).
- `ux-flow-designer` & AI Design System (kết hợp quy trình PRD-to-UX flow, sơ đồ Mermaid, HTML wireframe và chuẩn thiết kế AI Design System / DESIGN.md).

---

## Section 1. Current state

### Trạng thái hiện tại
Hiện tại `only-one-cli` hỗ trợ 7 prebuilt skills tại thư mục [`assets/skills/`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills):
1. `c4-diagrams`: Thiết kế sơ đồ kiến trúc C4 (Context, Container, Component, Dynamic).
2. `gherkin-authoring`: Viết kịch bản BDD / Cucumber Gherkin.
3. `grill-me`: Phỏng vấn phản biện kế hoạch / thiết kế.
4. `only-one-nestjs-development`: Hướng dẫn phát triển NestJS theo chuẩn sạch.
5. `only-one-nextjs-development`: Hướng dẫn phát triển Next.js / React theo chuẩn sạch.
6. `only-one-clockify-skill`: Log thời gian làm việc qua Clockify MCP.
7. `only-one-pr-git-skill`: Tạo và cập nhật GitHub Pull Request.

Tất cả các skill hiện có được khai báo trong [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts) và được tải tự động bởi module [`src/core/skill/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/skill/index.ts).

### Hạn chế hiện tại
- Thiếu skill chuyên sâu về **System Design & Distributed Architecture** để hỗ trợ thiết kế hệ thống lớn (QPS cao, Caching, Load Balancing, DB Sharding, Rate Limiting, Message Queue).
- Thiếu skill chuyên sâu về **UX Flow & AI Design System** giúp AI agent chuyển đổi yêu cầu sản phẩm thành sơ đồ luồng (User Journey, Mermaid), thiết kế wireframe HTML/ASCII, và áp dụng nhất quán các quy tắc Design System (Design Tokens, Spacing, Color Palette, Accessibility).

---

## Section 2. Design

### Phương án 1 (Khuyên dùng): Tích hợp trực tiếp 2 Prebuilt Skills vào `assets/skills/`

**Cách hoạt động:**
- Tạo 2 thư mục skill mới với đầy đủ hướng dẫn chuẩn hóa:
  - `assets/skills/system-design/SKILL.md`
  - `assets/skills/ux-flow-designer/SKILL.md`
- Đăng ký 2 skill này vào danh sách `SKILLS` trong [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts).

**Ưu điểm:**
- Hoạt động ngay lập tức không cần kết nối mạng internet hoặc `npx` bên thứ ba khi chạy lệnh `only-one skill`.
- Tương thích 100% với cơ chế sync skill hiện có của CLI đối với các IDE như Cursor (`.cursor/skills/`), Antigravity (`.agents/skills/`), Claude (`.claude/skills/`), v.v.
- Dễ dàng bảo trì và được tự động kiểm thử bởi [`test/core/skill-registry.test.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/skill-registry.test.ts).

**Nhược điểm:**
- Cần tự đóng gói và bảo trì nội dung hướng dẫn của skill trong codebase CLI.

**Đánh giá rủi ro & Đội phức tạp:**
- Độ phức tạp: Thấp (Low).
- Rủi ro: Rất thấp (Không breaking change).

---

### Phương án 2: Tải động qua `npx skills add wondelai/skills/...` từ bên ngoài

**Cách hoạt động:**
- Đăng ký như một External Skill gói npm/skills CLI trong `assets/packages/index.ts`.

**Nhược điểm:**
- Phụ thuộc mạng internet và công cụ `npx skills` của bên thứ ba khi cài đặt.
- Tốc độ cài đặt chậm hơn nhiều so với prebuilt skill offline local.

**Kết luận chọn Phương án 1.**

---

## Section 3. Implementation architecture

### Danh sách các tập tin thay đổi

#### [NEW] [`assets/skills/system-design/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/system-design/SKILL.md)
Tệp hướng dẫn System Design skill (Quy trình 4 bước: Làm rõ yêu cầu & Ước tính dung lượng -> Thiết kế tổng quan HLD -> Deep dive linh kiện cốt lõi -> Phân tích đánh đổi Tradeoff).

#### [NEW] [`assets/skills/ux-flow-designer/SKILL.md`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/ux-flow-designer/SKILL.md)
Tệp hướng dẫn UX Flow & AI Design System skill (Xác định hành trình người dùng -> Vẽ sơ đồ Mermaid -> Áp dụng Design Tokens & AI Design System -> Dựng Wireframe ASCII & Mobile-First HTML).

#### [MODIFY] [`assets/skills/index.ts`](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts)
Đăng ký thêm `system-design` và `ux-flow-designer` vào mảng `SKILLS`.

---

### Sơ đồ cấu trúc tài sản Skill

```text
assets/skills/
├── c4-diagrams/
├── gherkin-authoring/
├── grill-me/
├── only-one-clockify-skill/
├── only-one-nestjs-development/
├── only-one-nextjs-development/
├── only-one-pr-git-skill/
├── system-design/            [NEW]
│   └── SKILL.md
├── ux-flow-designer/         [NEW]
│   └── SKILL.md
└── index.ts                  [MODIFY]
```

---

## Section 4. Implementation code examples

### 1. [NEW] `assets/skills/system-design/SKILL.md`

**Overview:** Cung cấp khung hướng dẫn toàn diện cho AI agent khi tiếp nhận yêu cầu thiết kế hệ thống lớn hoặc phân tích kiến trúc backend.

```markdown
---
name: system-design
description: Use when designing high-scale distributed systems, system architecture, capacity estimation, component deep dives, and evaluating architectural trade-offs.
---

# System Design & Distributed Architecture Skill

## Overview
Dùng skill này khi cần thiết kế kiến trúc hệ thống phân tán, xây dựng hệ thống quy mô lớn (High-Scale System), ước tính tài nguyên (Back-of-the-envelope estimation) và phân tích các đánh đổi (Tradeoff Analysis).

## Quy trình 4 bước Thiết kế Hệ thống

### Bước 1: Làm rõ Yêu cầu & Ước tính Dung lượng (Requirements & Estimation)
1. **Functional Requirements (Yêu cầu chức năng):** Các tính năng cốt lõi người dùng thực hiện.
2. **Non-Functional Requirements (Yêu cầu phi chức năng):** Độ tin cậy (Availability - 99.99%), Độ trễ (Latency < 100ms), Khả năng mở rộng (Scalability), Tính nhất quán (Consistency).
3. **Back-of-the-envelope Estimations (Ước tính nhanh):**
   - DAU (Daily Active Users), QPS (Queries Per Second) trung bình và đỉnh (Peak QPS).
   - Storage (Dung lượng lưu trữ theo ngày/năm).
   - Bandwidth (Băng thông đọc/ghi Bps).
   - RAM/Memory cho caching.

### Bước 2: Thiết kế Tổng quan (High-Level Design - HLD)
1. **API Design:** Định nghĩa RESTful API / gRPC contract cho các use-case chính.
2. **Architecture Diagram:** Vẽ sơ đồ các dịch vụ chính (Client, API Gateway, Load Balancer, Microservices, DB, Cache, Queue).
3. **Data Model:** Định nghĩa Schema cơ sở dữ liệu (SQL vs NoSQL, RDBMS tables, Key-Value stores).

### Bước 3: Phân tích Sâu Linh kiện Cốt lõi (Deep Dive)
- **Load Balancing:** Round-robin, Least Connection, Consistent Hashing.
- **Caching Strategy:** Cache-aside, Read-through, Write-through, Eviction policy (LRU/LFU). Redis / Memcached cluster.
- **Database Scaling:** Read replicas, Master-Slave replication, Database Sharding (Horizontal Partitioning).
- **Asynchronous Processing:** Message Queues (Kafka, RabbitMQ, SQS) để giảm tải đồng bộ và xử lý background.
- **Rate Limiting & Security:** Token Bucket, Leaky Bucket, Sliding Window Log.

### Bước 4: Phân tích Đánh đổi & Điểm thắt nút (Tradeoff Analysis & Bottlenecks)
- Phân tích Định lý CAP (Consistency, Availability, Partition Tolerance).
- Xử lý Single Point of Failure (SPOF).
- Giám sát (Monitoring, Telemetry, Distributed Tracing - OpenTelemetry).
```

---

### 2. [NEW] `assets/skills/ux-flow-designer/SKILL.md`

**Overview:** Khung hướng dẫn thiết kế trải nghiệm người dùng, vẽ sơ đồ Mermaid, xây dựng HTML Wireframe và tuân thủ AI Design System (`DESIGN.md`).

```markdown
---
name: ux-flow-designer
description: Use when designing user flows, UX journeys, HTML wireframes, Mermaid flowcharts/sequence diagrams, and applying AI Design System rules.
---

# UX Flow Designer & AI Design System Skill

## Overview
Dùng skill này khi cần lập kế hoạch trải nghiệm người dùng (UX Flow), thiết kế hành trình người dùng (User Journey), vẽ sơ đồ luồng Mermaid, tạo bản phác thảo giao diện (Wireframes) và chuẩn hóa thiết kế theo AI Design System.

## Quy trình 4 bước Thiết kế UX & Design System

### Bước 1: Phân tích Hành trình & Ngữ cảnh Người dùng
1. **User Goal & Persona:** Xác định người dùng là ai, mục tiêu và nỗi đau (Pain points).
2. **Entry & Exit Points:** Điểm bắt đầu (VD: Landing page, push notification) và điểm kết thúc (VD: Checkout thành công).
3. **Core Task Flow:** Liệt kê các bước thao tác tối thiểu để đạt mục tiêu.

### Bước 2: Trực quan hóa Sơ đồ Luồng bằng Mermaid
Sử dụng Mermaid diagram để mô hình hóa:
- **Flowchart (`flowchart TD`):** Luồng điều hướng giữa các màn hình và nhánh rẽ điều kiện.
- **Sequence Diagram (`sequenceDiagram`):** Tương tác giữa User, Frontend Component và Backend Service.
- **State Diagram (`stateDiagram-v2`):** Các trạng thái UI (Loading, Success, Empty, Error).

### Bước 3: Áp dụng Quy chuẩn AI Design System & Tokens
Tuân thủ các nguyên tắc thiết kế UI/UX hiện đại:
- **Color Palette & Contrast:** Chọn màu chủ đạo, màu phụ, màu trạng thái (Success/Error/Warning) đạt chuẩn truy cập WCAG AA.
- **Typography Scale:** Tỷ lệ font chữ nhất quán (Heading 1-4, Body, Small text).
- **Spacing Grid:** Hệ thống khoảng cách bội số 4px/8px (Padding, Margin, Gap).
- **Micro-interactions:** Hiệu ứng hover, focus, active, loading skeleton và phản hồi tức thời.
- **DESIGN.md:** Đọc hoặc tạo tập tin `DESIGN.md` ở gốc dự án để duy trì "Source of Truth" cho AI agent.

### Bước 4: Dựng Bản thiết kế Giao diện (Wireframes)
- **ASCII Wireframe:** Phác thảo nhanh cấu trúc khối giao diện trong markdown.
- **Mobile-First HTML Wireframe:** Tạo mẫu giao diện HTML/CSS phản ứng (Responsive), nhúng trực tiếp trong xem trước để người dùng đánh giá.
```

---

### 3. [MODIFY] `assets/skills/index.ts`

```typescript
import type { SkillManifest } from '../types.js';

export const SKILLS: SkillManifest[] = [
    {
        name: 'c4-diagrams',
        description: 'Use when explaining existing code architecture, visualizing a new system.',
    },
    {
        name: 'gherkin-authoring',
        description: 'Use when drafting, reviewing, or improving Gherkin scenarios.',
    },
    {
        name: 'grill-me',
        description: 'Interview the user relentlessly about a plan or design.',
    },
    {
        name: 'only-one-nestjs-development',
        description: 'Use for NestJS development with selectively loaded architecture references.',
    },
    {
        name: 'only-one-nextjs-development',
        description: 'Use for Next.js and React development with selectively loaded references.',
    },
    {
        name: 'only-one-clockify-skill',
        description: 'Validate and log Clockify time entries from task lines.',
        associatedWorkflows: ['only-one-clockify'],
    },
    {
        name: 'only-one-pr-git-skill',
        description: 'Create or update a GitHub Pull Request from the current branch.',
        associatedWorkflows: ['only-one-pr-git'],
    },
    {
        name: 'system-design',
        description: 'Use when designing high-scale distributed systems, system architecture, capacity estimation, component deep dives, and evaluating architectural trade-offs.',
    },
    {
        name: 'ux-flow-designer',
        description: 'Use when designing user flows, UX journeys, HTML wireframes, Mermaid flowcharts/sequence diagrams, and applying AI Design System rules.',
    },
];
```

---

## Section 5. Test cases

### Automated Tests

1. **Skill Registry Integrity Test:**
   - Command: `npm test test/core/skill-registry.test.ts`
   - Mục tiêu: Kiểm tra xem `assets/skills/index.ts` và các thư mục prebuilt skill (`system-design`, `ux-flow-designer`) có khớp 1-1 về tên manifest và YAML frontmatter `name` trong `SKILL.md` hay không.
   - Kết quả kỳ vọng: Test pass 100%.

2. **Skill Command Test:**
   - Command: `npm test test/commands/skill/skill.test.ts`
   - Mục tiêu: Đảm bảo lệnh `only-one skill` cài đặt thành công cả `system-design` và `ux-flow-designer` vào thư mục của agent (VD: `.cursor/skills/system-design/SKILL.md`).
   - Kết quả kỳ vọng: Test pass 100%.

3. **Build & Formatting Test:**
   - Command: `npm run build`
   - Mục tiêu: Biên dịch TypeScript và kiểm tra định dạng Prettier không có lỗi.
   - Kết quả kỳ vọng: Build thành công không có type error hay formatting issue.

### Manual Verification

1. Thực thi lệnh cài đặt thử nghiệm:
   ```bash
   only-one skill . system-design ux-flow-designer --tool cursor
   ```
2. Kiểm tra sự tồn tại của tệp `.cursor/skills/system-design/SKILL.md` và `.cursor/skills/ux-flow-designer/SKILL.md` tại dự án.
