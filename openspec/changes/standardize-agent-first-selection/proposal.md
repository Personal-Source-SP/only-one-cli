## Why

Plugin and rule commands currently choose assets before agents, unlike skill and MCP flows, and `--yes` overloads target selection, asset selection, overwrite approval, dependency installation, and final confirmation with inconsistent behavior across commands. Standardizing agent-first selection and removing CLI-wide auto-confirm makes every mutation explicit, predictable, and safer for interactive and automated use.

## What Changes

- Make `only-one plugin` and `only-one rule` select agents before assets.
- In interactive mode, prompt separately for compatible plugins or rules for each selected agent, with all compatible assets selected by default.
- Preserve explicit automation through complete component IDs plus `--tool`/`--ide` agent IDs; explicit inputs skip corresponding prompts.
- **BREAKING**: Remove `--yes` from every CLI command and remove stale `doctor --yes` suggestions and dormant auto-install behavior.
- Remove implicit select-all behavior when prompts are unavailable; non-interactive calls with missing required agent or component arguments fail with actionable missing-argument errors.
- Keep existing-resource verification interactive. When verification cannot run in non-TTY mode, skip existing items and continue with new work rather than overwriting.
- Keep explicit target CSV and `all` behavior for callers that intentionally select targets.
- Require main init to show final confirmation before side effects; non-interactive init must provide complete selections and cannot bypass confirmation-driven interactive orchestration.
- Update tests, help, README, and OpenSpec contracts for removed flags and new selection semantics.

## Capabilities

### New Capabilities

- `plugins-install`: Defines agent-first plugin selection, per-agent compatible plugin prompts, explicit non-interactive inputs, and target action reporting.
- `rules-install`: Defines agent-first rule selection, per-agent compatible rule prompts, explicit non-interactive inputs, existing-rule verification, and dependency-aware installation.

### Modified Capabilities

- `allowed-tool-selection`: Removes implicit automatic target selection and standardizes explicit or interactive agent selection with compatible targets selected by default.
- `init-subcommands`: Adds plugin/rule agent-first command behavior and removes `--yes` from all component command interfaces.
- `init-interactive-flow`: Removes auto-confirm, requires final interactive confirmation, and defines missing-prompt failure behavior.
- `packages-install`: Removes package reinstall auto-confirm and skips existing packages when verification is unavailable.
- `skills-install`: Removes skill overwrite auto-confirm and skips existing skills when verification is unavailable.

## Impact

- Affects command options and help for init, package, configs, skill, MCP, combo, plugin, rule, and stale doctor remediation text.
- Affects shared target selection, prompt ordering, per-agent asset selection, overwrite/reinstall verification, init confirmation, non-TTY behavior, command types, tests, and documentation.
- Breaks scripts that pass `--yes`; replacement is explicit component IDs plus explicit agent IDs. Existing resources are not overwritten by non-interactive automation.
- Does not change plugin actions, rule dependency semantics, supported target capabilities, asset registries, or native installation paths.
