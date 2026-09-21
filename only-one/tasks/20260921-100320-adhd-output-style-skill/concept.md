# Concept: Tích hợp ADHD-Friendly Output Style vào Workflows

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Năm workflow `only-one-idea`, `only-one-plan`, `only-one-apply`, `only-one-flash`, `only-one-debug` sinh response dài, nặng context; action tiếp theo thường bị chôn dưới prose.
- **Hiện tượng & Khiếm khuyết kỹ thuật**: Output thiếu chuẩn chung cho action-first, numbered steps, progress marker, concrete next action và tangent control.
- **Nguyên nhân cốt lõi (Root Cause)**: Workflow có role và execution protocol nhưng chưa có explicit output discipline.
- **Tác động (Impact / Blast Radius)**: Người dùng khó bắt đầu, khó giữ context và khó theo dõi tiến độ trong session dài.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Đăng ký `i-have-adhd` như GitHub skill trong asset catalog, tải bản mới nhất từ upstream khi cài workflow, rồi bắt 5 workflow activate skill này khi chạy.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - `i-have-adhd` xuất hiện trong `assets/skills/index.ts` với provenance upstream rõ ràng.
  - Nội dung canonical không được vendor; installer fetch `ayghri/i-have-adhd/main/skills/i-have-adhd/SKILL.md` vào `.agents/skills/i-have-adhd/`.
  - Năm workflow khai báo `i-have-adhd` trong `requiredSkills` tại `assets/workflows/index.ts`.
  - Nội dung 5 workflow yêu cầu đọc và áp dụng `i-have-adhd` trước khi phát response đầu tiên.
  - `only-one init`, `only-one skill` và `only-one update` dùng asset pipeline hiện có; không cần người dùng cài plugin ngoài.

## 2. Scope Boundaries (Ranh giới Phạm vi)
- **In-Scope**: Thêm remote GitHub skill manifest, nối dependency vào 5 workflow manifests, cập nhật workflow catalogs/activation instructions, bump versions liên quan và test asset sync/dependency resolution.
- **Explicit Out-of-Scope**: Không cài global plugin; không bật always-on cho workflow ngoài scope; không sửa nội dung upstream ngoài adaptation tối thiểu cần cho runtime compatibility; không thêm toggle riêng vào CLI.

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### Các lựa chọn

| Option | Cơ chế | Pros | Cons | Complexity |
|---|---|---|---|---|
| **A — GitHub skill (Selected)** | Đăng ký remote manifest; installer fetch `main` mới nhất khi cài | Luôn nhận upstream mới nhất; không vendor bản stale | Cần network; upstream drift ngoài release cycle | Medium |
| **B — External dependency** | Workflow yêu cầu người dùng cài plugin từ GitHub | Không vendor code | Setup rời rạc; workflow có thể thiếu skill | Low code, high operational risk |
| **C — Workflow-local copy** | Copy rules vào từng workflow | Self-contained | Duplication; khó sync upstream | Low |

### Quyết định
Chọn **Option A — GitHub skill fetched from latest `main`**.

### Final Skill Strategy Decision

Keep all existing skills. Classify responsibilities instead of removing overlap:

1. **Core domain skills** decide technical correctness and required evidence.
2. **Conditional domain skills** activate only when their existing trigger matches.
3. **`i-have-adhd`** is a mandatory presentation adapter for user-visible chat.

```text
Domain skills decide WHAT must be produced.
Workflow decides WHEN and IN WHICH ORDER.
i-have-adhd decides HOW results are presented.
```

No existing skill is removed in this change. `wait-what` remains conditional because it performs an explicit re-explanation action, while `i-have-adhd` continuously shapes presentation.

### Skill Compatibility Matrix

