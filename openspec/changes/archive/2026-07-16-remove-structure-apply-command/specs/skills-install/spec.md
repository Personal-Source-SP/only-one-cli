## ADDED Requirements

### Requirement: Install only supported structural agent artifacts
The system SHALL install and validate only structural agent artifacts whose backing CLI commands remain supported.

#### Scenario: Install structure generation artifacts
- **GIVEN** a user selects an agent tool for structural skill installation
- **WHEN** `only-one` installs structural agent artifacts
- **THEN** the structure-generation skill and supported generated command are installed
- **AND** no `structure-apply` skill or generated command is installed

#### Scenario: Validate existing structure generation artifacts
- **GIVEN** structure-generation artifacts exist for configured agent tools
- **WHEN** `only-one` checks structural skill presence
- **THEN** the check succeeds without requiring any `structure-apply` artifact

## REMOVED Requirements

### Requirement: Install structure apply agent artifacts
**Reason**: The `only-one structure-apply` CLI command and its workflow are no longer supported.

**Migration**: Use `only-one structure-generate` for the retained structural workflow. Existing externally installed apply artifacts may be removed manually.
