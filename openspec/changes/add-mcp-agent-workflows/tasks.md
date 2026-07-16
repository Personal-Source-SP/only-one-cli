## 1. Command and Skill Sources

- [x] 1.1 Add IDE-neutral command sources for `pr-git` and `clockify`, including required/default option contracts and adapter naming tests.
- [x] 1.2 Add optimized `ak-pr-git/SKILL.md` with concise workflow, Git preflight, duplicate PR handling, preview, confirmation, and GitHub MCP sequence.
- [x] 1.3 Add `ak-pr-git/references/pr-template.md` with exact English body template and Vietnamese-summary separation rules.
- [x] 1.4 Add optimized `ak-clockify/SKILL.md` with concise parse, allocation, preview, validation, confirmation, replacement, and recovery workflow.
- [x] 1.5 Add `ak-clockify/references/task-format.md` and `validation-rules.md` for task grammar, timezone, weekdays, slots, limits, workspace ambiguity, safe replacement, and restore reporting.
- [x] 1.6 Add skill fixture/snapshot tests proving references install recursively and command output names are `pr-git`/`clockify` without forced `opsx-` prefix.

## 2. MCP Library Registry

- [x] 2.1 Define strict TypeScript MCP manifest, server config, IDE adapter, merge result, and sync response types.
- [x] 2.2 Implement discovery and validation of independent `libraries/mcps/*.json` files with deterministic ordering and warning behavior for invalid files.
- [x] 2.3 Add secret-safe manifests for `github`, `clockify`, `notion`, `postgres`, `tavily`, `fetch`, and `memory`, using empty credential placeholders only.
- [x] 2.4 Add registry tests for valid manifests, malformed JSON, duplicate IDs, invalid config shape, and rejection of non-empty secret values.

## 3. Cursor and Antigravity Global MCP Sync

- [x] 3.1 Implement Cursor and Antigravity MCP adapters with verified global macOS/Windows paths, root schemas, and unsupported-OS errors.
- [x] 3.2 Implement JSON/JSONC read and add-only merge that preserves unrelated fields, unselected servers, and complete existing definitions.
- [x] 3.3 Generalize the existing VS sync transaction primitive for MCP file backup, journal, atomic write, rollback, signal handling, and interrupted-run recovery while preserving existing VS behavior.
- [x] 3.4 Implement multi-IDE MCP sync orchestration and result reporting for added, skipped-already-configured, unchanged, and manual credential keys.
- [ ] 3.5 Add path/schema fixtures and merge tests for Cursor and Antigravity on macOS/Windows, including existing MCP preservation and second-write rollback.

## 4. Init Integration and Dependencies

- [ ] 4.1 Add `init mcp` with interactive IDE/MCP multi-select and non-interactive MCP names, restricted to Cursor and Antigravity adapters.
- [ ] 4.2 Extend main init orchestration with MCP selection after OpenSpec tool setup without duplicating OpenSpec tool selection, honoring ADR 0001.
- [ ] 4.3 Add fixed dependency mapping from `pr-git` to `ak-pr-git`/`github` and from `clockify` to `ak-clockify`/`clockify`, with preselected dependencies and opt-out warning.
- [ ] 4.4 Add final readiness reporting for command, skill, MCP, target global config, and credential placeholders requiring manual edits.
- [ ] 4.5 Add init/subcommand tests for interactive selection, `--yes`, missing libraries, unsupported IDE, existing MCP skip, and no secret prompting/logging.

## 5. Skill Contract Verification

- [ ] 5.1 Add static validation tests for `pr-git` Conventional Commit types, required confirmation, English-only GitHub body, Vietnamese chat summary, clean/pushed branch guardrails, and existing PR update flow.
- [ ] 5.2 Add static validation tests for Clockify required `DD/MM/YYYY` date/project, default positive `tasks-per-day`, task grammar, GMT+7 slots, weekday allocation, and weekend adjustment.
- [ ] 5.3 Add static validation tests proving `--validate` never mutates, log preview requires confirmation, matching scope is workspace/project/date/slot, all entries are billable, and restore failure stops the batch.
- [ ] 5.4 Add tests for exact project matching, similar-name suggestions, interactive workspace disambiguation, and non-interactive ambiguity failure.

## 6. Documentation and Final Validation

- [ ] 6.1 Update root README and `libraries/README.md` with command examples, required options, task format, optimized skill layout, MCP selection, supported IDEs, global scope, add-only semantics, and manual secret setup.
- [ ] 6.2 Run unit/integration tests, `npm run format:check`, and TypeScript build/type checks required by the repository.
- [ ] 6.3 Run `openspec validate add-mcp-agent-workflows --type change --strict` and resolve all validation errors before implementation completion.
- [ ] 6.4 Manually verify generated command/skill paths and MCP global merge against temporary Cursor and Antigravity configs without writing real credentials.
