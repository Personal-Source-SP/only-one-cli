## ADDED Requirements

### Requirement: Minimize context before planning or modification
Rule: The `context-minimization` agent rule SHALL require dependency-aware code discovery before any plan or modification.

#### Scenario: Discover code for a planned change
- **GIVEN** an agent is about to create a plan or modify project files
- **WHEN** it begins code discovery
- **THEN** it does not recursively scan the entire codebase with grep or find
- **AND** it uses GitNexus CLI or tool capabilities to map exact symbol dependencies and identify a minimal file list

#### Scenario: Ground business behavior in OpenSpec
- **GIVEN** an agent is preparing a plan or modification
- **WHEN** business behavior is needed
- **THEN** it references the relevant feature specification under `openspec/`
- **AND** it does not infer the contract solely from broad codebase search results

#### Scenario: Load minimal implementation context
- **GIVEN** a task requires modifying a file
- **WHEN** the agent loads implementation context
- **THEN** it loads only that file, its direct tests, and dependency files identified as necessary by GitNexus

### Requirement: Context-minimization dependencies
Rule: Installing `context-minimization` SHALL require OpenSpec package, Superpowers plugin, and GitNexus MCP readiness for each selected target.

#### Scenario: Resolve rule dependency declarations
- **GIVEN** the `context-minimization` manifest is loaded
- **WHEN** its dependencies are inspected
- **THEN** required packages contain `@fission-ai/openspec`
- **AND** required plugins contain `superpowers`
- **AND** required MCPs contain `gitnexus`
