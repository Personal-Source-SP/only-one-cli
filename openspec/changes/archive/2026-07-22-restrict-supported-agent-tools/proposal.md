## Why

Target IDE/CLI selection is duplicated across commands and currently exposes inconsistent sets of tools, including tools outside the intended support boundary. A centralized, capability-aware allowlist is needed so every command offers only verified targets and applies consistent parsing, validation, defaults, and interactive selection.

## What Changes

- Add one fixed allowlist containing Antigravity, Claude, Cursor, and Codex in stable display order.
- Add capability-aware target resolution so each command sees only allowed targets it can fully support.
- Add a shared selection flow for CSV options, explicit-ID validation, automatic selection, preselection, and interactive checkbox prompts.
- Extend global MCP synchronization to Claude JSON config and Codex TOML config while preserving unrelated configuration and existing transactional writes.
- Restrict agent skill, combo, init, MCP, VS settings, and VS extensions flows to command-appropriate subsets of the central allowlist.
- **BREAKING** Reject agent target IDs outside Antigravity, Claude, Cursor, and Codex instead of accepting or displaying the wider agent catalog.
- **BREAKING** Remove VS Code from `setting-vs` and `extensions-vs` target selection; those commands support only Antigravity and Cursor.
- **BREAKING** Fail on malformed existing MCP configuration instead of treating it as empty and potentially replacing existing data.

## Capabilities

### New Capabilities

- `allowed-tool-selection`: Defines the fixed target allowlist, capability filtering, shared explicit/automatic/interactive selection behavior, and consistent rejection of unsupported targets.

### Modified Capabilities

- `mcp-global-sync`: Expands verified MCP targets to Antigravity, Claude, Cursor, and Codex with JSON/TOML serialization and preservation of unrelated config.
- `skills-install`: Restricts selectable skill-installation targets to the four allowed tools and applies shared target-selection behavior.
- `vs-settings-sync`: Restricts settings targets to the allowed VS-capable subset, Antigravity and Cursor.
- `vs-extensions-sync`: Restricts extension targets to the allowed VS-capable subset, Antigravity and Cursor.
- `init-interactive-flow`: Uses the same capability-aware target selection for agent-artifact and MCP setup steps.
- `idsd-flow-combo`: Restricts combo target selection to the four allowed tools through the shared selection behavior.

## Impact

- Affects command handlers for `skill`, `combo`, `mcp`, `init`, `setting-vs`, and `extensions-vs`.
- Adds a core allowed-target catalog, capability selectors, and shared selection engine.
- Adds Claude and Codex MCP adapters and JSON/TOML codec abstraction.
- Adds a TOML dependency for Codex configuration.
- Changes accepted CLI option values and non-interactive defaults for target-selection flags.
- Requires updates to CLI help, examples, unit tests, integration tests, and existing OpenSpec capability contracts.
