# mcp-global-sync Specification

## Purpose
TBD - created by archiving change add-mcp-agent-workflows. Update Purpose after archive.
## Requirements
### Requirement: Supported global IDE targets
Rule: MCP sync SHALL target only verified global configuration paths for Antigravity, Claude, Cursor, and Codex using OS-specific adapters.

#### Scenario: Supported IDE selected
- **GIVEN** Antigravity, Claude, Cursor, or Codex is selected
- **WHEN** MCP sync resolves the target configuration
- **THEN** it uses the verified global path and MCP container for that target

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

### Requirement: Format-aware MCP configuration
Rule: MCP sync SHALL read and write each target's verified configuration format while preserving unrelated configuration values.

#### Scenario: Sync Claude JSON configuration
- **GIVEN** Claude is selected and `~/.claude.json` contains state outside `mcpServers`
- **WHEN** MCP servers are synchronized
- **THEN** the selected servers are merged under `mcpServers`
- **AND** unrelated Claude configuration values remain semantically unchanged

#### Scenario: Sync Codex TOML configuration
- **GIVEN** Codex is selected and `~/.codex/config.toml` contains sections outside `mcp_servers`
- **WHEN** MCP servers are synchronized
- **THEN** the selected servers are merged under `mcp_servers`
- **AND** unrelated Codex configuration values remain semantically unchanged

#### Scenario: Existing configuration is malformed
- **GIVEN** a selected target configuration cannot be parsed in its required format
- **WHEN** MCP sync validates the selected targets
- **THEN** the command stops before any target write
- **AND** reports the malformed configuration path

