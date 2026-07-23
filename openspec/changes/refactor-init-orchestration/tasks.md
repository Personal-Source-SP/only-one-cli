## 1. Aggregate Plan and Result Contracts

- [x] 1.1 Add failing tests for immutable planned item keys, category, target, destination, selected/auto-required origin, new/existing/planned-action state, and execution decisions.
- [x] 1.2 Introduce shared `InitPlan`, `PlannedItem`, and execution result types with deterministic category and item ordering.
- [x] 1.3 Implement deduplication that promotes directly selected items over auto-required duplicates while retaining dependency reasons.
- [x] 1.4 Add grouped pre-execution summary renderer for Selected, Auto-required, New, Existing, and plugin Planned action sections.
- [x] 1.5 Add grouped final report renderer keyed to actual installed, overwritten/reinstalled, action-required, skipped, and failed outcomes.

## 2. Extract Package and Config Services

- [x] 2.1 Add package planner tests for local/global new/existing detection and side-effect-free package post-action planning.
- [x] 2.2 Move package registry checks, npm execution, OpenSpec initialization, and UI/UX per-agent setup behind package planner/executor services.
- [x] 2.3 Remove package-name post-install branches from init and combo orchestration after parity tests pass.
- [x] 2.4 Add config planner tests that classify every destination file independently without writes.
- [x] 2.5 Extract config selection, existence checking, copy/overwrite execution, and per-file results into reusable service.
- [x] 2.6 Add package/config failure-continuation tests proving later independent items still execute and report.

## 3. Adapt Agent Component Planners and Executors

- [x] 3.1 Add exact per-agent MCP planner tests for new/existing config state, credentials, destinations, and zero writes before execution.
- [x] 3.2 Adapt MCP sync to consume frozen agent-MCP decisions without late overwrite prompts while retaining transactional recovery.
- [x] 3.3 Add exact per-agent skill planner tests and move associated workflow/required MCP expansion out of skill execution.
- [x] 3.4 Adapt skill/workflow execution to exact planned pairs without internal dependency prompts or widened target sets.
- [x] 3.5 Add plugin planner that emits exact automatic/manual actions without claiming new/existing state.
- [x] 3.6 Fix rule planning and execution to preserve exact per-agent rule selections instead of flattening to a target-rule cross-product.
- [x] 3.7 Move rule package/plugin/MCP/skill dependency execution into aggregate planning and make rule executor dependency-result aware.

## 4. Combo and Custom Selection Orchestration

- [x] 4.1 Add init interaction tests proving agent selection occurs once before setup-mode selection and no category re-prompts agents.
- [x] 4.2 Implement single-select Combo versus Custom setup choice after agent selection.
- [x] 4.3 Refactor combo service into single-combo component expansion and remove independent init combo installation path.
- [x] 4.4 Add combo parity tests proving component state, dependencies, and execution use the same category planners/executors as custom flow.
- [x] 4.5 Implement custom prompt order Package → Config → MCP → Skill → Plugin → Rule with empty selection allowed for each category.
- [x] 4.6 Keep plugin and rule asset prompts per compatible selected agent and omit unsupported category-agent prompts without failure.
- [x] 4.7 Preserve explicit `--step`, `--skip`, combo, and component inputs as plan preselection while keeping final interactive confirmation mandatory.

## 5. Pure Init Planning and Confirmation

- [x] 5.1 Add tests proving OpenSpec installation, directory creation, copies, npm commands, plugin commands, MCP writes, and `.gitignore` updates never happen before confirmation.
- [x] 5.2 Build aggregate dependency expansion to fixed point with selected/auto-required provenance and cycle/deduplication guards.
- [x] 5.3 Build complete per-destination state plan before rendering summary, including plugin action-only entries.
- [x] 5.4 Replace late skill/workflow/MCP overwrite prompts with existing overwrite/reinstall decisions shown in the final summary.
- [x] 5.5 Make final confirmation authorize every displayed existing overwrite/reinstall and every auto-required action.
- [x] 5.6 Add decline tests proving zero local and global side effects.
- [x] 5.7 Make headless init print/return the plan then stop with interactive-confirm guidance; retain standalone commands for automation.

## 6. Frozen Plan Execution and Reporting

- [x] 6.1 Implement deterministic execution coordinator for packages, configs, MCPs, skills, workflows, plugins, rules, `.gitignore`, then readiness checks.
- [x] 6.2 Ensure category executors consume exact planned items without prompts, reselection, dependency rediscovery, or implicit cross-products.
- [x] 6.3 Add dependency-failure propagation so dependent items skip with reason while unrelated items continue.
- [x] 6.4 Add integration tests for mixed successes, failures, manual plugin actions, installed-not-ready rules, and complete grouped reporting.
- [x] 6.5 Replace coarse init selected/installed response fields with plan/result data whose statuses reflect actual execution.
- [x] 6.6 Add drift/precondition checks where practical so state changes after planning are reported rather than silently changing overwrite policy.

## 7. Command Reuse, Cleanup, and Documentation

- [x] 7.1 Route nested init component surfaces through shared planners/executors and remove duplicated `runInitMcp` behavior.
- [x] 7.2 Route standalone package/config surfaces or their nested equivalents through the same extracted services.
- [x] 7.3 Incrementally align standalone combo with shared aggregate combo planner after init behavior parity is established.
- [x] 7.4 Remove dead monolithic init helpers, repeated existence checks, direct Inquirer imports from core, unused result types, and inconsistent home-directory resolution.
- [x] 7.5 Update README/help for agent-first init, one combo/custom choice, category order, optional category skips, auto-required summary, and one confirmation.
- [x] 7.6 Document headless init confirmation limitation and standalone command automation path.

## 8. Verification

- [x] 8.1 Run focused init plan, selection, combo, package, config, MCP, skill/workflow, plugin, rule, gitignore, and reporting tests.
- [x] 8.2 Run project type-check, lint, full test suite, and package build; fix failures introduced by this refactor.
- [x] 8.3 Run interactive smoke tests for one combo and custom flow across multiple agents, including existing resources and user cancellation.
- [x] 8.4 Run `openspec validate refactor-init-orchestration --type change --strict` and resolve every validation error before implementation is marked complete.
