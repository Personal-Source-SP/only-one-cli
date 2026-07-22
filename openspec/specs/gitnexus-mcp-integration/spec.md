# gitnexus-mcp-integration Specification

## Purpose
TBD - created by archiving change integrate-gitnexus-code-intelligence. Update Purpose after archive.
## Requirements
### Requirement: Selectable GitNexus MCP
Rule: GitNexus SHALL be selectable through the existing MCP command and launch through the upstream npm package.

#### Scenario: Select GitNexus by ID
- **GIVEN** the MCP registry includes GitNexus
- **WHEN** the user runs `only-one mcp gitnexus` for supported targets
- **THEN** each selected target receives a server named `gitnexus`
- **AND** the server launches `npx -y gitnexus@latest mcp`

### Requirement: Planning-safe default policy
Rule: The generated GitNexus MCP configuration SHALL enable upstream read-only mode by default.

#### Scenario: Synchronize planning configuration
- **GIVEN** GitNexus is selected for MCP synchronization
- **WHEN** the target configuration is generated
- **THEN** `GITNEXUS_MCP_READ_ONLY` is set to `1`
- **AND** GitNexus exposes its read-only single-repository tool surface when launched

### Requirement: Local index prerequisite documentation
Rule: User guidance SHALL explain that GitNexus needs a local repository index before agents can retrieve code intelligence.

#### Scenario: Developer follows GitNexus setup guidance
- **GIVEN** a developer wants code-planning context from GitNexus
- **WHEN** the developer reads the MCP usage documentation
- **THEN** the documentation shows how to index the repository before using MCP tools
- **AND** it identifies read-only mode as the default synchronized policy