| Existing skill/group | Overlap or conflict | Resolution |
|---|---|---|
| `interview-me`, `grill-me`, `grill-with-docs` | Deep interviews can branch; ADHD output permits one question per turn | Preserve full question tree; serialize questions without reducing discovery depth |
| `wait-what`, `context-engineering` | Shared goal of concise, high-signal context | Keep both; `wait-what` re-pitches on demand, `context-engineering` controls working context, ADHD skill controls chat shape |
| `to-tickets`, `incremental-implementation` | Both create bounded steps | Domain skills own decomposition and dependencies; ADHD skill only displays current step/progress |
| `doubt-driven-development`, `source-driven-development` | Evidence and doubt lists may exceed five items | Preserve completeness; group/rank prose and exempt structured tables/sources from list cap |
| `test-driven-development` | Red–Green–Refactor evidence may resemble a recap | Test evidence is mandatory output, not removable recap |
| `diagnosing-bugs` | Three-failure stop can interrupt active RCA | Stop only after three failed patch attempts with no new evidence; continue while reproducing, minimizing, or instrumenting |
| `code-simplification` | Both reduce cognitive load | Code skill simplifies implementation; ADHD skill simplifies presentation |

### Compatibility Precedence

1. System, security, and destructive-action constraints.
2. Workflow lifecycle, hard stops, review gates, and artifact schemas.
3. Domain-skill completeness, evidence, and technical contracts.
4. `i-have-adhd` presentation rules.
5. Generic response style.

The presentation adapter must never omit required findings, sources, tests, evidence, tasks, or diffs; change execution order; bypass approval; stop evidence-generating research; or invent a user action when the agent can continue autonomously.

### Core Mechanism
1. Thêm manifest `i-have-adhd` vào `assets/skills/index.ts` với `sourceType: 'github'`, `source: 'ayghri/i-have-adhd'`, `skillPath: 'skills/i-have-adhd/SKILL.md'`.
2. Không tạo local skill directory. `installSkills()` fetch branch `main` mặc định tại thời điểm cài và lưu content hash vào lock metadata.
3. Thêm `i-have-adhd` vào `requiredSkills` của 5 entries trong `assets/workflows/index.ts`; bump workflow versions để update pipeline nhận thay đổi.
4. Trong từng workflow, thêm `i-have-adhd` vào Skills Catalog và instruction bắt buộc: đọc `SKILL.md` khi workflow bắt đầu, áp dụng cho chat responses xuyên suốt lifecycle.
5. Giữ artifact schemas nguyên trạng. Skill định hình cách trình bày chat; `concept.md`, `plan.md`, `debug.md`, Task Matrix và Unified Diff vẫn theo contracts hiện tại.

### Installation & Activation Flow
```text
SKILLS manifest: sourceType 'github'
              │
              ├── source + skillPath resolve upstream main
              │
              ├── WORKFLOWS.requiredSkills declares dependency
              │
              ▼
only-one init / skill / update
              │
              ▼
.agents/skills/i-have-adhd/SKILL.md
              │
              ▼
workflow starts → read skill → apply output rules
```

### Workflow Integration Contract

Mỗi workflow phải áp dụng skill qua **ba lớp**, không chỉ thêm tên vào manifest:

1. **Installation dependency** — `assets/workflows/index.ts` khai báo `i-have-adhd` trong `requiredSkills`. Lớp này bảo đảm skill được sync cùng workflow.
2. **Runtime activation** — ngay trong workflow Markdown, trước execution protocol, thêm instruction bắt buộc đọc `.agents/skills/i-have-adhd/SKILL.md`. Không tìm thấy skill thì báo `location → cause → fix` và dừng trước khi tạo output chính.
3. **Lifecycle adaptation** — workflow định nghĩa progress vocabulary và terminal action riêng. Skill kiểm soát presentation; workflow vẫn kiểm soát business protocol và artifact schema.

Block activation chuẩn được chèn sau `Role`/`Purpose`, trước `Skills Catalog`:

```markdown
## Mandatory Output Skill

Before producing the first user-visible response:
1. Read and activate `i-have-adhd` from `.agents/skills/i-have-adhd/SKILL.md`.
2. Keep it active for every chat response in this workflow.
3. Treat it as a presentation adapter, not an execution policy. Preserve domain-skill completeness, canonical artifact templates, tables, code blocks, diffs, and lifecycle gates.
4. Resolve conflicts using: safety → workflow contract → domain skill → output skill.
5. If the skill is unavailable, stop and report:
   - Location: `.agents/skills/i-have-adhd/SKILL.md`
   - Cause: required workflow skill is not installed
   - Fix: run `only-one update` or install `i-have-adhd`
```

