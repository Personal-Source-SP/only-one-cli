## 1. Library data and editor model

- [x] 1.1 Add typed `libraries/vs` settings and extension manifests, update library documentation, and verify package publishing includes them
- [x] 1.2 Implement typed editor descriptors for VS Code, Cursor, and Antigravity with macOS/Windows settings paths and CLI executable candidates
- [x] 1.3 Add validation and discovery tests for supported editors, missing paths, invalid settings input, and duplicate extension IDs

## 2. Shared sync infrastructure

- [x] 2.1 Implement JSONC-aware deep merge that preserves target-only keys and lets source scalar, array, and conflicting values win
- [x] 2.2 Implement deterministic work-unit planning and monotonic 0-100 percent progress reporting
- [x] 2.3 Implement injectable filesystem and process-runner boundaries for atomic writes and editor CLI execution
- [x] 2.4 Add unit tests for nested merge, type conflicts, output validity, work-unit totals, and progress completion rules

## 3. Transaction and recovery

- [x] 3.1 Implement durable transaction journal and pre-mutation backups for settings files and extension snapshots
- [x] 3.2 Implement commit, compensating rollback, and journal retention when rollback cannot complete
- [x] 3.3 Handle supported termination signals and recover unfinished journals before allowing a new sync transaction
- [ ] 3.4 Add fault-injection tests for settings failure, extension install failure, termination, interrupted process recovery, and failed recovery blocking new changes

## 4. Settings command

- [x] 4.1 Implement `setting-vs` command module and multi-select editor prompt using shared discovery and transaction services
- [x] 4.2 Merge and atomically write each selected editor `settings.json` at the resolved macOS or Windows location
- [x] 4.3 Register and export `setting-vs`, route progress and actionable validation errors through existing output conventions
- [ ] 4.4 Add command tests for multi-editor selection, platform paths, merge precedence, unselected editors, progress, and rollback

## 5. Extensions command

- [x] 5.1 Implement extension adapters that list, normalize, deduplicate, install, and uninstall by ID through each editor CLI
- [x] 5.2 Implement `extensions-vs` command module and multi-select editor prompt with preflight validation before the first install
- [x] 5.3 Register and export `extensions-vs`, preserving extensions outside the source manifest and skipping already-installed IDs
- [ ] 5.4 Add command tests for multiple editors, missing CLI, duplicate IDs, install progress, partial failure, and compensating uninstall

## 6. Verification and documentation

- [x] 6.1 Update CLI and `libraries` documentation with command usage, source-wins merge behavior, supported platforms/editors, and recovery behavior
- [x] 6.2 Run formatting, unit tests, and build; verify generated package contains `libraries/vs`
- [x] 6.3 Run `openspec validate sync-vs-settings-extensions --type change --strict` and resolve every validation error
- [ ] 6.4 Manually smoke-test both commands on available editors and confirm interrupted-run recovery restores pre-run state
