# mcp-library-registry Specification

## Purpose
TBD - created by archiving change add-mcp-agent-workflows. Update Purpose after archive.
## Requirements
### Requirement: Per-server MCP manifests
Rule: Each installable MCP SHALL be defined by one JSON file in `libraries/mcps/`, identified by filename and containing a valid server definition.

#### Scenario: Discover manifests
- **GIVEN** `github.json` and `clockify.json` are valid
- **WHEN** registry scans MCP libraries
- **THEN** both servers appear as independent selections

### Requirement: Secret-safe manifests
Rule: Secret keys SHALL be represented by empty placeholders and SHALL never contain repository credentials.

#### Scenario: Validate secret placeholder
- **GIVEN** a manifest declares an MCP credential
- **WHEN** registry validates it
- **THEN** credential key is retained with empty value
- **AND** no secret value is printed

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

