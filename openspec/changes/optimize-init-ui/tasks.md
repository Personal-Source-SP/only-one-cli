## 1. Refactor UI Choices and Prompting

- [ ] 1.1 Update `executeToolsStep` to check if `skillsDir` or `detectionPaths` exist in projectDir and mark choices as `configured` / `detected`.
- [ ] 1.2 Update `executePackagesStep` to asynchronously check if packages are installed and mark choices as `configured`.
- [ ] 1.3 Update `executeSkillsStep` to check if skills already exist under any selected tools' destination directories and mark choices as `configured`.

## 2. Implement Summary Screen, Confirmation, and Execution

- [ ] 2.1 Refactor `executeInitCommand` orchestrator to run all prompts first to gather selections before executing any changes.
- [ ] 2.2 Create a helper to display a detailed text summary of selected tools, packages, and skills, clearly highlighting overwrite/reinstall warnings.
- [ ] 2.3 Add final confirmation prompt before execution, respecting the `--yes` option to auto-confirm.
- [ ] 2.4 Execute the installations and file copy operations sequentially only after confirmation, printing clean progress logs.

## 3. Verification and Validation

- [ ] 3.1 Run tests or compile the code to verify there are no TypeScript compile errors.
- [ ] 3.2 Validate the change using `npx openspec validate optimize-init-ui`.
