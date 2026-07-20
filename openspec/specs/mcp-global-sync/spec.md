# mcp-global-sync Specification

## Purpose
TBD - created by archiving change add-mcp-agent-workflows. Update Purpose after archive.
## Requirements
### Requirement: Supported global IDE targets
Rule: MCP sync SHALL target only global Cursor and Antigravity config paths using OS-specific adapters.

#### Scenario: Unsupported IDE selected
- **GIVEN** an IDE without a verified MCP adapter
- **WHEN** MCP sync is requested
- **THEN** it reports unsupported and writes no guessed path

### Requirement: Selective add-only merge
Rule: The sync SHALL check if selected MCP servers already exist in the target IDE's `mcp.json` config. If they do not exist, they are added. If they already exist, they require user verification before being overwritten or reconfigured.

#### Scenario: MCP already configured
- **GIVEN** target config already contains selected server ID `github`
- **WHEN** the check runs
- **THEN** it displays a verification checkbox prompt listing the existing MCP configurations to reconfigure
- **AND** the choice for `github` is ticked by default
- **WHEN** the user unchecks `github` and proceeds
- **THEN** the existing definition of `github` is kept unchanged
- **AND** the final summary report shows `github` as skipped

### Requirement: Transactional global writes
Rule: Multi-IDE MCP writes SHALL use durable backup, journal, atomic write, rollback, and interrupted-run recovery.

#### Scenario: Second IDE write fails
- **GIVEN** first global config was updated and second write fails
- **WHEN** transaction handles failure
- **THEN** first config is restored
- **AND** command reports failure without completion

### Requirement: Manual credential completion
Rule: Newly added MCP definitions SHALL retain empty credential placeholders for manual user editing.

#### Scenario: New MCP added
- **GIVEN** selected MCP is absent
- **WHEN** sync commits
- **THEN** summary shows target file and credential keys requiring manual editing
- **AND** never prompts for or logs credential values

