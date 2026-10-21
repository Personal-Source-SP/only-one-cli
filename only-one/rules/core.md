---
domain: core
version: 1.0.0
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

### CORE-005: Canonical Global Agent Home Standard
- **MUST_DO**: Route all global assets to the canonical user root `~/.agents/{skills,workflows,rules}` and non-destructively bridge `skills.json` manifests across tool configurations.
- **NEVER_DO**: Install global assets directly into legacy tool-specific directories without canonical `.agents` registry synchronization.
- **RATIONALE**: Unifies global agent discovery across different AI runners (Antigravity, Claude, Codex) while preserving backward compatibility.

