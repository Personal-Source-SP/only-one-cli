## ADDED Requirements

### Requirement: Format-preserving GitNexus synchronization
Rule: MCP synchronization SHALL preserve the GitNexus launch arguments and read-only policy across every supported target format.

#### Scenario: Synchronize GitNexus to JSON targets
- **GIVEN** Antigravity, Claude, or Cursor is selected
- **WHEN** GitNexus is synchronized
- **THEN** the target MCP server keeps `npx`, all launch arguments, and `GITNEXUS_MCP_READ_ONLY=1`
- **AND** unrelated target configuration remains semantically unchanged

#### Scenario: Synchronize GitNexus to Codex TOML
- **GIVEN** Codex is selected
- **WHEN** GitNexus is synchronized
- **THEN** the `mcp_servers.gitnexus` table keeps `npx`, all launch arguments, and `GITNEXUS_MCP_READ_ONLY=1`
- **AND** unrelated Codex configuration remains semantically unchanged

#### Scenario: Keep existing GitNexus configuration
- **GIVEN** a target already contains a `gitnexus` server
- **WHEN** the user declines its default-selected reconfiguration
- **THEN** the existing GitNexus definition remains unchanged
- **AND** the final summary reports it as skipped
