## ADDED Requirements

### Requirement: Reusable config planning
Rule: Config service SHALL classify every selected destination file before copying and SHALL perform no write during planning.

#### Scenario: Plan mixed config state
- **GIVEN** a selected config maps multiple source files to project destinations
- **AND** some destinations already exist
- **WHEN** config planning runs
- **THEN** every destination is represented separately as new or existing
- **AND** no destination is changed

### Requirement: Plan-driven config copy
Rule: Config execution SHALL copy exact confirmed destination items and overwrite existing destinations only when the plan authorizes it.

#### Scenario: Copy confirmed config items
- **GIVEN** a confirmed plan contains new and overwrite config decisions
- **WHEN** config execution runs
- **THEN** new destination files are created
- **AND** existing destinations marked overwrite are replaced
- **AND** no unplanned config destination is touched

#### Scenario: Continue after config copy failure
- **GIVEN** one config destination fails to copy
- **WHEN** independent config items remain
- **THEN** remaining items continue
- **AND** final report identifies failed and successful destinations
