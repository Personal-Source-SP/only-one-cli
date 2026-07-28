## 1. Planning Assets and Registries

- [x] 1.2 Add `assets/skills/only-one-plan-skill/SKILL.md` as the installable entry point without duplicating unnecessary reference content.

## 2. Command Generation and Target Paths

- [x] 2.1 Add the `only-one-plan` command ID, deterministic ordering, dependency metadata, and command-content builder alongside existing agent workflows.
- [x] 2.2 Extend skill installation to generate the planning command from the new skill while reusing existing target adapters.
- [x] 2.3 Resolve command write paths through the absolute-aware path helper so Codex global prompt paths remain absolute and other targets remain project-relative.

## 3. Dependency Selection and Readiness

- [x] 3.1 Derive required workflows and MCPs from selected skill registry relationships instead of adding a planning-specific hardcoded dependency branch.

## 4. Behavioral and Regression Tests

- [x] 4.2 Add command builder and skill installation tests for Antigravity, Claude, Cursor, and Codex, including absolute Codex paths and deterministic final content after workflow-driven skill installation.
- [x] 4.3 Add workflow installer tests for required-skill installation, missing assets, and final command/workflow output.

## 5. Documentation and Validation

- [x] 5.2 Run focused workflow/skill/init/MCP tests, then full test, typecheck, build, and package validation commands defined by the repository.
- [x] 5.3 Run `openspec validate add-only-one-plan-workflow --type change --strict` and resolve every validation error before implementation is considered complete.
