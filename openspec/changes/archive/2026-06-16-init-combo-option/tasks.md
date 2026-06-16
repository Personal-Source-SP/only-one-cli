## 1. Setup libraries/combos and CLI options

- [x] 1.1 Create `libraries/combos` directory and a default combo YAML file
- [x] 1.2 Update command-line options definition in `src/commands/init/command.ts` and `src/commands/init/types.ts` to support `--combo <names>` option (comma-separated)

## 2. Implement combo parser and interactive wizard integration

- [x] 2.1 Implement reading combo YAML files in `src/core/init/init-command.ts`
- [x] 2.2 Add Setup Method prompt (Combo vs Custom) and Combo Multi-Select prompt in interactive wizard
- [x] 2.3 Inject merged and deduplicated combo packages and skills selections into the execution phase when combos are selected

## 3. Verification

- [x] 3.1 Validate the change with `openspec validate init-combo-option --type change --strict`
- [x] 3.2 Run test suite to verify no regressions
