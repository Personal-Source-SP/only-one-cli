## MODIFIED Requirements

### Requirement: Skill Existence Check
The CLI SHALL check whether selected skill destinations already exist and SHALL require interactive verification before overwriting them.

#### Scenario: Verify existing skill interactively
- **GIVEN** `.cursor/skills/grill-me/` already exists
- **AND** Cursor and `grill-me` are selected
- **AND** interactive verification is available
- **WHEN** existing skills are checked
- **THEN** a verification prompt lists `grill-me in Cursor` selected by default
- **WHEN** the user deselects that item
- **THEN** the existing skill is skipped
- **AND** the skipped item appears in the final report

#### Scenario: Overwrite confirmed skill
- **GIVEN** an existing skill is selected in interactive verification
- **WHEN** skill synchronization runs
- **THEN** the skill destination is overwritten
- **AND** the result reports overwritten status

#### Scenario: Skip existing skill non-interactively
- **GIVEN** a selected skill destination already exists
- **AND** interactive verification is unavailable
- **WHEN** an explicit skill plan executes
- **THEN** the existing skill is skipped
- **AND** new skill destinations continue installing
- **AND** skipped outcomes appear in the final report
