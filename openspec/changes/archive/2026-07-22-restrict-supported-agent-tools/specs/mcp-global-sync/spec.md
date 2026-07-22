## MODIFIED Requirements

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

## ADDED Requirements

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
