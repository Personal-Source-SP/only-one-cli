# agent-workflow-dependencies Specification

## Purpose
TBD - created by archiving change add-mcp-agent-workflows. Update Purpose after archive.
## Requirements
### Requirement: Command dependency mapping
Rule: Init SHALL map `pr-git` to `ak-pr-git` and `github`, and `clockify` to `ak-clockify` and `clockify`.

#### Scenario: Select agent command
- **GIVEN** user selects `pr-git`
- **WHEN** dependency selections are prepared
- **THEN** `ak-pr-git` and `github` are preselected

### Requirement: Dependency readiness report
Rule: Init SHALL report readiness as command, skill, MCP, and manual credential configuration.

#### Scenario: Credential remains placeholder
- **GIVEN** command, skill, and MCP were installed
- **WHEN** credential placeholder is empty
- **THEN** result reports setup incomplete
- **AND** identifies config file and key requiring manual editing