`i-have-adhd` cũng được thêm thành **mandatory row đầu tiên** trong mỗi Skills Catalog. Riêng `only-one-plan`, đổi tên `Optional Skills Catalog` thành `Skills Catalog`, tách `i-have-adhd` vào subsection **Mandatory**; các skills còn lại vẫn optional theo trigger.

### Áp dụng cụ thể theo từng workflow

#### `only-one-idea.md`
- **Vị trí chèn**: sau `Role & Collaboration Model`, trước `Skills Catalog`.
- **Thời điểm activate**: trước câu hỏi Discovery đầu tiên.
- **Progress vocabulary**: `Discovery X/Y`, `Options`, `Decision`, `Concept complete`.
- **Behavior**: mỗi turn chỉ một câu hỏi; answer/action đặt trước explanation; không raise solution trước Exit Gate Phase 1.
- **Terminal action**: response cuối chỉ nêu `concept.md` path và command `/only-one-plan <task-folder>`.

#### `only-one-plan.md`
- **Vị trí chèn**: sau `Purpose`, trước `Concept Ingestion & Codebase Research`.
- **Thời điểm activate**: trước research status đầu tiên.
- **Progress vocabulary**: `Research`, `Contracts`, `Task Matrix`, `Diff Blueprint`, `Review ready`.
- **Behavior**: chat status ngắn và action-first; không rút gọn hoặc reorder 5 canonical sections trong `plan.md`; tables/diffs exempt khỏi list cap.
- **Terminal action**: nêu plan path, review decision cần thiết và `/only-one-apply <plan-path>`; không tự apply.

#### `only-one-apply.md`
- **Vị trí chèn**: sau `Purpose`, trước `Skills Catalog`.
- **Thời điểm activate**: trước locate/read plan status.
- **Progress vocabulary**: `Task X/Y`, file hiện tại, fast-test result.
- **Behavior**: sau mỗi task chỉ report visible win hoặc lỗi theo `Location / Cause / Fix`; không chen refactor/tangent ngoài Task Matrix.
- **Terminal action**: nêu số task hoàn tất, full verification result và thay đổi hiện hoạt động; không tạo `walkthrough.md`.

#### `only-one-flash.md`
- **Vị trí chèn**: sau `Purpose`, trước `Skills Catalog`.
- **Thời điểm activate**: trước Flash Plan.
- **Progress vocabulary**: `Research`, `Review Gate`, `Apply`, `Verify`.
- **Behavior**: Flash Plan bắt đầu trực tiếp bằng action/mô tả; review gate là một next action duy nhất; không tạo disk plan.
- **Terminal action**: trước confirmation, yêu cầu đúng một quyết định; sau apply, nêu change + verification trong tối đa 3 câu như contract hiện có.

#### `only-one-debug.md`
- **Vị trí chèn**: sau `Purpose`, trước `Skills Catalog`.
- **Thời điểm activate**: trước reproduction status đầu tiên.
- **Progress vocabulary**: `Reproduce`, `Minimize`, `Hypothesize`, `Blueprint`, `Review ready`.
- **Behavior**: mọi failure report theo `Location / Cause / Fix`; evidence đặt trước hypothesis; không trộn symptom với root cause.
- **Terminal action**: nêu `debug.md` path, confirmed root cause và `/only-one-apply <debug-path>`; không execute patch.

### Workflow Component Impact Model

Skill mới là **presentation-layer policy**. Nó không thay execution algorithm, nhưng tác động lên cách mỗi thành phần workflow giao tiếp với người dùng và chuyển trạng thái.

