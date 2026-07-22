# idsd-flow-combo Specification

## Purpose
TBD - created by archiving change upgrade-default-combo. Update Purpose after archive.
## Requirements
### Requirement: Define Predefined idsd-flow Combo
The system SHALL provide a predefined combo configuration named `idsd-flow` containing OpenSpec CLI package, standard development skills, and default configuration.

#### Scenario: Read idsd-flow combo manifest file
- **GIVEN** a combo manifest file exists at `libraries/combos/idsd-flow.yaml`
- **WHEN** the list of available combos is loaded
- **THEN** the `idsd-flow` combo is identified by its ID `idsd-flow`
- **AND** it is configured with package `@fission-ai/openspec`
- **AND** it includes skills `architectural-decision-records`, `c4-diagrams`, `gherkin-authoring`, and `grill-me`

### Requirement: Select supported combo installation targets
Rule: Combo installation SHALL select target tools only from Antigravity, Claude, Cursor, and Codex through the shared target-selection behavior.

#### Scenario: Display combo targets
- **GIVEN** an available combo is selected for installation
- **WHEN** the command requests target tools interactively
- **THEN** it lists Antigravity, Claude, Cursor, and Codex
- **AND** it lists no target outside the allowed set

#### Scenario: Unsupported combo target provided
- **GIVEN** a target outside the allowed set is provided explicitly
- **WHEN** combo installation validates targets
- **THEN** it stops before installing combo artifacts
- **AND** reports the allowed target IDs

