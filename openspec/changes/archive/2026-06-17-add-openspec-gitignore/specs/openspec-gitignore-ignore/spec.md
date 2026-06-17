## ADDED Requirements

### Requirement: OpenSpec Gitignore Default Structure

The `init` command MUST update the project's `.gitignore` file to append default ignore patterns under the `# AI ignores` section.


#### Scenario: Automatically append default AI ignores to gitignore
- **GIVEN** a project is being initialized
- **AND** the `.gitignore` file exists
- **WHEN** the initialization executes successfully
- **THEN** it appends `.agent/`, `openspec/`, `adr`, and `openspec` to `.gitignore` under the `# AI ignores` section