| Thành phần workflow | Ảnh hưởng | Cách ảnh hưởng | Không thay đổi |
|---|---|---|---|
| **Input handling** | Medium | Nếu input thiếu/ambiguous, hỏi một câu ngắn, một quyết định mỗi turn; action cần làm đứng đầu | Input syntax, path resolution và validation rules |
| **Role & collaboration** | Low | Giữ role chuyên môn nhưng bỏ preamble/persona prose; response mở bằng câu hỏi, kết luận hoặc action | Authority, trách nhiệm BA/Architect/Engineer/Debugger |
| **Skills activation** | High | `i-have-adhd` trở thành mandatory cross-cutting skill, active trước các domain skills | Trigger và mục đích của domain skills hiện có |
| **Phase execution** | Medium | Mỗi phase có progress label; chỉ surface trạng thái tại user-visible turn hoặc phase transition | Thứ tự bước, exit gate, dependency graph |
| **Interactive Q&A** | High | Một câu hỏi mỗi turn; không bundle nhiều nhánh; unresolved decision được đặt cuối như next action duy nhất | Nội dung discovery và confidence gate |
| **Research/tool activity** | Low | Không narrate tool calls; chỉ report finding/action có giá trị | Tool selection, research depth, evidence requirements |
| **Plan/review gate** | High | Review request ngắn, nêu đúng decision cần xác nhận; dừng ngay sau next action | Mandatory approval và hard-stop behavior |
| **Execution reporting** | High | Báo `Task X/Y`, file hiện tại và fast-test result; visible wins sau từng verified slice | File order, Task Matrix status và test commands |
| **Error handling** | High | Chuẩn hóa `Location / Cause / Fix`; sau ba failed fixes phải nêu doubtful assumption và dừng guessing | RCA protocol, reproduction requirement, regression guard |
| **Artifact authoring** | Low | Nội dung vẫn đầy đủ; giảm prose dư thừa nếu schema cho phép | Canonical headings, tables, diffs, templates và bilingual rules |
| **Terminal handoff** | High | Kết thúc bằng đúng một command/action dưới hai phút; không generic closer | Command đích và lifecycle isolation |

### Impact theo từng workflow

#### `only-one-idea`: tác động lên Discovery và decision flow

| Thành phần | Trước skill | Sau skill | Mức tác động |
|---|---|---|---|
| Input clarification | Có thể mở bằng context dài | Mở trực tiếp bằng một câu hỏi cần trả lời | High |
| Discovery turns | One-question-at-a-time đã có nhưng presentation chưa chặt | Gắn `Discovery X/Y`; câu hỏi trước, lý do ngắn sau | High |
| Option presentation | Matrix có thể kèm nhiều prose | Kết luận/decision cần chọn đứng đầu; tối đa 2–3 options như contract | Medium |
| `concept.md` | Schema canonical | Không đổi schema; chỉ loại prose lặp nếu không bắt buộc | Low |
| Handoff | Path và command | Một next action duy nhất: `/only-one-plan ...` | Medium |

#### `only-one-plan`: tác động lên research communication và reviewability

| Thành phần | Trước skill | Sau skill | Mức tác động |
|---|---|---|---|
| Research status | Có thể narrate nhiều bước nội bộ | Chỉ nêu phase + finding/blocker quan trọng | Medium |
| Skills catalog | Toàn bộ được gọi là optional | `i-have-adhd` mandatory; domain skills vẫn conditional | High |
| Plan authoring | 5 sections canonical | Không đổi; Task Matrix/diffs exempt khỏi compression | Low |
| Open decisions | Có thể nằm trong giải thích | Đặt decision cần review ở đầu response | High |
| Review gate | Nêu path và chờ approval | Một action duy nhất: review/approve rồi chạy `/only-one-apply` | Medium |

#### `only-one-apply`: tác động mạnh lên execution feedback loop

| Thành phần | Trước skill | Sau skill | Mức tác động |
|---|---|---|---|
| Task selection | Parse first pending row | Không đổi selection; report `Task X/Y` trước khi làm | Medium |
| Per-file execution | Edit rồi chạy fast test | Sau test, báo visible win: file + PASS/FAIL | High |
| Failure handling | Activate `diagnosing-bugs` | Thêm `Location / Cause / Fix`; không đưa tangent | High |
| Resume flow | Skip `[x]`, tiếp tục `[ ]`/`[/]` | Restate completed/remaining count mỗi user-visible turn | High |
| Completion | Summary walkthrough | Lead bằng what now works + verification; không generic recap | Medium |

#### `only-one-flash`: tác động lên plan gate và response density

