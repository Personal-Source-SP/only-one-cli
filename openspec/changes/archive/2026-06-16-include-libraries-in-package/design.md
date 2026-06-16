## Context

Currently, the `only-one` package's distribution configuration in `package.json` specifies only `"dist"` and `"scripts"` in its `"files"` field. As a result, the `libraries/` folder (which contains packages, skills, and templates) is omitted when the npm package is installed. During runtime, code inside `src/core/init/init-command.ts` refers to `../../../libraries` relative to compiled js files, which evaluates to a path that does not exist in installed environments.

## Goals / Non-Goals

**Goals:**
- Include the `libraries/` folder in the npm package payload.
- Verify that runtime resolution of `packagesDir` and `skillsDir` correctly locates the files under `node_modules/only-one/libraries/...` when installed.

**Non-Goals:**
- Dynamically downloading or pulling libraries from a remote URL.
- Modifying how libraries are defined, structured, or parsed.

## Decisions

1. **Update `package.json` to include `"libraries"`**:
   Add `"libraries"` to the `"files"` entry in `package.json`.
   - *Alternative Considered*: Copy libraries into `dist/` during build.
   - *Rationale*: Adding to `files` directly is simpler, keeps the source/dest paths matching dev-mode relative offsets, and avoids redundant build steps.

2. **Keep the relative path structure**:
   Since the relative paths from the compiled JavaScript files in `dist/` to the root folder remain unchanged (`../../../libraries`), no code changes are required in `init-command.ts`.

3. **Copy `libraries` in `publish-npm.sh`**:
   Copy the `libraries` directory to the temporary packaging folder (`PACK_ROOT`) inside `publish-npm.sh` so it is present during packaging and publication.

## Risks / Trade-offs

- **Risk**: Increased npm package size.
  - *Mitigation*: The `libraries/` folder only contains metadata manifests, templates, and small markdown skills, so the footprint increase is negligible (under a few hundred kilobytes).

## Migration Plan

- No migration is required for existing users; they will get the `libraries/` directory automatically upon upgrading to the new package version.

## Open Questions

None.
