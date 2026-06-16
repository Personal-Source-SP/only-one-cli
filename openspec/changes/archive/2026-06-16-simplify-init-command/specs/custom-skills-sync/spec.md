## ADDED Requirements

### Requirement: custom skills copied to selected tool directories
Feature: custom-skills-sync
Rule: After openspec init completes, project-specific skills from .agents/skills/ must be installed per selected tool
The init command SHALL copy `.agents/skills/` contents to each selected tool's skill directory after openspec init completes.

#### Scenario: copy skills for each selected tool
- **GIVEN** openspec init completed successfully
- **WHEN** selected tools list is read from `.openspec.yaml`
- **THEN** for each tool, copy `.agents/skills/<name>/SKILL.md` to `<tool.skillsDir>/skills/<name>/SKILL.md`
- **AND** create intermediate directories as needed

#### Scenario: no tools selected
- **GIVEN** openspec init completed with no tools selected
- **WHEN** agent_tools list is empty
- **THEN** skip custom skills sync
- **AND** display message "No tools selected, skipping custom skills installation"

#### Scenario: tool has no skillsDir mapping
- **GIVEN** selected tool is in agent_tools list
- **WHEN** tool has no `skillsDir` in catalog
- **THEN** skip that tool with a warning
- **AND** continue with remaining tools

### Requirement: openspec config parsing
The init command SHALL parse `.openspec.yaml` to read the `agent_tools` list after openspec init completes.

#### Scenario: read agent_tools from openspec config
- **GIVEN** openspec init ran successfully
- **WHEN** reading `.openspec.yaml`
- **THEN** parse `agent_tools` field to get selected tool list
- **AND** handle missing or malformed config gracefully

#### Scenario: openspec config not found
- **GIVEN** openspec init ran successfully
- **WHEN** `.openspec.yaml` does not exist
- **THEN** display warning about missing config
- **AND** attempt to detect tools from existing directories