| Thành phần | Trước skill | Sau skill | Mức tác động |
|---|---|---|---|
| Rapid research | Internal, không hiển thị metadata | Không đổi; suppress toàn bộ tool narration | Low |
| Flash Plan | Template có Mô tả/Tree/Verification | Giữ template; đặt action/mục tiêu đầu tiên, prose list ≤5 | Medium |
| Confirmation gate | Yêu cầu xác nhận | Chỉ một next action: approve hoặc nêu một adjustment | High |
| Apply status | Có thể chỉ báo khi xong | Dùng `Apply`/`Verify` progress marker khi phải quay lại người dùng | Medium |
| Completion | 1–3 câu | Câu đầu nêu change hoạt động; câu sau nêu verification | Medium |

#### `only-one-debug`: tác động lên diagnostic narrative

| Thành phần | Trước skill | Sau skill | Mức tác động |
|---|---|---|---|
| Symptom intake | Đọc log và mô tả | Lead bằng reproduction action hoặc missing evidence | Medium |
| Investigation | Continuous protocol | Restate phase; không narrate từng tool call | Medium |
| Hypothesis | Có evidence/instrumentation | Evidence trước, hypothesis sau; doubtful assumption hiện rõ | High |
| Error report | Narrative bilingual | Chuẩn `Location / Cause / Fix`, giữ technical evidence | High |
| Handoff | Summary + apply command | Lead bằng confirmed root cause; kết thúc bằng một apply command | Medium |

### Cross-Workflow Behavioral Invariants

Skill **sẽ thay đổi**:
- Thứ tự trình bày trong chat: action/answer trước, context sau.
- Mật độ response: ít prose, ít tangent, progress rõ.
- Cách hỏi người dùng: một câu hỏi hoặc một decision mỗi turn.
- Cách báo lỗi và hoàn thành: structured, visible, actionable.

Skill **không được thay đổi**:
- Lifecycle order: `idea → plan → apply` và `debug → apply`.
- Hard stop, review gate, approval requirement và lifecycle isolation.
- Artifact location, frontmatter, canonical sections, Task Matrix và Unified Diff.
- Research depth, test rigor, security confirmation và technical completeness.

### Precedence Rules

1. Security confirmation và destructive-action warning ưu tiên cao nhất.
2. Workflow lifecycle gates và canonical artifact schemas ưu tiên hơn output compression.
3. `i-have-adhd` điều khiển chat presentation, không thay đổi technical completeness.
4. Tables, Task Matrix, code blocks, diffs và required templates không chịu prose list cap.
5. Khi skill và workflow mâu thuẫn, giữ workflow invariant rồi áp dụng skill ở mức presentation còn lại.

### Mapping theo workflow

| Workflow | Activation & trọng tâm |
|---|---|
| `only-one-idea` | Activate trước Discovery; one-question-at-a-time; final action `/only-one-plan` |
| `only-one-plan` | Activate trước research report; concise review point; không làm loãng Task Matrix |
| `only-one-apply` | Activate trước execution; `Task X/Y`; visible test result; clear error format |
| `only-one-flash` | Activate trước Flash Plan; review gate là next action duy nhất |
| `only-one-debug` | Activate trước RCA output; phase tracking; evidence trước hypothesis |

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)
- **Upstream drift**: Mỗi install fetch `main` mới nhất nên behavior có thể đổi mà không bump phiên bản `only-one`; lock hash phải ghi exact content đã cài và freshness check phải phát hiện thay đổi.
- **Dependency declaration chưa đủ**: `requiredSkills` bảo đảm installation nhưng không bảo đảm model đọc skill. Workflow text phải explicitly activate/read `i-have-adhd`.
- **List-cap conflict**: Exempt Task Matrix, templates, code blocks, diffs và structured tables khỏi prose list cap.
- **Artifact-vs-chat conflict**: Skill áp dụng cho chat presentation; canonical artifact schemas vẫn authoritative.
- **Network/licensing**: Install cần truy cập GitHub; lỗi fetch phải fail rõ ràng. Nội dung upstream giữ MIT metadata và attribution nguyên bản.
