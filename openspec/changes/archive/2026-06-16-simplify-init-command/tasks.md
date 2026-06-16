## 1. openspec-bootstrap module

- [x] 1.1 Create `src/core/init/openspec-bootstrap.ts` with `ensureOpenspecCli()` function — check `npm list -g @fission-ai/openspec`, install if missing
- [x] 1.2 Add `runOpenspecInit()` function — spawn `openspec init [path]` with `--tools`/`--force` pass-through
- [x] 1.3 Handle errors: npm install failure, openspec init non-zero exit, missing openspec after install

## 2. custom-skills-sync module

- [x] 2.1 Create `src/core/init/custom-skills-sync.ts` with `readOpenspecConfig()` — parse `.openspec.yaml` for `agent_tools` list
- [x] 2.2 Add `syncCustomSkills()` function — for each selected tool, copy `.agents/skills/<name>/` to `<tool.skillsDir>/skills/<name>/`
- [x] 2.3 Handle edge cases: empty tools list, unknown tool IDs, missing `.agents/skills/` directory

## 3. Rewrite init-command.ts

- [x] 3.1 Strip all project config imports: `writeConfig`, `hasLocalConfig`, `syncBackendProjectOnInit`, `scaffoldStructureOutput`, `ignoreInGitignore`, `globalsFor`, `clientFor`, `parseIndexMode`, `resolveGitProjectName` etc.
- [x] 3.2 Rewrite `executeInitCommand()` to call openspec-bootstrap → custom-skills-sync orchestration
- [x] 3.3 Simplify `InitCommandRequest` types — remove unused fields
- [x] 3.4 Update `printInitResult()` — simplify output to show openspec and custom skills status

## 4. Update command registration

- [x] 4.1 Remove `--server`, `--project-name`, `--index-mode`, `--source-uri`, `--default-branch`, `--git-token` flags from `command.ts`
- [x] 4.2 Update command description text
- [x] 4.3 Add deprecation warnings for removed flags (keep parsing them but warn)

## 5. Clean up

- [x] 5.1 Remove unused type exports from `src/commands/init/types.ts` and `src/core/init/types.ts`
- [x] 5.2 Verify no remaining imports of removed functions in init flow
- [x] 5.3 Run `npm run format` to fix formatting
- [x] 5.4 Update init tests for new behavior

## 6. Validate

- [x] 6.1 Run `openspec validate simplify-init-command --type change --strict`
