## MODIFIED Requirements

### Requirement: Select Skills
The CLI SHALL allow the user to pick skills from `libraries/skills/` subdirectories via a multi-select prompt, defaulting to selecting all skills.

#### Scenario: Display and select all skills
- **GIVEN** `libraries/skills/` contains `grill-me/`, `c4-diagrams/`
- **WHEN** the skill selection prompt is displayed
- **THEN** all available skills are ticked by default
- **WHEN** the user proceeds
- **THEN** those skills are queued for installation to each selected IDE/tool

### Requirement: Skill Existence Check
The CLI SHALL check if the target skill directory already exists in the selected IDE's skills dir before copying, and require a verification confirmation checklist to overwrite them.

#### Scenario: Skill already exists in tool dir with user verification
- **GIVEN** `.cursor/skills/grill-me/` already exists
- **AND** the user selected "Cursor" IDE and "grill-me" skill
- **WHEN** the checks run
- **THEN** it displays a verification checkbox prompt listing the existing skills to overwrite
- **AND** the checkbox choice for `grill-me in Cursor` is ticked by default
- **WHEN** the user unchecks `grill-me in Cursor` and proceeds
- **THEN** the copy/overwrite of `grill-me` in `.cursor` is skipped
- **AND** the skipped item is logged in the final summary report

#### Scenario: --yes auto-overwrites existing skills
- **GIVEN** `--yes` flag is passed
- **WHEN** a skill already exists in a tool dir
- **THEN** no verification confirmation prompt is shown
- **AND** the skill is overwritten automatically
