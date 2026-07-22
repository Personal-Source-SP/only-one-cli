## 1. Allowed target foundation

- [x] 1.1 Add typed Antigravity, Claude, Cursor, and Codex IDs plus stable allowlist order to constants and export them from the constants barrel.
- [x] 1.2 Add capability and allowed-target descriptor types for agent artifacts, MCP, VS settings, and VS extensions.
- [x] 1.3 Build the central allowed-target catalog and selectors that resolve backing `AI_TOOLS`, MCP adapter, and VS editor entries in allowlist order.
- [x] 1.4 Add invariant tests for unique IDs, stable order, capability subsets, and missing backing adapters.

## 2. Shared target selection

- [x] 2.1 Implement the generic typed selection engine for CSV parsing, normalization, duplicate handling, explicit validation, automatic selection, preselection, and interactive checkbox selection.
- [x] 2.2 Add thin agent, MCP, and VS capability wrappers that supply choices and preserve command-specific messages and defaults.
- [x] 2.3 Add selection tests covering valid CSV, unsupported IDs, `all`, automatic selection, preselection, and empty interactive selection.
- [x] 2.4 Route agent setup argument resolution and configured-tool labels through the allowed-target selectors without replacing OpenSpec-owned init prompts.

## 3. MCP format and adapters

- [x] 3.1 Add the selected TOML dependency and update package lock metadata.
- [x] 3.2 Add JSON and TOML MCP config codecs with explicit malformed-config errors and complete-object serialization.
- [x] 3.3 Extend MCP adapter types to own codecs and add verified Claude and Codex paths and MCP container accessors.
- [x] 3.4 Refactor MCP sync to use adapter codecs while retaining one transaction across all selected targets.
- [x] 3.5 Add codec and adapter tests for paths, JSON/TOML merge behavior, unrelated-config preservation, malformed input, and missing files.
- [x] 3.6 Add mixed-format transaction tests proving rollback when a later target write fails.

## 4. Command migration

- [x] 4.1 Migrate `skill` target flags and prompts to shared allowed agent selection.
- [x] 4.2 Migrate `combo` target flags and prompts to shared allowed agent selection.
- [x] 4.3 Migrate `mcp` target flags and prompts to shared allowed MCP selection.
- [x] 4.4 Migrate only-one-owned `init` MCP and project-specific agent target handling to capability-aware selectors while preserving ADR 0001 delegation.
- [x] 4.5 Migrate `setting-vs` and `extensions-vs` to shared VS selection and reject VS Code.
- [x] 4.6 Remove obsolete command-local target parsing, choice construction, and validation code.

## 5. Compatibility and documentation

- [x] 5.1 Update command help, examples, error text, and summaries to show only command-specific allowed targets.
- [x] 5.2 Update existing tests that assume the full agent catalog or VS Code is command-selectable while retaining the broad raw catalog where still needed.
- [x] 5.3 Add command-level tests proving unsupported explicit IDs fail before side effects and `--yes` selects every capability-valid target.
- [x] 5.4 Document breaking target removals and TOML semantic-preservation limitation in release-facing documentation.

## 6. Verification

- [x] 6.1 Run focused allowed-target, selection, MCP codec, adapter, transaction, and command tests.
- [x] 6.2 Run `npm test` and fix all regressions.
- [x] 6.3 Run `npm run build` and resolve TypeScript or packaging failures.
- [x] 6.4 Run `openspec validate restrict-supported-agent-tools --type change --strict` and resolve all validation errors.
