## ADDED Requirements

### Requirement: GitNexus MCP manifest
Rule: The MCP library registry SHALL define GitNexus as a credential-free local MCP server with a fixed read-only policy.

#### Scenario: Discover GitNexus manifest
- **GIVEN** the packaged MCP library is loaded
- **WHEN** the registry lists available servers
- **THEN** `gitnexus` appears as an independent selection
- **AND** its command, arguments, and read-only environment value pass manifest validation

#### Scenario: Inspect GitNexus environment
- **GIVEN** the GitNexus manifest contains `GITNEXUS_MCP_READ_ONLY=1`
- **WHEN** credential placeholders are reported
- **THEN** the policy value is not reported as a credential requiring manual completion
