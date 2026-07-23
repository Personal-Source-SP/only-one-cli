## MODIFIED Requirements

### Requirement: Shared target selection behavior
Rule: Target-selecting commands SHALL use explicit target IDs when provided and otherwise require interactive agent selection; missing prompt support SHALL never imply automatic target selection.

#### Scenario: Valid explicit CSV selection
- **GIVEN** a command supports Antigravity, Claude, Cursor, and Codex
- **WHEN** the user provides `cursor,claude`
- **THEN** Cursor and Claude are selected without showing a target prompt

#### Scenario: Explicit all selection
- **GIVEN** a command supports multiple targets
- **WHEN** the user explicitly provides `all`
- **THEN** every target valid for that command capability is selected

#### Scenario: Unsupported explicit target
- **GIVEN** a command has a capability-specific set of allowed targets
- **WHEN** the user explicitly provides an ID outside that set
- **THEN** the command stops before side effects
- **AND** reports the invalid ID and valid IDs for that command

#### Scenario: Interactive target selection defaults compatible agents
- **GIVEN** no explicit target is provided
- **AND** interactive selection is available
- **WHEN** target selection runs
- **THEN** every target valid for the command capability is selected by default
- **AND** the user may deselect targets before confirmation

#### Scenario: Empty interactive selection
- **GIVEN** no explicit target is provided
- **AND** interactive selection is available
- **WHEN** the user confirms without selecting a target
- **THEN** the selection is rejected with a requirement to choose at least one target

#### Scenario: Missing target in non-interactive mode
- **GIVEN** no explicit target is provided
- **AND** interactive selection is unavailable
- **WHEN** target selection runs
- **THEN** the command fails before side effects
- **AND** reports the target option and valid IDs required for automation
