# skills-install Specification

## Purpose
TBD - created by archiving change improve-init-flow. Update Purpose after archive.
## Requirements
### Requirement: Select Skills
SHALL allow user to pick skills from `libraries/skills/` subdirectories via multi-select prompt.

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

### Requirement: Copy Selected Skills to Tools
SHALL copy each selected skill's directory into each selected tool's `skillsDir/skills/<skill-name>/`.

#### Scenario: Copy single skill to one tool
- **GIVEN** user selected "Cursor" (skillsDir: `.cursor`) and "grill-me" skill
- **WHEN** the copy phase executes
- **THEN** `libraries/skills/grill-me/` is copied to `.cursor/skills/grill-me/`

#### Scenario: Copy single skill to multiple tools
- **GIVEN** user selected "Cursor" (`.cursor`) and "Claude Code" (`.claude`)
- **AND** "grill-me" skill is selected
- **WHEN** the copy phase executes
- **THEN** `libraries/skills/grill-me/` is copied to both `.cursor/skills/grill-me/` and `.claude/skills/grill-me/`

#### Scenario: Copy multiple skills to multiple tools
- **GIVEN** 2 tools and 2 skills selected
- **WHEN** the copy phase executes
- **THEN** each skill is copied to each tool's skills directory (2 × 2 = 4 copies)

#### Scenario: Tool skills dir does not exist yet
- **GIVEN** `.cursor/` directory exists but `.cursor/skills/` does not
- **WHEN** the copy phase runs for "Cursor"
- **THEN** `.cursor/skills/` is created before copying

### Requirement: Skill Existence Check
SHALL check if the target skill directory already exists in the tool's skills dir before copying.

#### Scenario: Skill already exists in tool dir
- **GIVEN** `.cursor/skills/grill-me/` already exists
- **WHEN** user selected "Cursor" and "grill-me" skill
- **THEN** a confirmation asks: "grill-me already exists in Cursor. Overwrite?"
- **WHEN** user confirms
- **THEN** the skill is overwritten via recursive copy
- **WHEN** user declines
- **THEN** the skill is skipped for that tool

#### Scenario: --yes auto-overwrites
- **GIVEN** `--yes` flag is passed
- **WHEN** a skill already exists in a tool dir
- **THEN** no confirmation prompt is shown
- **AND** the skill is overwritten

