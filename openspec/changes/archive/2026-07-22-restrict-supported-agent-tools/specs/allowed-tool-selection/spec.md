## ADDED Requirements

### Requirement: Fixed allowed target set
The system SHALL limit command-facing IDE and CLI targets to Antigravity, Claude, Cursor, and Codex in stable display order.

Feature: Allowed target selection

Rule: Command-facing IDE and CLI targets SHALL be limited to Antigravity, Claude, Cursor, and Codex in stable display order.

#### Scenario: Display agent-capable targets
- **GIVEN** a command requests targets for agent artifacts
- **WHEN** selectable targets are resolved
- **THEN** Antigravity, Claude, Cursor, and Codex are returned in configured order
- **AND** no target outside that set is returned

### Requirement: Capability-aware target filtering
Rule: A command SHALL offer only allowed targets that support its required capability.

#### Scenario: Resolve VS settings targets
- **GIVEN** VS settings require a VS-compatible target
- **WHEN** targets are resolved for VS settings
- **THEN** only Antigravity and Cursor are returned

#### Scenario: Resolve MCP targets
- **GIVEN** MCP synchronization is requested
- **WHEN** targets are resolved for MCP
- **THEN** Antigravity, Claude, Cursor, and Codex are returned

### Requirement: Shared target selection behavior
Rule: Target-selecting commands SHALL apply the same explicit, automatic, and interactive selection rules.

#### Scenario: Valid explicit CSV selection
- **GIVEN** a command supports Antigravity, Claude, Cursor, and Codex
- **WHEN** the user provides `cursor,claude`
- **THEN** Cursor and Claude are selected without showing a prompt

#### Scenario: Unsupported explicit target
- **GIVEN** a command has a capability-specific set of allowed targets
- **WHEN** the user explicitly provides an ID outside that set
- **THEN** the command stops before side effects
- **AND** reports the invalid ID and valid IDs for that command

#### Scenario: Automatic selection
- **GIVEN** no explicit target is provided
- **AND** automatic selection is enabled
- **WHEN** target selection runs
- **THEN** every target valid for the command capability is selected

#### Scenario: Empty interactive selection
- **GIVEN** no explicit target is provided
- **AND** interactive selection is required
- **WHEN** the user confirms without selecting a target
- **THEN** the selection is rejected with a requirement to choose at least one target
