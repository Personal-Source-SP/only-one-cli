## MODIFIED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: The CLI SHALL support component-specific init subcommands and SHALL allow the package subcommand to select agent targets when a selected package uses a target-plugin installer.

#### Scenario: Run package subcommand with explicit package and targets
- **GIVEN** the user runs the package subcommand with package ID `superpowers` and explicit supported targets
- **WHEN** the command executes
- **THEN** it skips interactive package and target selection
- **AND** executes or reports the Superpowers action declared for each selected target

#### Scenario: Run package subcommand interactively for Superpowers
- **GIVEN** the user selects Superpowers without explicit targets
- **AND** automatic target selection is not enabled
- **WHEN** the package command prepares installation
- **THEN** it displays the shared supported-target selection prompt
- **AND** requires at least one target

#### Scenario: Install npm-only packages without target selection
- **GIVEN** every selected package uses the npm installer
- **WHEN** the package subcommand executes without explicit targets
- **THEN** it does not display an agent target prompt
- **AND** preserves existing npm installation behavior
