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

