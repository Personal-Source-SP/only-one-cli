---
domain: core
version: 1.2.0
triggers:
  - "*"
  - "only-one/archives/**"
  - "only-one/installed.json"
---

# Rules: Core Repository & Memory Governance

### CORE-001: Single Task Archive Invariant & Clean Slug Naming
- **MUST_DO**: Distill completed tasks into exactly one clean-slug file `only-one/archives/<slug>.md` and remove raw task folders. Store timestamp in frontmatter `archived_at`.
- **NEVER_DO**: Prefix filenames with timestamp strings or move raw task folders directly into `archives/`.
- **RATIONALE**: Ensures permalink stability, clean git diffs, and avoids cluttered filenames.

### CORE-002: Ground Truth Audit in Clean Workflow
- **MUST_DO**: Cross-verify documented logic against active codebase implementation before preserving archives.
- **NEVER_DO**: Check only file existence without auditing underlying functions and contracts.
- **RATIONALE**: Eliminates zombie documentation that drifts from actual production code.

### CORE-003: Single Source of Truth Lockfile
- **MUST_DO**: Store all installed asset metadata and version tracking exclusively in `only-one/installed.json`.
- **NEVER_DO**: Create fragmented secondary lockfiles in hidden folders (e.g. `.only-one/` or `skills-lock.json`).
- **RATIONALE**: Maintains a deterministic single source of truth for asset state across all tools.

### CORE-004: Asset Version Semver Compliance
- **MUST_DO**: Assign valid base-10 semver strings (`X.Y.Z`) to all manifests in `assets/` and increment on template change.
- **NEVER_DO**: Leave asset manifests unversioned or bypass the version gate.
- **RATIONALE**: Protects CI version gates and ensures reproducible environment setups.

### CORE-005: Multi-IDE Target Resolution Over Hardcoded Agent Directory
- **MUST_DO**: Resolve global assets and hooks dynamically to each target IDE's native configuration directory (`~/.gemini/config/` and `~/.gemini/hooks/` for Antigravity, `~/.claude/` for Claude, `~/.cursor/` for Cursor) based on `AI_TOOLS` metadata.
- **NEVER_DO**: Hardcode `.agents` as a universal global target or force all IDEs to share a single root.
- **RATIONALE**: Ensures each AI runner discovers its installed skills, rules, and hooks natively without cross-tool path conflicts or orphaned dependencies.

### CORE-006: 3-Domain Asset Hierarchy Without Shims
- **MUST_DO**: Categorize all assets strictly within the 3 standardized domains (`assets/agents/`, `assets/devenv/`, `assets/templates/`) and update all path mappings directly.
- **NEVER_DO**: Retain legacy flat asset directories at the root of `assets/` or introduce temporary re-export facade shims.
- **RATIONALE**: Eliminates structural ambiguity, prevents stale path fallbacks, and maintains clean separation between AI agents, development tooling, and shared templates.

### CORE-007: Development Tooling Isolation Outside Assets Directory
- **MUST_DO**: Place internal repository development tools, linters, and custom rules in dedicated root directories (such as `eslint-rules/`, `scripts/`).
- **NEVER_DO**: Put internal development or build tooling inside `assets/`; keep `assets/` strictly dedicated to distributable client templates.
- **RATIONALE**: Prevents internal developer tooling from being bundled, distributed, or synced into client workspaces during asset operations.

### CORE-008: Architectural Layer Boundaries for Inward Dependency Flow
- **MUST_DO**: Enforce inward dependency flow (`cli` -> `commands` -> `core`) via architectural boundary lint rules (`custom/architectural-boundaries`).
- **NEVER_DO**: Import higher-level modules (`src/commands/`, `src/cli/`) into lower-level modules (`src/core/`).
- **RATIONALE**: Eliminates circular dependencies and ensures core domain logic remains headless, modular, and reusable.

### CORE-009: Canonical Skill Manifest Name and Directory Parity
- **MUST_DO**: Ensure `SkillManifest.name` matches the canonical upstream directory name exactly when integrating remote skills from `skills.sh`, and register legacy or alternative names in `SkillManifest.aliases` while resolving manifests against both `name` and `aliases`.
- **NEVER_DO**: Declare a mutated or gerund form in `SkillManifest.name` that diverges from the upstream repository's actual skill directory on GitHub/skills.sh.
- **RATIONALE**: Upstream `skills add` CLI resolves remote skills by exact folder name matching; divergent identifiers result in fatal `No matching skills found` installation errors.

### CORE-010: Tiered Progressive Disclosure for Agent Rules
- **MUST_DO**: Categorize agent rules into Tier 1 Core Safety (`alwaysApply: true`, `trigger: 'always_on'`, `< 500` tokens) and Tier 2 Stack/Domain (`alwaysApply: false`, `trigger: 'model_decision'`, with file-matching `globs`), loading specialized rules strictly on demand.
- **NEVER_DO**: Mark domain-specific or framework-specific rules as `alwaysApply: true`, flooding the agent's context window with irrelevant guidelines during unrelated tasks.
- **RATIONALE**: Preserves agent context window and token budget, prevents instruction interference between conflicting stacks (e.g. Next.js vs NestJS), and ensures core safety rules remain prominent.



