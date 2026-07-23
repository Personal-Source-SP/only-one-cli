## ADDED Requirements

### Requirement: Select plugins and targets
Rule: The `only-one plugin` command SHALL select plugins by stable ID and targets through shared explicit, automatic, and interactive target-selection behavior.

#### Scenario: Select Superpowers explicitly
- **GIVEN** `superpowers` is a valid plugin ID
- **WHEN** the user provides `superpowers` and valid target IDs
- **THEN** plugin and target prompts are skipped
- **AND** the declared action is prepared for every selected target

#### Scenario: Reject unsupported plugin target
- **GIVEN** a target is not supported by a selected plugin
- **WHEN** plugin target validation runs
- **THEN** the command stops before executing any plugin action
- **AND** reports valid target IDs for that plugin

### Requirement: Execute plugin target actions
Rule: Plugin installation SHALL execute command actions, render manual actions, and report installed, action-required, skipped, or failed per target.

#### Scenario: Install Superpowers for Antigravity
- **GIVEN** Superpowers and Antigravity are selected
- **WHEN** plugin installation runs
- **THEN** `agy plugin install https://github.com/obra/superpowers` executes
- **AND** Antigravity is reported installed only after successful command completion

#### Scenario: Guide manual Superpowers installation
- **GIVEN** Superpowers and any of Claude, Cursor, or Codex are selected
- **WHEN** plugin installation runs
- **THEN** exact official host installation guidance is displayed
- **AND** each manual target is reported action-required rather than installed

#### Scenario: Preserve results after one target fails
- **GIVEN** multiple plugin targets are selected
- **AND** one automatic action fails
- **WHEN** plugin installation completes
- **THEN** the failing target is reported failed
- **AND** manual guidance and successful outcomes for other targets remain visible
