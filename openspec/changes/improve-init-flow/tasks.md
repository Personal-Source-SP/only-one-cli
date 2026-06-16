## 1. Restructure libraries/ directory

- [x] 1.1 Move `.agents/skills/*` → `libraries/skills/*`
- [x] 1.2 Create `libraries/packages/` directory
- [x] 1.3 Delete `libraries/openspec-bootstrap/` and `libraries/custom-skills-sync/`
- [x] 1.4 Update `libraries/README.md` with new structure docs

## 2. Create package manifest for openspec

- [x] 2.1 Create `libraries/packages/openspec.yaml` with name `@fission-ai/openspec`, scope `global`

## 3. Rewrite init command types

- [x] 3.1 Update `src/core/init/types.ts` with new `InitCommandOptions` (drop `force`, `installSkill`, `tools`; add `yes`, `step`, `skip` flags)
- [x] 3.2 Update `src/core/init/types.ts` with new `InitCommandRequest` (selected tools, packages, skills)
- [x] 3.3 Update `src/core/init/types.ts` with new `InitCommandResponse` (per-step results)

## 4. Rewrite init core logic

- [x] 4.1 Implement `executePackagesStep()`: read `libraries/packages/*.yaml`, multi-select prompt, existence check (`npm list -g`), npm install
- [x] 4.2 Implement `executeSkillsStep()`: read `libraries/skills/` dirs, multi-select prompt, existence check (per-tool per-skill dir), copy to each selected tool's `skillsDir/skills/`
- [x] 4.3 Implement `toolsExistenceCheck()`: for each selected tool, check if `skillsDir` exists in project, prompt confirmation
- [x] 4.4 Rewrite `executeInitCommand()`: orchestrate 3 steps in order, pass selections between steps, handle `--skip` and `--yes` flags
- [x] 4.5 Update `printInitResult()` to show results per step

## 5. Update CLI command registration

- [x] 5.1 Update `src/commands/init/command.ts`: remove `--force`, `--no-install-skill`, `--tools`; add `--yes`, `--step`, `--skip`
- [x] 5.2 Wire new options through to core logic

## 6. Remove dead code and imports

- [x] 6.1 Remove any remaining references to deleted libraries from import chains
- [x] 6.2 Remove `@library/openspec-bootstrap` and `@library/custom-skills-sync` import references in init-command.ts

## 7. Verify

- [x] 7.1 Run `npm run build` to verify TypeScript compiles
- [x] 7.2 Run `npx tsx src/index.ts init --yes` in a test directory to validate flow
- [x] 7.3 Run `openspec validate improve-init-flow --type change --strict` before archive
