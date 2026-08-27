# Concept: Integrate Workflow-Enhancing Skills from mattpocock/skills into only-one-cli

## 1. Problem Statement & Root Need

- **Current Pain Point**: 
  `only-one-cli` workflows currently lack specialized, disciplined mechanics for deep domain modeling (`CONTEXT.md` / ADRs), tracer-bullet ticket breakdown with blocking edges, deep module design principles, disciplined bug diagnosis feedback loops, immediate communication realignment (`wait-what`), and seamless session context handoffs.
  Rather than adopting the entire third-party catalog, we selectively integrate **only the 7 essential skills** that directly augment and upgrade our existing workflows (`/only-one-idea`, `/only-one-plan`, `/only-one-debug`, `/only-one-archive`).

- **Target Audience & Core Value**:
  - Developers using `only-one-cli` gain targeted, high-leverage workflows with zero catalog bloat.
  - Workflows become strictly bounded: Idea focuses on WHAT/WHY/Domain, Plan focuses on Tracer-bullet Tickets & Deep Modules, Debug enforces Red-Test reproduction, and Archive enables lossless session handoffs.

---

## 2. Scope Boundaries

### In-Scope:
- **Targeted Manifest Registration**: Register exactly **7 workflow-enhancing skills** from `mattpocock/skills` in [assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts):
  1. **`grill-with-docs`** (`skills/engineering/grill-with-docs/SKILL.md`) $\rightarrow$ Powers `/only-one-idea` (Grilling with inline `CONTEXT.md` & ADR generation).
  2. **`domain-modeling`** (`skills/engineering/domain-modeling/SKILL.md`) $\rightarrow$ Powers `/only-one-idea` (DDD glossary & architecture decision records).
  3. **`wait-what`** (`skills/productivity/wait-what/SKILL.md`) $\rightarrow$ Powers `/only-one-idea` & Interactive Chat (Real-time realignment using domain vocabulary).
  4. **`to-tickets`** (`skills/engineering/to-tickets/SKILL.md`) $\rightarrow$ Powers `/only-one-plan` (Decomposing specs into tracer-bullet tickets with blocking edges).
  5. **`codebase-design`** (`skills/engineering/codebase-design/SKILL.md`) $\rightarrow$ Powers `/only-one-plan` (Designing Deep Modules with small interfaces and clean seams).
  6. **`diagnosing-bugs`** (`skills/engineering/diagnosing-bugs/SKILL.md`) $\rightarrow$ Powers `/only-one-debug` (Disciplined minimal reproduction feedback loop).
  7. **`handoff`** (`skills/productivity/handoff/SKILL.md`) $\rightarrow$ Powers `/only-one-archive` (Compacting session context for seamless agent handoff).
- Retaining existing local skills, Addy Osmani skills, and `grill-me` (as zero-footprint interview).
- Updating workflow manifests and documentation in `assets/workflows/` and `.agents/workflows/`.

### Explicit Out-of-Scope:
- All other generic or unused skills from `mattpocock/skills` (`ask-matt`, `triage`, `improve-codebase-architecture`, `setup-matt-pocock-skills`, `to-spec`, `implement`, `wayfinder`, `prototype`, `research`, `wizard`, `teach`, `to-questionnaire`, `grilling`, `writing-for-agents`, `tdd`, `resolving-merge-conflicts`, `code-review`).
- Modifying core CLI runtime execution engines outside skill manifests and workflows.

---

## 3. Success Metrics (Definition of Done)

- **100% Manifest Accuracy**: Exactly the 7 workflow-enhancing skills from `mattpocock/skills` are declared in `assets/skills/index.ts`.
- **Remote Synchronization**: `only-one skill` discovers and downloads all 7 skills from GitHub without errors.
- **Zero Regression**: Existing skills, tests (`npm test`), and doctor checks continue to pass cleanly.
- **Workflow Linkage**: Target workflows (`idea`, `plan`, `debug`, `archive`) cleanly reference their dedicated augmenting skills.

---

## 4. Proposed High-Level Approach

- Add 7 clean `SkillManifest` entries into [assets/skills/index.ts](file:///Users/kiem/Sources/Personal/only-one-cli/assets/skills/index.ts) under a dedicated section `// --- Matt Pocock Workflow Enhancing Skills ---`.
- Update [test/core/skill-registry.test.ts](file:///Users/kiem/Sources/Personal/only-one-cli/test/core/skill-registry.test.ts) to verify the 7 skills and ensure no unapproved skills are registered.
- Update workflow documentation to link the new skills into their respective execution protocols.

---

## 5. Technical English Key Patterns

### 1. Targeted integration / Hyper-focused subset
- **Meaning (VI)**: Tích hợp có chủ đích, tập trung vào tập hợp tính năng trọng yếu thay vì ôm đồm toàn bộ.
- **Grammar / Usage**: `Targeted + <Integration/Adoption>` — nhấn mạnh tính chọn lọc chiến lược.
- **Engineering Example**:
  > *"We executed a targeted integration of only seven workflow-enhancing skills to keep our manifest hyper-focused and maintainable."*

### 2. Lossless session handoff
- **Meaning (VI)**: Bàn giao phiên làm việc không làm thất thoát ngữ cảnh hoặc thông tin quan trọng giữa các agent.
- **Grammar / Usage**: `Lossless + <Handoff/Transition>` — thuật ngữ vay mượn từ nén dữ liệu (không mất mát).
- **Engineering Example**:
  > *"The handoff skill generates a structured session state document enabling lossless session handoffs across agent boundaries."*
