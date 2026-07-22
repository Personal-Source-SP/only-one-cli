## ADDED Requirements

### Requirement: Select supported skill installation targets
Rule: Skill installation SHALL select targets only from Antigravity, Claude, Cursor, and Codex through the shared target-selection behavior.

#### Scenario: Display skill installation targets
- **GIVEN** interactive skill installation is requested
- **WHEN** the target prompt is displayed
- **THEN** it lists Antigravity, Claude, Cursor, and Codex
- **AND** it lists no other agent tool

#### Scenario: Unsupported skill target provided
- **GIVEN** an explicit skill target is outside the allowed set
- **WHEN** skill installation validates the target
- **THEN** installation stops before copying any artifact
- **AND** reports the allowed target IDs
