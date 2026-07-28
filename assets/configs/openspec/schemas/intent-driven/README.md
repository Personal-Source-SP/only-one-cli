# Intent-Driven OpenSpec Schema

`intent-driven` controls Epic and Major Feature work before implementation.
Architecture contract and explicit source context become inputs to code generation.

## Artifact Order

```text
proposal → specs → architecture → context → design → scaffold → tasks
```

| Artifact | Purpose |
| --- | --- |
| `proposal.md` | Why change matters and affected capabilities. |
| `specs/<capability>/spec.md` | Observable behavior in OpenSpec Markdown and Gherkin style. |
| `architecture.md` | Business rules, data flow, data/API contracts, boundaries, and constraints. |
| `context.md` | Explicit repository-relative files and commands AI must read. |
| `design.md` | Implementation strategy and technical decisions. |
| `scaffold.md` | Reviewable file tree, contracts, module boundaries, and test stubs. |
| `tasks.md` | Ordered implementation checklist. |

Use this schema for cross-module work, new architecture, significant data/API changes,
or features with meaningful business behavior. Use a smaller schema for tactical fixes.

## Review and Apply Gate

`/opsx-propose` creates planning artifacts. Review architecture, context, design,
scaffold, and tasks before `/opsx-apply`.

Running `/opsx-apply` is user acceptance of current planning artifacts. AI then reads
all explicit paths in `context.md`, creates scaffold code first, and implements tasks.

## Context Injection

`context.md` is source manifest, not copied source. Each required file must use an
explicit repository-relative path with reason and read phase. Do not use wildcards or
globs. Attach or `@` the manifest files when asking AI to create scaffold or apply work.

## Contract Drift

When implementation uncovers business, specification, or design conflict:

1. Stop affected implementation.
2. Update affected proposal, specs, architecture, context, design, scaffold, and tasks.
3. Review revised planning artifacts.
4. Run `/opsx-apply` again.
5. Regenerate affected code from updated contract.

Do not patch code around documented constraints.

## Spec Format

Use OpenSpec Markdown delta headers. Every requirement has at least one Gherkin-style
scenario with observable `GIVEN`, `WHEN`, and `THEN` steps.

```md
## ADDED Requirements

### Requirement: User data export
Feature: User data export

#### Scenario: Successful CSV export
- **GIVEN** a user has saved data
- **WHEN** the user exports their data as CSV
- **THEN** the system provides a CSV file containing the user's data
```

Do not create `.feature` files for this schema.

## Validate

```bash
openspec schema validate intent-driven
openspec validate <change> --type change --strict
```
