# legacy-branding-audit Specification

## Purpose
Ensure active source, generated build output, packed npm contents, and installed CLI output do not expose stale legacy `hybrid-index` branding.

## Requirements
### Requirement: Audit legacy hybrid-index branding
The system SHALL verify active source, generated build output, packed npm contents, and installed CLI output for legacy `hybrid-index` branding before the change is considered complete.

#### Scenario: Detect active user-facing legacy branding
- **GIVEN** source, generated artifacts, package contents, or CLI output contains a `hybrid-index` naming variant
- **WHEN** the legacy branding audit runs
- **THEN** each match is reported with its file or runtime surface
- **AND** each match is classified as user-facing, packaged internal, source-only internal, or historical

#### Scenario: Reject unexplained user-facing matches
- **GIVEN** the audit finds a user-facing `hybrid-index` naming variant
- **WHEN** implementation verification is evaluated
- **THEN** verification fails until the match is removed

#### Scenario: Retain intentional internal or historical matches
- **GIVEN** the audit finds an internal identifier or archived historical reference
- **WHEN** the match cannot affect current user-facing CLI or package behavior
- **THEN** the match may remain only when its classification and rationale are recorded

#### Scenario: Verify installed CLI branding
- **GIVEN** the package has been installed locally
- **WHEN** root and subcommand help output is inspected
- **THEN** no supported command description, example, or error text exposes `hybrid-index` branding
