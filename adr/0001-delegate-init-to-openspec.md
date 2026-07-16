# 0001. Delegate init tool setup to openspec CLI

- Status: accepted
- Date: 2026-06-15

## Context

The `only-one init` command previously handled both project configuration (server URL, project name, index mode, git remote, backend sync) and agent tool/skill installation. This duplicated functionality already provided by the `openspec init` command from `@fission-ai/openspec`. Maintaining two parallel implementations for tool selection and skill installation created unnecessary maintenance burden and UX inconsistency.

The `only-one` project maintains custom skills (architectural-decision-records, c4-diagrams, gherkin-authoring, grill-me) in `.agents/skills/` that are not part of openspec's standard skill set and must still be installed per selected tool.

## Decision

1. `only-one init` is reduced to an orchestrator with three steps:
   - Ensure `openspec` CLI is available (auto-install if missing)
   - Run `openspec init` to handle tool selection and standard skill installation
   - Copy project-specific custom skills from `.agents/skills/` to each selected tool's skill directory
2. All project configuration flags (`--server`, `--project-name`, `--index-mode`, `--source-uri`, `--default-branch`, `--git-token`) are removed.
3. Selected tools are read from `.openspec.yaml` after openspec init completes.
4. Custom skills are synced per-tool using the existing `resolveStructureSkillPath()` pattern.

## Consequences

- Positive: Eliminates duplicated tool selection logic between only-one and openspec.
- Positive: Users get a consistent init experience regardless of which CLI they use.
- Positive: Reduces maintenance burden (~150 lines removed from init-command.ts).
- Negative: Adds a runtime dependency on openspec CLI being installed (mitigated by auto-install on demand).
- Negative: Breaking change for users relying on the removed flags (mitigated by deprecation warnings).
- Negative: Custom skills sync depends on openspec's `.openspec.yaml` format (mitigated by graceful error handling).
