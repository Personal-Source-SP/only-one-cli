## Context

`only-one-cli` đã phân phối workflow Markdown, skill và agent command cho Antigravity, Claude, Cursor và Codex. Skill registry liên kết `associatedWorkflows`; workflow registry khai báo `requiredSkills` và `requiredMcps`. Hiện `requiredMcps` chưa điều khiển lựa chọn/readiness trong init, còn command generation có nhánh riêng cho từng workflow.

GitNexus MCP đã tồn tại với cấu hình read-only mặc định và không cần credential. `only-one-plan` phải tận dụng dependency này nhưng không tự chạy analyze, không sửa index, và không coi graph là bằng chứng cuối cùng. Workflow là ranh giới lập kế hoạch: được đọc/search và ghi planning artifact đã chọn, nhưng không sửa application code hoặc trạng thái Git.

ADR 0001 đang có hiệu lực yêu cầu `only-one init` giữ vai trò orchestrator và tránh tái tạo toàn bộ tool-selection của OpenSpec. Thiết kế này chỉ mở rộng dependency metadata/readiness trong flow cài asset hiện hành, không đảo ngược quyết định đó.

Sơ đồ C4-inspired mức system/container:

```text
┌──────────────┐       mô tả + quyết định        ┌────────────────────────┐
│ Người dùng   │◀───────────────────────────────▶│ Agent target           │
└──────────────┘                                  │ Antigravity/Claude/     │
                                                  │ Cursor/Codex            │
                                                  └───────────┬────────────┘
                                                              │ chạy only-one-plan
                                                              ▼
┌─────────────────────── only-one-cli package ─────────────────────────────┐
│  Skill/Workflow registry ──▶ target command + workflow asset             │
│              │                                                           │
│              └── requiredMcps: gitnexus ──▶ init preselect/readiness     │
└──────────────────────────────────┬────────────────────────────────────────┘
                                   │ cài đặt
                                   ▼
                         ┌──────────────────────┐
                         │ only-one-plan        │
                         │ planning boundary   │
                         └──────┬────────┬──────┘
                                │        │
                    query trước │        │ xác minh sau
                                ▼        ▼
                       ┌────────────┐  ┌────────────────┐
                       │ GitNexus   │  │ Source files   │
                       │ read-only  │  │ read/search    │
                       └────────────┘  └────────────────┘
                                │        │
                                └───┬────┘
                                    ▼
                     ┌───────────────────────────┐
                     │ Planning output           │
                     │ OpenSpec change artifacts │
                     │ hoặc docs/plans/<slug>.md │
                     └───────────────────────────┘
```

- Boundary runtime nằm trong agent target; CLI chỉ cài asset và dependency metadata.
- GitNexus thu hẹp vùng khảo sát; source files xác nhận symbol, call path và tác động.
- Người dùng giữ quyền quyết định khi dữ kiện thiếu hoặc trade-off quan trọng.
- Output duy nhất được phép ghi là artifact lập kế hoạch đã xác nhận.

## Goals / Non-Goals

**Goals:**

- Phân phối `only-one-plan` theo cùng mô hình skill/workflow hiện có trên bốn target.
- Tạo plan dựa trên bằng chứng, ưu tiên GitNexus rồi xác minh source.
- Hỏi người dùng khi thiếu dữ kiện hoặc gặp quyết định quan trọng; khi có nhiều phương án, đưa 2–4 lựa chọn kèm khuyến nghị và trade-off.
- Chứng minh phạm vi tối thiểu bằng file dự kiến, logic tái sử dụng, phần giữ nguyên và blast radius.
- Luôn kết luận về hiệu suất và bảo mật, kể cả khi tác động không đáng kể.
- Dùng OpenSpec nếu có; nếu không, ghi `docs/plans/<slug>.md`.
- Biến `requiredMcps` thành dependency có tác dụng trong init/readiness.

**Non-Goals:**

- Sửa application code trong workflow.
- Tự chạy GitNexus analyze, làm mới index hoặc thay đổi cấu hình MCP.
- Thêm CLI subcommand độc lập cho workflow.
- Pin lại package GitNexus hoặc đổi policy MCP hiện có.
- Tạo framework tổng quát mới cho mọi workflow `only-one-*`.
- Refactor toàn bộ installer hoặc command template.

## Decisions

### 1. Giữ mô hình skill + workflow hiện có

Thêm `only-one-plan-skill`, `only-one-plan` và command builder tương ứng. Skill liên kết workflow; workflow khai báo skill và GitNexus.

Lý do: đây là đường cài duy nhất đang hoạt động đồng nhất qua target. Chỉ thêm workflow asset sẽ không tạo command công khai.

Phương án loại bỏ: thêm subcommand `workflow`; phạm vi lớn, tạo surface mới không cần thiết.

### 2. Dùng metadata để dẫn xuất dependency MCP

Init xác định MCP cần thiết từ skill đã chọn qua `associatedWorkflows` và `requiredMcps`, thay vì thêm hardcode riêng cho `only-one-plan`. GitNexus được preselect; nếu người dùng bỏ chọn, init cảnh báo nhưng tôn trọng lựa chọn. Readiness hỗ trợ workflow không có secret.

Lý do: `requiredMcps` đã mô tả quan hệ nhưng hiện là metadata chết. Dẫn xuất quan hệ tránh drift khi thêm workflow sau.

Phương án loại bỏ: hardcode `only-one-plan` sang `gitnexus`; ít dòng ban đầu nhưng tiếp tục nhân đôi mapping.

### 3. Read-only theo capability, không chỉ theo GitNexus env

