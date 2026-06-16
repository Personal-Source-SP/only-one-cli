## ADDED Requirements

### Requirement: Development Folders Exclusion from Publish
Rule: The repository SHALL exclude development, testing, and specification folders (`.opencode`, `.agents`, `.agent`, `adr`, `openspec`, `test`) from the published npm package while keeping them tracked in the Git repository.

#### Scenario: Verify directories are excluded from npm package
- **GIVEN** a `.npmignore` file exists with the directories listed
- **WHEN** the npm package is packed or published
- **THEN** `.opencode`, `.agents`, `.agent`, `adr`, `openspec`, and `test` are not included in the package contents

#### Scenario: Verify directories are tracked in Git
- **GIVEN** the `.gitignore` file configuration
- **WHEN** files are modified inside `.opencode`, `.agents`, `.agent`, `adr`, `openspec`, or `test`
- **THEN** Git tracks these changes normally
- **AND** they can be committed and pushed to the remote repository

## MODIFIED Requirements

## REMOVED Requirements
