---
domain: cli
version: 1.3.0
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

### CLI-006: Graceful SIGINT Promise Settlement
- **MUST_DO**: Intercept `SIGINT` / `Ctrl+C` in asynchronous CLI wizard workflows and cleanly resolve or reject outstanding top-level promises before process exit.
- **NEVER_DO**: Exit immediately via `process.exit()` while top-level async/await promises are pending in interactive wizards.
- **RATIONALE**: Prevents Node.js runtime warning `Detected unsettled top-level await` and uncommitted state corruption.

### CLI-007: Preserve Standalone Node Modules in Packaging
- **MUST_DO**: Explicitly permit `node_modules` inside standalone build distributions (e.g. `.next/standalone`) during archive packaging and synchronize static runtime assets (`.next/static`).
- **NEVER_DO**: Apply raw unfiltered directory exclusions (`child === 'node_modules'`) across recursive packaging routines.
- **RATIONALE**: Standalone builds package isolated production dependencies in nested `node_modules`; omitting them causes fatal runtime `MODULE_NOT_FOUND` errors on execution.

### CLI-008: Domain Subpath Mapping in Postbuild Asset Transformers
- **MUST_DO**: Explicitly map alias domain subpaths (`@assets/ignore/` -> `templates/ignore/`, `@assets/skills/` -> `agents/skills/`, `@assets/rules/` -> `agents/rules/`) in postbuild ESM path transformer scripts.
- **NEVER_DO**: Rely on generic flat alias prefix replacement that fails to mirror the domain directory structure in `dist/assets/`.
- **RATIONALE**: Node.js ESM loader requires exact relative file paths to existing `.js` files; unmapped aliases cause fatal `ERR_MODULE_NOT_FOUND` crashes at runtime.

### CLI-009: Pre-Build Lint Gate Integration
- **MUST_DO**: Hook `npm run lint` into the pre-build or build lifecycle (`npm run build`) to ensure zero-error lint compliance and strict type-only imports before artifact generation.
- **NEVER_DO**: Allow `npm run build` to package dist artifacts while lint errors or unhandled architectural boundary violations exist.
- **RATIONALE**: Catches unawaited promises, broken module boundaries, and invalid imports before distribution.

### CLI-010: Global Subagent Distribution Routing
- **MUST_DO**: Route subagent asset installations in combo managers to user-level global configuration roots (`~/.gemini/config/agents/` for Antigravity, `~/.claude/agents/` for Claude Code) when installed globally.
- **NEVER_DO**: Place global subagents into non-standard tool directories or omit machine-level directory creation during combo distribution.
- **RATIONALE**: Ensures universal subagent discovery and immediate reuse across all projects on the workstation.


