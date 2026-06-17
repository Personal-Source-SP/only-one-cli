## 1. Implement Default AI Ignores logic

- [ ] 1.1 Update `updateGitignore` in [gitignore.ts](file:///Users/kiem/Sources/Personal/only-one-cli/src/core/init/gitignore.ts) to use `# AI ignores` as the section header and ensure `.agent/`, `openspec/`, `adr`, and `openspec` are included by default.

## 2. Verification and Validation

- [ ] 2.1 Rebuild and run unit tests.
- [ ] 2.2 Run `openspec validate add-openspec-gitignore --type change --strict` to verify the proposal and design schemas.

