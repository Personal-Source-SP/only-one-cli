# agent-clockify-workflow Specification

## Purpose
TBD - created by archiving change add-mcp-agent-workflows. Update Purpose after archive.
## Requirements
### Requirement: Clockify command input
Rule: `clockify` SHALL require `--date DD/MM/YYYY` and `--project`, accept positive integer `--tasks-per-day` defaulting to 2, and accept optional `--validate`.

#### Scenario: Missing required option
- **GIVEN** date or project is absent
- **WHEN** the command validates input
- **THEN** it reports an error before loading mutation workflow

### Requirement: Task line parsing
Rule: Each non-empty task line SHALL match `[Label] Description | start-endh`; exact trimmed text before the first `|` SHALL become Clockify description.

#### Scenario: Parse valid task lines
- **GIVEN** a line `[Carwash API] Implement CRUD | 9-13h`
- **WHEN** the skill parses the list
- **THEN** description is `[Carwash API] Implement CRUD`
- **AND** slot is `09:00-13:00` in `Asia/Ho_Chi_Minh`

### Requirement: Working-day allocation
Rule: Tasks SHALL retain input order and be allocated from the required start date with at most `tasks-per-day` per weekday.

#### Scenario: Weekend start
- **GIVEN** the supplied start date is Saturday or Sunday
- **WHEN** allocation runs
- **THEN** the first task is allocated to next Monday
- **AND** preview shows original and adjusted date

### Requirement: Validation mode has no mutation
Rule: `--validate` SHALL validate and preview the complete batch without deleting or creating time entries.

#### Scenario: Invalid batch
- **GIVEN** task format, slot overlap, project resolution, or explicit day grouping violates rules
- **WHEN** validation mode runs
- **THEN** it reports each error and skipped task
- **AND** performs no Clockify mutation

### Requirement: Exact project resolution
Rule: Project lookup SHALL use exact name; ambiguous workspace matches require user selection and non-interactive ambiguity fails.

#### Scenario: Project not found
- **GIVEN** no exact project matches
- **WHEN** lookup completes
- **THEN** it stops before mutation
- **AND** displays similar project names without selecting one

### Requirement: Confirmed safe replacement
Rule: Log mode SHALL preview and confirm once, then replace only entries matching workspace, project, date, and slot while preserving all others.

#### Scenario: Existing matching entry
- **GIVEN** an entry matches resolved workspace/project, date, and slot
- **WHEN** user confirms logging
- **THEN** the skill snapshots and deletes that entry
- **AND** creates the new billable entry

#### Scenario: Replacement create fails
- **GIVEN** a matching old entry was deleted
- **WHEN** creation of replacement fails
- **THEN** the skill attempts immediate restoration from snapshot
- **AND** stops the remaining batch
- **AND** reports restored, unrestored, and unprocessed items

