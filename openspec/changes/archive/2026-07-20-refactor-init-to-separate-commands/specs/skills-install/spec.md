## MODIFIED Requirements

### Requirement: Select Skills
The CLI SHALL allow the user to pick skills from `libraries/skills/` subdirectories via a multi-select prompt, defaulting to selecting all skills.

#### Scenario: Display all available skills
- **GIVEN** `libraries/skills/` contains `grill-me/`, `c4-diagrams/`, `gherkin-authoring/`
- **WHEN** the init command reaches the skills step
- **THEN** each skill directory name is displayed as a selectable option

#### Scenario: Select multiple skills
- **GIVEN** 3 skills displayed
- **WHEN** the user selects "grill-me" and "c4-diagrams"
- **THEN** those two skills are queued for copy to each selected tool

#### Scenario: No skills available
- **GIVEN** `libraries/skills/` is empty or missing
- **WHEN** the init command reaches the skills step
- **THEN** it prints "No skills available" and completes the init flow

#### Scenario: Skip skills step
- **GIVEN** `--skip skills` flag is passed
- **WHEN** the init command runs
- **THEN** the skills step is skipped entirely

### Requirement: Skill Existence Check
The CLI SHALL check if the target skill directory already exists in the selected IDE's skills dir before copying, and require a verification confirmation checklist to overwrite them.

#### Scenario: Skill already exists in tool dir
- **GIVEN** `.cursor/skills/grill-me/` already exists
- **AND** the user selected "Cursor" IDE and "grill-me" skill
- **WHEN** the checks run
- **THEN** it displays a verification checkbox prompt listing the existing skills to overwrite
- **AND** the checkbox choice for `grill-me in Cursor` is ticked by default
- **WHEN** the user unchecks `grill-me in Cursor` and proceeds
- **THEN** the copy/overwrite of `grill-me` in `.cursor` is skipped
- **AND** the skipped item is logged in the final summary report

#### Scenario: --yes auto-overwrites
- **GIVEN** `--yes` flag is passed
- **WHEN** a skill already exists in a tool dir
- **THEN** no verification confirmation prompt is shown
- **AND** the skill is overwritten
