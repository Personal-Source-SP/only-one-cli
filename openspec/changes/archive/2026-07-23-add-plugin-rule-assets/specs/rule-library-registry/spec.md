## ADDED Requirements

### Requirement: Typed rule registry
Rule: The system SHALL define persistent agent rules in `assets/rules` with stable IDs, Markdown sources, supported targets, and optional cross-domain dependencies.

#### Scenario: Resolve rule manifest
- **GIVEN** a rule exists in the typed registry
- **WHEN** rule selection loads available rules
- **THEN** the rule exposes its stable ID, description, Markdown source, supported targets, and dependency declarations

#### Scenario: Declare all supported dependency domains
- **GIVEN** a rule requires supporting assets
- **WHEN** its manifest is authored
- **THEN** it may declare required package, plugin, MCP, and skill IDs
- **AND** each referenced ID must resolve in its corresponding registry

#### Scenario: Reject invalid rule dependency
- **GIVEN** a rule references an unknown package, plugin, MCP, or skill ID
- **WHEN** registry validation runs
- **THEN** validation fails before any dependency or rule installation action

### Requirement: Native rule target mapping
Rule: Rule installation SHALL use verified native project rule paths and SHALL not offer targets without a dedicated rule adapter.

#### Scenario: Resolve native rule destinations
- **GIVEN** a plain Markdown rule is selected
- **WHEN** destinations are generated
- **THEN** Antigravity maps to `.agents/rules/`
- **AND** Claude maps to `.claude/rules/`
- **AND** Cursor maps to `.cursor/rules/`

#### Scenario: Exclude Codex rule target
- **GIVEN** Codex uses hierarchical `AGENTS.md` instructions rather than a native rules folder
- **WHEN** rule-capable targets are resolved
- **THEN** Codex is not returned
