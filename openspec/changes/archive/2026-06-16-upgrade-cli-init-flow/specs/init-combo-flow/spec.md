## ADDED Requirements

## MODIFIED Requirements

### Requirement: Init Combo Selection Flow
Rule: The `init` command SHALL support initializing a project using one or more predefined configuration combos, auto-updating `.gitignore` unless disabled.

#### Scenario: Run init command with multiple combos directly
- **GIVEN** a combo named "dev" exists in `libraries/combos/dev.yaml` with skill "grill-me"
- **AND** a combo named "qa" exists in `libraries/combos/qa.yaml` with skill "grill-me" and package "jest"
- **WHEN** the user runs `only-one init --combo dev,qa`
- **THEN** it skips the interactive prompts for combo/custom choice, packages, and skills
- **AND** it runs the Tool selection prompt (Step 1)
- **AND** it automatically merges and deduplicates packages ("jest") and skills ("grill-me") from both combos
- **AND** it displays the pre-execution summary showing the merged contents and gitignore update details
- **AND** it updates `.gitignore` unless `--no-ignore` is passed

#### Scenario: Multi-select combos in interactive mode
- **GIVEN** multiple combos exist in `libraries/combos/`
- **WHEN** the user runs `only-one init`
- **THEN** it displays a prompt: "Choose setup method:" with options "Combo (recommended)" and "Custom"
- **WHEN** the user selects "Combo"
- **THEN** it displays a multi-select list of available combos loaded from `libraries/combos/*.yaml`
- **WHEN** the user selects "dev" and "qa" combos
- **THEN** it proceeds to the tools configuration step (Step 1)
- **AND** it skips the packages (Step 2) and skills (Step 3) selection steps, automatically merging and deduplicating packages and skills defined in "dev" and "qa" combos
- **AND** it updates `.gitignore` for all generated tool/skills directories

#### Scenario: Handle invalid or missing combo option
- **GIVEN** the user runs `only-one init --combo non-existent`
- **WHEN** the command validates the combo names
- **THEN** it exits with an error: "Combo 'non-existent' not found in libraries/combos"

## REMOVED Requirements
