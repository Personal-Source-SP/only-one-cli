## ADDED Requirements

### Requirement: Typed plugin registry
Rule: The system SHALL define agent plugins in `assets/plugins` with stable IDs, supported targets, and one installation action per supported target.

#### Scenario: Resolve plugin manifest
- **GIVEN** the plugin registry contains a plugin entry
- **WHEN** plugin selection loads available plugins
- **THEN** the entry exposes its stable ID, description, supported target IDs, and target actions

#### Scenario: Reject incomplete plugin target mapping
- **GIVEN** a plugin declares a supported target without an installation action
- **WHEN** registry validation runs
- **THEN** validation fails before any plugin action executes

### Requirement: Superpowers plugin manifest
Rule: Superpowers SHALL exist only in the plugin registry and SHALL preserve official installation behavior for every supported agent target.

#### Scenario: Resolve Superpowers target actions
- **GIVEN** the plugin registry contains `superpowers`
- **WHEN** its manifest is inspected
- **THEN** Antigravity has command action `agy plugin install https://github.com/obra/superpowers`
- **AND** Claude, Cursor, and Codex have official manual installation actions

#### Scenario: Exclude Superpowers from package registry
- **GIVEN** package and plugin registries are loaded
- **WHEN** registry identities are compared
- **THEN** `superpowers` exists in plugin registry
- **AND** no package manifest or npm identity exists for `superpowers`
