## ADDED Requirements

### Requirement: Init Subcommands CLI Interface
Rule: The CLI SHALL support individual subcommands under `init` to initialize components independently: `init package`, `init skill`, `init configs`, and `init combo`.

#### Scenario: Run init package subcommand with arguments
- **GIVEN** the user runs `only-one init package typescript,prettier`
- **WHEN** the command executes
- **THEN** it skips the interactive package selection prompt
- **AND** it directly installs `typescript` and `prettier` packages in the target project
- **AND** it appends corresponding tool config directories to `.gitignore`

#### Scenario: Run init skill subcommand in interactive mode
- **GIVEN** the user runs `only-one init skill`
- **WHEN** no skill names are passed as arguments
- **THEN** it displays an interactive multi-select list of available skills to install
- **WHEN** the user selects a skill
- **THEN** it syncs the selected skill and updates `.gitignore` unless `--no-ignore` is passed

## MODIFIED Requirements

## REMOVED Requirements
