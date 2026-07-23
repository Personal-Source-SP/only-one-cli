## ADDED Requirements

### Requirement: Target-aware package selection
Rule: A target-plugin package SHALL reuse shared explicit, automatic, and interactive target-selection behavior and SHALL expose only targets supported by that package.

#### Scenario: Resolve Superpowers targets
- **GIVEN** Superpowers requires agent target selection
- **WHEN** valid targets are resolved
- **THEN** Antigravity, Claude, Cursor, and Codex are returned in configured order

#### Scenario: Select explicit Superpowers targets
- **GIVEN** the user provides a valid explicit target list for Superpowers
- **WHEN** package installation prepares target actions
- **THEN** those targets are selected without an interactive target prompt

#### Scenario: Reject unsupported package target
- **GIVEN** the user provides a target outside the Superpowers supported target set
- **WHEN** package target validation runs
- **THEN** installation stops before any package or plugin action
- **AND** reports the valid target IDs

#### Scenario: Automatically select Superpowers targets
- **GIVEN** no explicit target is provided
- **AND** automatic target selection is enabled
- **WHEN** Superpowers installation prepares target actions
- **THEN** all supported Superpowers targets are selected
