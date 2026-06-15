## ADDED Requirements

### Requirement: openspec CLI availability check
The init command SHALL check whether `@fission-ai/openspec` is globally installed via npm before proceeding.
Feature: openspec-bootstrap

#### Scenario: openspec CLI is already installed globally
- **GIVEN** user runs `only-one-cli init`
- **WHEN** `@fission-ai/openspec` is detected in global npm packages
- **THEN** proceed to openspec init step without reinstallation

#### Scenario: openspec CLI is not installed
- **GIVEN** user runs `only-one-cli init`
- **WHEN** `@fission-ai/openspec` is not found globally
- **THEN** install it via `npm install -g @fission-ai/openspec`
- **AND** verify installation succeeded before continuing

#### Scenario: npm global install fails
- **GIVEN** user runs `only-one-cli init`
- **WHEN** npm install command returns non-zero exit code
- **THEN** display clear error message with instructions to install manually
- **AND** abort init process

### Requirement: openspec init execution
The init command SHALL delegate tool selection and standard skill installation to `openspec init`.

#### Scenario: openspec init runs successfully
- **GIVEN** openspec CLI is available
- **WHEN** user runs `only-one-cli init`
- **THEN** execute `openspec init [path]` as child process
- **AND** pass `--tools` flag if provided by user
- **AND** pass `--force` flag if provided by user

#### Scenario: openspec init fails
- **GIVEN** openspec CLI is available
- **WHEN** `openspec init` returns non-zero exit code
- **THEN** display the error output to user
- **AND** abort init process

### Requirement: pass-through flags
The init command SHALL pass `--tools` and `--force` flags through to `openspec init` when provided.

#### Scenario: --tools flag is passed to openspec
- **GIVEN** user runs `only-one-cli init --tools cursor,claude`
- **WHEN** openspec init is invoked
- **THEN** pass `--tools cursor,claude` to openspec init

#### Scenario: --force flag is passed to openspec
- **GIVEN** user runs `only-one-cli init --force`
- **WHEN** openspec init is invoked
- **THEN** pass `--force` to openspec init
