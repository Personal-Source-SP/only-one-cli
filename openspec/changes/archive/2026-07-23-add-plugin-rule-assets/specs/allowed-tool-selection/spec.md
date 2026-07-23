## ADDED Requirements

### Requirement: Plugin-capable target filtering
Rule: Plugin commands SHALL offer only allowed targets with plugin actions for every selected plugin.

#### Scenario: Resolve Superpowers plugin targets
- **GIVEN** Superpowers plugin installation is requested
- **WHEN** plugin-capable targets are resolved
- **THEN** Antigravity, Claude, Cursor, and Codex are returned in configured order

#### Scenario: Reject unsupported plugin target
- **GIVEN** an explicit target is unsupported by a selected plugin
- **WHEN** plugin target validation runs
- **THEN** the command stops before plugin side effects
- **AND** reports valid plugin target IDs

### Requirement: Rule-capable target filtering
Rule: Rule commands SHALL offer only allowed targets with verified native rule adapters.

#### Scenario: Resolve native rule targets
- **GIVEN** rule installation is requested
- **WHEN** rule-capable targets are resolved
- **THEN** Antigravity, Claude, and Cursor are returned in configured order
- **AND** Codex is excluded

#### Scenario: Reject Codex rule target
- **GIVEN** Codex is explicitly provided for rule installation
- **WHEN** rule target validation runs
- **THEN** the command stops before dependency or rule side effects
- **AND** reports Antigravity, Claude, and Cursor as valid targets
