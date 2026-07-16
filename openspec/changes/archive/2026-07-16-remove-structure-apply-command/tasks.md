## 1. Audit legacy branding baseline

- [x] 1.1 Scan active source, scripts, tests, and documentation for case/separator variants of `hybrid-index`
- [x] 1.2 Classify every match as user-facing, packaged internal, source-only internal, or historical archive
- [x] 1.3 Remove active user-facing matches and record rationale for intentionally retained internal or historical matches

## 2. Remove CLI command surface

- [x] 2.1 Remove `createStructureApplyCommand` registration and exports from CLI modules
- [x] 2.2 Delete the `src/commands/structure-apply` implementation and command-specific types
- [x] 2.3 Remove the `structure-apply` section from README documentation

## 3. Remove apply agent artifacts

- [x] 3.1 Delete the structure-apply template and its skill/command builders
- [x] 3.2 Simplify structure skill presence checks to require generation artifacts only
- [x] 3.3 Simplify agent artifact installation to generate structure-generation artifacts only
- [x] 3.4 Remove remaining active source references to `structure-apply`, `createStructureApplyCommand`, and `STRUCTURE_APPLY`

## 4. Update and verify tests

- [x] 4.1 Update command registry, help, skill presence, and artifact installation tests for generation-only behavior
- [x] 4.2 Run formatting check, TypeScript build, and full test suite
- [x] 4.3 Scan generated `dist` output for unexplained `hybrid-index` variants
- [x] 4.4 Pack npm artifact and scan package contents for unexplained `hybrid-index` variants
- [x] 4.5 Publish locally and verify CLI help excludes `structure-apply` and all user-facing `hybrid-index` branding
- [x] 4.6 Verify invoking `only-one structure-apply --help` returns unknown command
- [x] 4.7 Scan source and packaged output to confirm no active `structure-apply` workflow remains
- [x] 4.8 Run `openspec validate remove-structure-apply-command --type change --strict`
