# ui-ux-pro-max-skill Specification

## Purpose
TBD - created by archiving change add-ui-ux-pro-max-skill. Update Purpose after archive.
## Requirements
### Requirement: UI/UX Pro Max Skill Availability
The CLI libraries SHALL include a custom skill named `ui-ux-pro-max` that is dynamically discovered and installable.

#### Scenario: Listing available custom skills
- **GIVEN** `libraries/skills/` contains the `ui-ux-pro-max` directory
- **WHEN** the `skill` command is executed
- **THEN** `ui-ux-pro-max` is displayed as an available skill option

#### Scenario: Copying ui-ux-pro-max skill to target IDE
- **GIVEN** `libraries/skills/` contains `ui-ux-pro-max` with `SKILL.md` and subdirectories `data/`, `references/`, and `scripts/`
- **AND** the user selects "Claude Code" (skillsDir: `.claude`) and the "ui-ux-pro-max" skill
- **WHEN** the skill installation executes
- **THEN** the entire directory `libraries/skills/ui-ux-pro-max/` is copied to `.claude/skills/ui-ux-pro-max/` recursively

