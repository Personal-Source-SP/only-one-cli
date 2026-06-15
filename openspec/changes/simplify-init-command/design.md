## Context

Current `init` command in `only-one-cli` does two distinct things:

1. **Project config**: Prompts for server URL, project name, index mode, git remote, default branch, private repo token. Writes `.onlyonecli.yml`, syncs backend, scaffolds structure output, adds gitignore rules.
2. **Agent skill setup**: Multi-select tool picker, installs structure-generate + structure-apply skills to each tool's directory.

Both the `@fission-ai/openspec` CLI and the `only-one-cli` project exist on the machine. `openspec init` already handles tool selection and standard skill installation (the OpenSpec workflow skills). The `only-one-cli` project has additional custom skills in `.agents/skills/` (architectural-decision-records, c4-diagrams, gherkin-authoring, grill-me, openspec-git-discipline) that need to be installed per-tool.

The project config portion is unused in the current workflow — users rely on `openspec` for project setup. Removing it reduces maintenance and simplifies the user experience.

## Goals / Non-Goals

**Goals:**
- Strip all project config logic from `only-one-cli init` (server, project-name, index-mode, source-uri, default-branch, git-token, backend sync, structure scaffold, gitignore)
- Make `init` an orchestrator: (1) ensure openspec CLI installed, (2) run `openspec init`, (3) sync custom skills to selected tools
- Keep backward-compatible flags where reasonable (`--force`, `--no-install-skill`, `--tools`, `[path]`)
- Remove dead code, imports, and type definitions related to stripped functionality

**Non-Goals:**
- Not modifying `openspec` CLI itself
- Not changing the structure of `.agents/skills/` skill files
- Not changing the per-tool directory mapping in `src/core/agent/tools.ts`
- Not modifying the command-generation adapters

## Decisions

### 1. Delegate tool selection to `openspec init`
**Decision**: Run `openspec init [path]` as a child process instead of reimplementing tool selection in `only-one-cli`.
**Rationale**: `openspec init` and `only-one-cli init` had near-identical tool selection logic. Duplicating it creates maintenance burden. Running openspec CLI is simpler and ensures feature parity.
**Alternative considered**: Keep prompting in `only-one-cli` and pass `--tools` to openspec. Rejected because it duplicates UX and adds coupling.

### 2. Read selected tools from openspec config after init
**Decision**: After `openspec init` completes, parse `.openspec.yaml` to get the list of selected `agent_tools`.
**Rationale**: Avoids prompting the user twice. The openspec config is the single source of truth for which tools are active.
**Alternative considered**: Capture stdout from `openspec init`. Rejected because openspec init may or may not output JSON programmatically.

### 3. Custom skills sync as separate step
**Decision**: After openspec init, copy `.agents/skills/<name>/SKILL.md` to each selected tool's `<skillsDir>/skills/<name>/SKILL.md`.
**Rationale**: Custom skills (architectural-decision-records, c4-diagrams, etc.) are project-specific and must be installed per-tool using the existing skill directory pattern.
**Implementation**: Use `resolveStructureSkillPath()` from `command-path.ts` to compute destination paths per tool.

### 4. Keep `--no-install-skill` and `--tools` as pass-through flags
**Decision**: `--no-install-skill` skips both openspec init and custom skills sync. `--tools <list>` passes through to openspec init as `--tools <list>`.
**Rationale**: Backward compatibility for CI/non-interactive usage.

### 5. Remove `--server`, `--project-name`, `--index-mode`, `--source-uri`, `--default-branch`, `--git-token`
**Decision**: Delete these flags entirely.
**Rationale**: Openspec init handles project-level configuration. These flags were only used for the removed project config flow.

### 6. New module structure
**Decision**: Create two new files:
- `src/core/init/openspec-bootstrap.ts` — openspec check/install/run logic
- `src/core/init/custom-skills-sync.ts` — copy custom skills to tool dirs
**Rationale**: Separation of concerns. Keeps `init-command.ts` focused on orchestration.

## Risks / Trade-offs

- **Risk**: `openspec` CLI not found → Mitigation: `openspec-bootstrap` module auto-installs via `npm install -g @fission-ai/openspec`. Also check PATH after install.
- **Risk**: `.openspec.yaml` format changes in future openspec versions → Mitigation: Parse only the `agent_tools` field; fail gracefully with error message.
- **Risk**: `openspec init` fails for any reason (network, permissions) → Mitigation: Bubble up error with clear message; offer to retry.
- **Risk**: npm global install fails without sudo on some systems → Mitigation: Check for errors and suggest `sudo npm install -g @fission-ai/openspec`.
- **Trade-off**: Removing project config is breaking change but simplifies the command significantly. Users who need the old flow can still run openspec separately.

## Migration Plan

1. Ship new init in next minor version with clear changelog entry
2. Old flags produce a deprecation message pointing to `openspec` CLI equivalents
3. After 1 release cycle, remove flag handling entirely if no negative feedback

## Open Questions

- Should old flags produce deprecation warnings or just be ignored silently? (Leaning: warn once per flag to help migration)
- Should `only-one-cli init` still write `.onlyonecli.yml` with just `agent_tools` field or rely entirely on openspec config? (Leaning: rely on openspec config entirely)
