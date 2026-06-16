## 1. Implement Exclusions

- [x] 1.1 Create `.npmignore` file in repository root to ignore `.opencode`, `.agents`, `.agent`, `adr`, `openspec`, and `test`

## 2. Verification

- [x] 2.1 Verify that `.gitignore` doesn't ignore the target directories
- [x] 2.2 Validate the change with `openspec validate exclude-dev-folders-from-publish --type change --strict`
