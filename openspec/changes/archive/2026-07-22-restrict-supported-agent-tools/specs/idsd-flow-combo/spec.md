## ADDED Requirements

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
