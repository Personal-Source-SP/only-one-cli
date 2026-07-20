## MODIFIED Requirements

### Requirement: Init Combo Selection Flow
Rule: The `combo` command SHALL support initializing a project using one or more predefined configuration combos by:
1. Selecting target IDEs.
2. Checking if combo packages, skills, configs, or MCPs already exist.
3. Prompting for verification (pre-selected by default) to overwrite/reinstall existing components.
4. Executing changes and outputting a detailed execution report.

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
