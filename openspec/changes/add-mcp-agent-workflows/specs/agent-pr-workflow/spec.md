## ADDED Requirements

### Requirement: PR command contract
Rule: `pr-git` SHALL require skill `ak-pr-git`, accept base branch defaulting to `main`, and accept Conventional Commit type `feat`, `fix`, `refactor`, or `style` defaulting to `feat`.

#### Scenario: Reject non-conventional tag
- **GIVEN** the user supplies `[FEAT]` or `FEAT`
- **WHEN** the command validates options
- **THEN** it rejects the value before MCP use
- **AND** lists supported lowercase types

### Requirement: Safe PR preflight
Rule: The skill SHALL create no PR unless the working tree is clean, the source is pushed, source differs from base, and commits differ from base.

#### Scenario: Stop on unpushed work
- **GIVEN** the current branch has uncommitted changes or unpushed commits
- **WHEN** the skill performs preflight
- **THEN** it stops with actionable details
- **AND** does not commit, push, or call a PR mutation

### Requirement: English PR body and Vietnamese review
Rule: The skill SHALL generate the prescribed English Markdown body, show a separate Vietnamese chat summary, and exclude Vietnamese content from GitHub body.

#### Scenario: Preview before create
- **GIVEN** repository preflight succeeds
- **WHEN** the skill drafts a PR
- **THEN** it shows English body, Vietnamese summary, title, source, and base
- **AND** waits for explicit confirmation before GitHub mutation

### Requirement: Existing PR handling
Rule: The skill SHALL avoid duplicate PRs for the same source and base.

#### Scenario: Matching PR exists
- **GIVEN** an open PR already matches source and base
- **WHEN** the skill checks GitHub
- **THEN** it shows the existing PR URL
- **AND** asks whether to update title/body or preserve it
- **AND** mutates only after confirmation
