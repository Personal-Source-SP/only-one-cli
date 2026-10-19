---
domain: cli
version: 1.0.0
triggers:
  - "src/commands/**"
  - "src/core/runtime/**"
  - "scripts/**"
---

# Rules: CLI Commands & Runtime Execution

### CLI-001: Windows Shell Execution for Batch Scripts
- **MUST_DO**: Set `{ shell: true }` when executing batch commands (`.cmd`, `.bat`) on `win32` platform.
- **NEVER_DO**: Spawn Windows CLI wrappers with `{ shell: false }`.
- **RATIONALE**: Avoids fatal `ENOENT` spawn errors on Windows environments.

### CLI-002: Resilient Rollback Handlers
- **MUST_DO**: Catch secondary errors inside rollback cleanups and proceed with remaining journal deletions.
- **NEVER_DO**: Allow a secondary rollback exception to mask the original root error.
- **RATIONALE**: Guarantees complete cleanup of temporary backups without hiding the underlying failure.

### CLI-003: Isolated Browser Profile for MCP
- **MUST_DO**: Launch browser automation MCPs with an isolated `--user-data-dir` argument.
- **NEVER_DO**: Start browser MCPs using default user profile paths.
- **RATIONALE**: Prevents `SingletonLock` process contention with developer personal browser sessions.

### CLI-004: Reuse-First Utility Audit
- **MUST_DO**: Check shared directories (`src/utils/`, `src/helpers/`, `src/common/`) before writing new helpers.
- **NEVER_DO**: Re-implement existing utility functions or duplicate existing regex/parsing logic.
- **RATIONALE**: Keeps code footprint minimal and leverages tested repository primitives.

### CLI-005: Skills Installation via skills.sh CLI Registry
- **MUST_DO**: Install remote skills using `npx -y skills add <skill-name>` through the official skills.sh CLI runner.
- **NEVER_DO**: Fall back to manual git repository cloning into skill folders.
- **RATIONALE**: Ensures upstream schema conformity, automatic updates, and standard lockfile registration.

