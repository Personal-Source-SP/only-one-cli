## Why

The current `only-one init` command is a large monolithic process that runs all initialization steps (tools, packages, skills, configs, and MCP) in a single unified flow. This makes it difficult for developers to selectively configure or re-initialize specific components (like adding a single skill or configuring a single MCP server) without running through the entire interactive wizard. Additionally, when components already exist, they are either overwritten without a fine-grained selection or skipped entirely, without letting users verify and choose what to overwrite/reinstall.

## What Changes

- Promote the subcomponents of the `init` command to top-level CLI commands: `only-one skill`, `only-one mcp`, and `only-one combo`.
- Change `only-one init` to act as an orchestrator/wizard that calls the core logic of these independent commands under the hood.
- Implement a unified "IDE selection" step as the first step for all commands.
- Add a pre-execution check for existing components (packages, skills, configs, MCPs) and present an interactive checkbox prompt to verify which existing items to overwrite/reinstall (ticked by default).
- Update the results summary to output detailed status reports (Success/New, Overwritten/Merged, Skipped, and Failed).

## Capabilities

### New Capabilities
<!-- None, refactoring existing capabilities -->

### Modified Capabilities
- `init-subcommands`: Update the CLI architecture to support top-level `skill`, `mcp`, and `combo` commands, and let `init` orchestrate them.
- `skills-install`: Introduce target IDE selection for skills, pre-check if selected skills already exist, and require verification checklist (pre-selected by default) to overwrite existing skills.
- `mcp-global-sync`: Introduce target IDE selection for MCP configurations, check if selected MCP servers already exist in `mcp.json`, and prompt for overwrite verification rather than silently skipping.
- `idsd-flow-combo`: Ensure combo installations run through target IDE selection, pre-check all combo components (packages, skills, configs, MCPs) for existence, and prompt for confirmation before overwriting existing components.

## Impact

- `src/cli/index.ts`: Register new top-level commands.
- `src/commands/init/command.ts`: Refactor to orchestrate the new core services.
- `src/commands/skill/command.ts`, `src/commands/mcp/command.ts`, `src/commands/combo/command.ts`: Introduce new CLI command handlers.
- `src/core/init/init-command.ts`: Refactor or split into modular core services in `src/core/skill`, `src/core/mcp`, and `src/core/combo`.
- Test suite: Update existing tests in `test/commands/init/` and add test cases for individual new commands.
