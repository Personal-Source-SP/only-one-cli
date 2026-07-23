## MODIFIED Requirements

### Requirement: Command dependency mapping
Rule: Init SHALL derive required skills, workflows, and MCPs from registry metadata for each selected command, including mapping the `only-one-plan` command to `only-one-plan-skill`, `only-one-plan`, and `gitnexus`.

#### Scenario: Select PR agent command
- **GIVEN** user selects `pr-git`
- **WHEN** dependency selections are prepared
- **THEN** `ak-pr-git` and `github` are preselected

#### Scenario: Select planning agent command
- **GIVEN** user selects `only-one-plan`
- **WHEN** dependency selections are prepared
- **THEN** `only-one-plan-skill`, `only-one-plan`, and `gitnexus` are derived from registry relationships
- **AND** GitNexus is preselected for installation

#### Scenario: User opts out of GitNexus
- **GIVEN** `only-one-plan` is selected and GitNexus is preselected
- **WHEN** the user removes GitNexus from the installation selection
- **THEN** init warns that planning will lose preferred code-intelligence context
- **AND** init preserves the user's opt-out decision

### Requirement: Dependency readiness report
Rule: Init SHALL report readiness as command, skill, workflow, MCP, and any required manual credential configuration without treating credential-free MCPs as incomplete.

#### Scenario: Credential remains placeholder
- **GIVEN** a command, skill, workflow, and credential-bearing MCP were installed
- **WHEN** the credential placeholder is empty
- **THEN** the result reports setup incomplete
- **AND** identifies the config file and key requiring manual editing

#### Scenario: GitNexus is installed without credentials
- **GIVEN** `only-one-plan`, its skill and workflow, and GitNexus were installed
- **WHEN** readiness is evaluated
- **THEN** GitNexus is reported ready without a credential requirement
- **AND** the result identifies project indexing as a usage prerequisite rather than a missing secret

## ADDED Requirements

### Requirement: Planning command installation across supported targets
Rule: The installer SHALL generate the `only-one-plan` command and related assets at the correct location for Antigravity, Claude, Cursor, and Codex.

#### Scenario: Install planning command for a project-relative target
- **GIVEN** a supported target resolves commands relative to the project
- **WHEN** `only-one-plan-skill` is installed
- **THEN** the planning command is written under that target's project command directory
- **AND** its final content references the registered planning workflow

#### Scenario: Install planning command for Codex global prompts
- **GIVEN** Codex resolves the planning command to an absolute global prompt path
- **WHEN** `only-one-plan-skill` is installed
- **THEN** the installer preserves the absolute path
- **AND** it does not prefix the path with the project directory

#### Scenario: Install workflow before its required skill
- **GIVEN** `only-one-plan` is selected and `only-one-plan-skill` is absent
- **WHEN** workflow installation resolves required assets
- **THEN** the required skill and command are installed
- **AND** the final command content and path are deterministic regardless of installation order
