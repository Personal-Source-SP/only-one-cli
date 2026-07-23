## 1. Shared Selection and Interaction Policy

- [x] 1.1 Add failing target-selection tests proving explicit CSV and `all` work, compatible agents are checked by default interactively, empty selection fails, and missing prompts never select all.
- [x] 1.2 Refactor shared target selection so command-facing callers use explicit-or-interactive policy and receive actionable missing-target errors in non-TTY mode.
- [x] 1.3 Add a reusable target-to-assets selection plan that validates manifest compatibility and preserves stable target and asset ordering.
- [x] 1.4 Add reusable non-TTY missing-argument errors naming required positional IDs and `--tool` or `--ide` options.

## 2. Agent-First Plugin and Rule Commands

- [x] 2.1 Add failing plugin command tests for agent prompt first, one compatible plugin prompt per selected agent, all-compatible defaults, and different selections per agent.
- [x] 2.2 Refactor plugin command and core service to consume per-agent plugin selections while preserving installed, action-required, skipped, and failed reporting.
- [x] 2.3 Add failing rule command tests for agent prompt first, one compatible rule prompt per selected agent, all-compatible defaults, and different selections per agent.
- [x] 2.4 Refactor rule selection, dependency planning, existence checks, and installation to consume per-agent rule selections.
- [x] 2.5 Add explicit non-interactive plugin/rule tests proving complete IDs skip prompts and incomplete IDs fail before side effects.
- [x] 2.6 Add compatibility tests proving each per-agent prompt excludes unsupported assets and explicit incompatible pairs fail preflight.

## 3. Remove Yes Flag CLI-Wide

- [x] 3.1 Add command-surface tests proving `--yes` is rejected for init, package, configs, skill, MCP, combo, plugin, and rule commands.
- [x] 3.2 Remove every registered `--yes` Commander option and remove `yes` fields from command, init, and doctor option types.
- [x] 3.3 Remove `yes` propagation and branches from init orchestration, plugin, rule, skill, MCP, combo, package, and configs flows.
- [x] 3.4 Remove stale `only-one doctor --yes` remediation output and dormant auto-install handling; keep doctor non-TTY behavior diagnosis-only.
- [x] 3.5 Replace root help and README `--yes` examples with explicit component ID plus target ID examples.

## 4. Verification and Non-TTY Safety

- [x] 4.1 Add failing package tests proving existing packages require interactive reinstall confirmation and are skipped non-interactively while new packages continue.
- [x] 4.2 Add failing skill, MCP, combo, and rule tests proving existing resources use checked verification prompts interactively and skip non-interactively.
- [x] 4.3 Implement empty overwrite/reinstall plans when verification prompts are unavailable and preserve skipped outcomes in reports.
- [x] 4.4 Reconcile associated workflow behavior so non-TTY skill runs never silently auto-install workflows and report pending workflow action clearly.
- [x] 4.5 Add main init tests for interactive final confirmation, complete explicit non-TTY execution, incomplete-plan failure, and existing-resource skip behavior.
- [x] 4.6 Refactor init planning so all required selections validate before side effects and a complete explicit plan acts as consent for new work.
- [x] 4.7 Remove implicit OpenSpec bootstrap installation and final-confirm bypass formerly triggered by `--yes`; preserve explicit and interactive setup paths.

## 5. Regression Coverage and Documentation

- [x] 5.1 Update tests that used `--yes` to pass explicit component and agent IDs or interactive prompt responses.
- [x] 5.2 Add regression tests for skill, MCP, and combo agent-first prompt order and compatible-agent checked defaults.
- [x] 5.3 Add integration tests covering per-agent plugin/rule choices, partial outcomes, manual plugin actions, and rule dependency plans.
- [x] 5.4 Document breaking migration from `--yes`, explicit `all` target selection, missing-argument errors, and non-TTY skip semantics.
- [x] 5.5 Run focused command, target-selection, init, package, skill, MCP, combo, plugin, rule, and doctor tests.
- [x] 5.6 Run project type-check, lint, full test suite, and package build; fix failures introduced by this change.
- [x] 5.7 Run `openspec validate standardize-agent-first-selection --type change --strict` and resolve every validation error before implementation is marked complete.
