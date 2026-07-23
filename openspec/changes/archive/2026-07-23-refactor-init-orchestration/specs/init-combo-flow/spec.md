## MODIFIED Requirements

### Requirement: Combo Selection
Rule: Init combo mode SHALL select exactly one combo and expand it into the shared aggregate component plan.

#### Scenario: Select one combo
- **GIVEN** the user chose Combo setup
- **WHEN** available combos are displayed
- **THEN** the user can select exactly one combo
- **AND** the selected combo ID is retained in the init summary

#### Scenario: Reject empty combo selection
- **GIVEN** Combo setup is active
- **WHEN** the user confirms without choosing a combo
- **THEN** init requires one combo before continuing

### Requirement: Combo Expansion
Rule: A selected combo SHALL contribute component selections and dependencies to the same category planners used by Custom setup.

#### Scenario: Expand combo components
- **GIVEN** a combo declares packages, configs, skills, or other supported components
- **WHEN** init builds the combo plan
- **THEN** each declared component is sent to its category planner
- **AND** existence and destination state use the same rules as Custom setup

#### Scenario: Deduplicate combo dependency
- **GIVEN** multiple combo components require the same dependency
- **WHEN** dependencies are expanded
- **THEN** one auto-required planned item is created
- **AND** all dependency reasons remain visible

### Requirement: Combo Summary and Confirmation
Rule: Combo setup SHALL use the common grouped summary and single final confirmation rather than executing through an independent combo installer flow.

#### Scenario: Review combo plan
- **GIVEN** combo expansion and state checks are complete
- **WHEN** summary is displayed
- **THEN** combo components appear under their component categories
- **AND** auto-required dependencies are distinguished
- **AND** new and existing state is shown where supported

#### Scenario: Confirm combo plan
- **GIVEN** the combo summary is displayed
- **WHEN** the user confirms
- **THEN** shared category executors run the frozen plan
- **AND** no independent combo execution path performs duplicate checks or writes
