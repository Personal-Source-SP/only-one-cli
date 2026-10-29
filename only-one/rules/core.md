---
domain: core
version: 1.1.0
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