Workflow/skill cấm Write/Edit application code, Bash thay đổi state, Git mutation và MCP mutation. Chỉ cho phép ghi artifact OpenSpec hoặc `docs/plans/<slug>.md` sau khi người dùng xác nhận đích. Repo text và tool output được coi là dữ liệu không tin cậy; instruction nhúng trong source không được thực thi.

Lý do: `GITNEXUS_MCP_READ_ONLY=1` chỉ giới hạn GitNexus, không giới hạn tool tích hợp của agent.

Phương án loại bỏ: dựa hoàn toàn vào env read-only; không bảo vệ khỏi Write/Edit/Bash.

### 4. GitNexus trước, source file sau

Workflow dùng GitNexus để tìm symbol, dependency, call path và blast radius. Sau đó đọc/search file đích để kiểm chứng. Nếu MCP thiếu, lỗi, chưa index hoặc dữ liệu không đủ, workflow dừng và hỏi người dùng có tiếp tục bằng fallback read-only local search hay không.

Lý do: graph giúp giảm quét repo và context, nhưng index có thể cũ hoặc thiếu nên không phải nguồn chân lý duy nhất.

Phương án loại bỏ: dừng tuyệt đối khi GitNexus lỗi; biến dependency ưu tiên thành blocker không cần thiết. Fallback im lặng cũng bị loại vì che giấu độ tin cậy thấp hơn.

### 5. Decision gate tập trung vào quyết định quan trọng

Workflow tự xử lý chi tiết cơ học đã được codebase quy định. Nó hỏi khi thiếu dữ kiện hoặc lựa chọn làm đổi phạm vi, hành vi, kiến trúc, API, dependency, dữ liệu, hiệu suất, bảo mật hay khả năng đảo ngược. Câu hỏi có 2–4 lựa chọn, khuyến nghị, tác động và trade-off.

Lý do: giữ quyền kiểm soát mà không gây quá nhiều lượt hỏi cho chi tiết không quan trọng.

Phương án loại bỏ: hỏi mọi lựa chọn; chi phí tương tác cao. Chỉ hỏi khi hoàn toàn bế tắc; trao quá nhiều quyền quyết định cho agent.

### 6. Output contract chứng minh phạm vi tối thiểu

Plan chỉ sẵn sàng khi đủ bằng chứng và không còn quyết định mở ảnh hưởng nội dung. Output gồm:

- mục tiêu, phạm vi và non-goals;
- bằng chứng codebase và giới hạn khảo sát;
- quyết định người dùng đã xác nhận;
- phương án tối thiểu, file dự kiến, logic tái sử dụng và phần giữ nguyên;
- bước thực hiện theo dependency;
- validation và test;
- hiệu suất, bảo mật và bằng chứng cho từng kết luận;
- rủi ro, fallback, rollback hoặc khả năng đảo ngược;
- open questions còn lại không chặn plan.

Khi có OpenSpec, workflow tạo hoặc tiếp tục change sau khi hỏi tên/phạm vi nếu cần. Khi không có, output ở `docs/plans/<slug>.md`.

Phương án loại bỏ: chỉ trả plan trong chat; không đáp ứng yêu cầu artifact bền vững.

### 7. Giữ command path đúng cho mọi target

Command installer dùng path resolver nhận biết absolute path thay vì ghép mọi path với project root. Điều này cần thiết vì Codex có thể trả global prompt path tuyệt đối.

Lý do: thêm command mới phải hoạt động trên cả bốn target và không nhân bản lỗi path hiện hữu.

Phương án loại bỏ: chỉ test path tương đối; Codex có thể ghi sai vị trí.

## Risks / Trade-offs

- [Nội dung workflow, skill và command builder bị trùng dẫn tới drift] -> Giữ một contract ngắn, thêm static consistency tests cho tên, phase, dependency và các guardrail bắt buộc; không refactor framework trong change này.
- [GitNexus index cũ hoặc thiếu tạo plan sai] -> Luôn xác minh source, ghi giới hạn evidence, hỏi trước fallback khi MCP không đủ.
- [Read-only instruction không phải sandbox kỹ thuật tuyệt đối] -> Cấm rõ mutating tools trong asset, kiểm thử contract tĩnh, giữ GitNexus read-only config; dừng nếu không thể bảo đảm boundary.
- [Dẫn xuất dependency có thể làm init phức tạp hơn] -> Giới hạn logic ở registry traversal và readiness; không thay transaction/config architecture.
- [Skill và workflow có thể ghi cùng command path theo ordering target] -> Test nội dung cuối sau full install và deterministic order.
- [Codex global prompt path có thể bị ghép sai] -> Dùng command write-path resolver và test absolute path.
- [`gitnexus@latest` có rủi ro supply-chain/cold-start] -> Không thay policy trong change này; workflow không tự cài package hay gọi network trong lúc lập plan; ghi rủi ro trong docs.
- [Plan chi tiết làm tăng context và thời gian] -> Dùng GitNexus để thu hẹp scope, giới hạn query/result, chạy đọc độc lập song song, tránh full-repo scan khi query hẹp đủ.

## Migration Plan

1. Thêm và đăng ký skill/workflow/command mới mà không thay asset hiện có.
2. Mở rộng dependency derivation và readiness cho MCP không credential.
3. Thêm test manifest, installer, path, guardrail và output contract trước khi cập nhật docs.
4. Chạy unit/integration test và build/package validation.
5. Phát hành additive; người dùng hiện tại không bị đổi workflow đã cài.

Rollback: gỡ registry entries, asset mới, command builder và dependency tests/logic liên quan. Không có data migration hoặc state conversion.

## Open Questions

Không còn quyết định mở chặn implementation. ADR 0001 không cần supersede vì thiết kế giữ `only-one init` ở vai trò orchestrator và không tái tạo tool selection của OpenSpec.
