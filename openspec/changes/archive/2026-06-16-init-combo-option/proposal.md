## Why

Currently, when running the `init` command, users must individually select packages and skills through interactive multi-select menus. This can be repetitive and slow for standard configurations. A "combo" option allows predefined sets of packages and skills to be selected in one step, streamlining project initialization for standard development environments.

## What Changes

- Add a new `--combo [names]` option to the `init` command, accepting a comma-separated list of combo names.
- Introduce a new interactive prompt at the start of the `init` command to choose between using "Combo" (default) or "Custom" (original flow).
- Support defining combos as YAML files in `libraries/combos/*.yaml`.
- Regardless of setup method (Combo or Custom), **Tool selection (Step 1) is always run and mandatory.**
- When using the Combo flow:
  - Display available combos as a **multi-select prompt**, allowing the user to select one or more combos.
  - Merge the packages and skills from all selected combos, removing duplicates.
  - Skip individual package (Step 2) and skill (Step 3) selection steps.
  - Automatically install the merged list of packages and copy the merged list of skills to the selected tools.

## Capabilities

### New Capabilities
- `init-combo-flow`: Support initializing a project using one or more predefined configuration combos from YAML files, either interactively via multi-select or via a comma-separated CLI option.

### Modified Capabilities
- `init-interactive-flow`: Update the interactive wizard flow to first ask whether the user wants to use a Combo or Custom configuration.

## Impact

- CLI interface of `init` command (`src/commands/init/command.ts`, `src/commands/init/types.ts`).
- Init orchestrator logic (`src/core/init/init-command.ts`, `src/core/init/types.ts`).
- New directory `libraries/combos` created to store combo YAML files.
