## Why

`only-one init` currently duplicates component selection, existence checks, installation, dependency handling, and reporting that also live in standalone commands, and it can perform side effects before the user sees the complete plan. Refactoring init into a pure orchestrator creates one predictable wizard that gathers selections, builds a read-only plan, summarizes new and existing resources, confirms once, then delegates execution to shared component services.

## What Changes

- Refactor `only-one init` so command/core init logic only coordinates selection, planning, summary, confirmation, execution order, and aggregate reporting.
- Select agents once at the start and reuse that exact target set across MCP, skill, plugin, and rule categories, filtered by capability without re-prompting.
- Present a single choice between one combo and custom setup.
- Combo mode selects exactly one combo, expands it into the same component plan used by custom mode, and does not execute a separate combo installer path.
- Custom mode visits Package → Config → MCP → Skill → Plugin → Rule once; every category allows empty selection to skip.
- Plugin and rule selection remains per selected agent, showing only compatible assets; unsupported agent/category pairs are not prompted and are treated as not applicable.
- Introduce side-effect-free component planners that classify selected package/config/skill/MCP/rule items as new or existing per destination and agent where applicable.
- Show one pre-execution summary grouped by category, separating user-selected items from `Auto-required` dependencies and marking new versus existing resources.
- Show plugins in summary as planned automatic/manual actions without claiming new/existing status because plugin hosts lack consistent detection.
- Treat final confirmation as authorization to install new resources and overwrite/reinstall existing selected resources.
- Execute the frozen plan only after confirmation; continue independent categories after failures and produce one final category-grouped report.
- Keep explicit init flags/subcommands for plan construction, but require an interactive confirmation. Headless init prints the plan and stops with guidance to run interactively; automation should use standalone component commands.
- Move package/config planning, package post-install hooks, workflow dependency expansion, rule dependency expansion, `.gitignore` planning, and readiness reporting behind reusable component services instead of init-specific branches.

## Capabilities

### New Capabilities

- `init-plan-orchestration`: Defines immutable aggregate init plans, category planners, selected versus auto-required provenance, new/existing classification, confirmation, execution, and aggregate reporting.

### Modified Capabilities

- `init-interactive-flow`: Changes init to agent-first combo/custom planning with one summary and one confirmation before any side effect.
- `init-combo-flow`: Limits init combo mode to one combo and expands it through shared component planners rather than a separate installer.
- `init-subcommands`: Makes init and standalone commands share prompt-free planning/execution services while retaining explicit init surfaces.
- `packages-install`: Adds reusable package planning and moves package actions/post-install behavior behind package service boundaries.
- `configs-copy`: Adds reusable config existence planning and plan-driven copy/overwrite execution.
- `skills-install`: Adds per-target skill planning and separates workflow dependency expansion from mutation.
- `mcp-global-sync`: Adds per-target MCP planning suitable for aggregate pre-execution summary and frozen execution decisions.
- `plugins-install`: Adds planned per-agent plugin actions to init aggregation without unsupported existence claims.
- `rules-install`: Adds exact per-agent rule planning and externalizes dependency actions into the aggregate init plan.

## Impact

- Major refactor across init command/core, combo, package, config, skill, workflow, MCP, plugin, rule, target-selection, gitignore, readiness, types, reports, and tests.
- Removes side effects before final init confirmation and eliminates late overwrite/dependency prompts during execution.
- Changes combo init from multi-select/independent execution to single-combo aggregate planning.
- Makes existing-resource state observable per category and per agent/destination where relevant.
- Does not remove standalone commands, explicit init options, asset registries, supported targets, plugin actions, or rule dependency contracts.
