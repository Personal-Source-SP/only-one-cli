## MODIFIED Requirements

### Requirement: Selective add-only merge
Rule: The sync SHALL check if selected MCP servers already exist in the target IDE's `mcp.json` config. If they do not exist, they are added. If they already exist, they require user verification before being overwritten or reconfigured.

#### Scenario: MCP already configured with user verification
- **GIVEN** target config already contains selected server ID `github`
- **WHEN** the check runs
- **THEN** it displays a verification checkbox prompt listing the existing MCP configurations to reconfigure
- **AND** the choice for `github` is ticked by default
- **WHEN** the user unchecks `github` and proceeds
- **THEN** the existing definition of `github` is kept unchanged
- **AND** the final summary report shows `github` as skipped
