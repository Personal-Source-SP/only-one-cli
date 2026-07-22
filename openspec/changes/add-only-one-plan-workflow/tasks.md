## 1. Planning Assets and Registries

- [ ] 1.1 Add `assets/workflows/only-one-plan.md` with decision gates, GitNexus-first discovery, source verification, read-only boundaries, minimum-impact analysis, OpenSpec/docs output, and required performance/security evidence.
- [ ] 1.2 Add `assets/skills/only-one-plan-skill/SKILL.md` as the installable entry point without duplicating unnecessary reference content.
- [ ] 1.3 Register `only-one-plan` with `requiredSkills: ['only-one-plan-skill']` and `requiredMcps: ['gitnexus']`, then associate the skill back to the workflow.

## 2. Command Generation and Target Paths

- [ ] 2.1 Add the `only-one-plan` command ID, deterministic ordering, dependency metadata, and command-content builder alongside existing agent workflows.
- [ ] 2.2 Extend skill installation to generate the planning command from the new skill while reusing existing target adapters.
- [ ] 2.3 Resolve command write paths through the absolute-aware path helper so Codex global prompt paths remain absolute and other targets remain project-relative.

## 3. Dependency Selection and Readiness

- [ ] 3.1 Derive required workflows and MCPs from selected skill registry relationships instead of adding a planning-specific hardcoded dependency branch.
- [ ] 3.2 Preselect GitNexus for the planning workflow and warn without overriding when the user opts out.
- [ ] 3.3 Extend readiness reporting to include workflow presence and credential-free MCP readiness, while reporting GitNexus indexing as a usage prerequisite rather than a missing secret.

## 4. Behavioral and Regression Tests

- [ ] 4.1 Add static asset/registry tests covering names, reciprocal associations, GitNexus dependency, read-only guardrails, decision gates, output contract, performance, and security sections.
- [ ] 4.2 Add command builder and skill installation tests for Antigravity, Claude, Cursor, and Codex, including absolute Codex paths and deterministic final content after workflow-driven skill installation.
- [ ] 4.3 Add workflow installer tests for required-skill installation, missing assets, and final command/workflow output.
- [ ] 4.4 Add init tests for metadata-derived GitNexus preselection, explicit opt-out warnings, and credential-free readiness.
- [ ] 4.5 Run existing MCP registry, codec, sync, and command tests to confirm the read-only GitNexus policy remains unchanged.

## 5. Documentation and Validation

- [ ] 5.1 Update README workflow documentation with `only-one-plan`, supported targets, GitNexus-first behavior, index prerequisite, fallback consent, read-only boundary, and OpenSpec/docs output.
- [ ] 5.2 Run focused workflow/skill/init/MCP tests, then full test, typecheck, build, and package validation commands defined by the repository.
- [ ] 5.3 Run `openspec validate add-only-one-plan-workflow --type change --strict` and resolve every validation error before implementation is considered complete.
