## 1. Refactor Core Init Logic and Gitignore Helper

- [x] 1.1 Implement gitignore helper in `src/core/init/gitignore.ts` or inside `init-command.ts` to append directories to `.gitignore` under a labeled section.
- [x] 1.2 Refactor step functions in `src/core/init/init-command.ts` (`executeToolsStep`, `executePackagesStep`, etc.) to accept direct options and parameter overrides so they can be run in non-interactive/programmatic modes.
- [x] 1.3 Update the main orchestrator `executeInitCommand` to integrate `.gitignore` updates and respect the `--no-ignore` option.

## 2. Register Subcommands and CLI Options

- [x] 2.1 Update options in the main `init` command in `src/commands/init/command.ts` to support the `--no-ignore` flag.
- [x] 2.2 Register nested subcommands under the `init` command (`package`, `skill`, `configs`, `combo`) with appropriate arguments, options, and actions.
- [x] 2.3 Ensure subcommands fall back to interactive prompts if arguments are omitted.

## 3. Verification and Validation

- [x] 3.1 Run `npm run test` to verify that existing test suites continue to pass.
- [x] 3.2 Add new test scenarios specifically for subcommands and gitignore auto-update behavior.
- [x] 3.3 Run `openspec validate upgrade-cli-init-flow --type change --strict` to validate all proposal, design, and specification artifacts.
