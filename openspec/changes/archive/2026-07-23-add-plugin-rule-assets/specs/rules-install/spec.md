## ADDED Requirements

### Requirement: Select and install rules
Rule: The `only-one rule` command SHALL select rules and native rule targets through shared explicit, automatic, and interactive selection behavior.

#### Scenario: Install rule to selected native targets
- **GIVEN** a rule and one or more supported targets are selected
- **WHEN** rule installation runs
- **THEN** the Markdown rule is copied to each target's native rule destination
- **AND** each target receives a separate installation result

#### Scenario: Reject explicit unsupported rule target
- **GIVEN** the user explicitly selects Codex for rule installation
- **WHEN** target validation runs
- **THEN** installation stops before dependency or rule side effects
- **AND** reports Antigravity, Claude, and Cursor as valid rule targets

#### Scenario: Protect existing rule file
- **GIVEN** the destination rule file already exists
- **WHEN** rule installation prepares writes
- **THEN** the existing-file verification behavior is applied
- **AND** skipped or overwritten outcomes appear in the final report

### Requirement: Automatically queue rule dependencies
Rule: Before copying a rule, the system SHALL validate and deduplicate its required packages, plugins, MCPs, and skills, then execute missing dependencies in deterministic domain order.

#### Scenario: Queue dependencies for context-minimization
- **GIVEN** `context-minimization` is selected
- **AND** OpenSpec, Superpowers, or GitNexus is missing from the installation plan
- **WHEN** rule dependencies are prepared
- **THEN** package `@fission-ai/openspec`, plugin `superpowers`, and MCP `gitnexus` are queued once
- **AND** dependency actions run before the rule file is copied

#### Scenario: Deduplicate shared dependencies
- **GIVEN** multiple selected rules require the same dependency
- **WHEN** the dependency plan is built
- **THEN** the dependency is queued once per applicable target and domain

#### Scenario: Automatic dependency fails
- **GIVEN** an automatic package, plugin, MCP, or skill dependency fails for a target
- **WHEN** rule installation reaches that target
- **THEN** the dependent rule is not copied for that target
- **AND** the rule result identifies the failed dependency

#### Scenario: Manual plugin dependency remains pending
- **GIVEN** a rule requires a plugin whose target action is manual
- **WHEN** dependency and rule installation run
- **THEN** the manual plugin guidance is displayed
- **AND** the rule file is copied
- **AND** the rule is reported installed but not ready with action-required status

### Requirement: Preflight dependency and target validation
Rule: The system SHALL validate the complete rule dependency graph and target compatibility before performing installation side effects.

#### Scenario: Dependency unsupported for rule target
- **GIVEN** a required dependency does not support one selected rule target
- **WHEN** preflight validation runs
- **THEN** the target plan is rejected before any package, plugin, MCP, skill, or rule action
- **AND** the incompatible dependency and target are reported
