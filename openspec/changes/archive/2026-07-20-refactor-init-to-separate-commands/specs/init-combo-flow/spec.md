## MODIFIED Requirements

### Requirement: Init Combo Selection Flow
Rule: The `combo` command SHALL support initializing a project using one or more predefined configuration combos by:
1. Selecting target IDEs.
2. Checking if combo packages, skills, configs, or MCPs already exist.
3. Prompting for verification (pre-selected by default) to overwrite/reinstall existing components.
4. Executing changes and outputting a detailed execution report.

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

#### Scenario: Run combo command with existing components and verification
- **GIVEN** combo "idsd-flow" contains package "@fission-ai/openspec", skill "grill-me", and config "openspec"
- **AND** package "@fission-ai/openspec" is already installed
- **AND** skill "grill-me" already exists in Cursor IDE's skill directory
- **WHEN** the user runs `only-one combo` and selects Cursor and "idsd-flow" combo
- **THEN** it displays a verification checkbox prompt listing the existing components: `Package: @fission-ai/openspec` and `Skill: grill-me in Cursor`
- **AND** both checkboxes are ticked by default
- **WHEN** the user unchecks `Package: @fission-ai/openspec` and keeps `Skill: grill-me in Cursor` checked
- **THEN** it skips reinstalling `@fission-ai/openspec` package
- **AND** it overwrites/reinstalls the `grill-me` skill in Cursor
- **AND** it copies/initializes the `openspec` configuration templates
- **AND** it displays a detailed report showing package skipped, skill overwritten, and configs created
