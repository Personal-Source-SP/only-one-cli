## Why

Currently, the `libraries` directory (containing packages, skills, and templates) is not included in the published npm package files for `only-one`. As a result, when users install the `only-one` CLI library globally or locally, the `init` command fails to find the libraries because it looks for `../../../libraries` relative to the compiled JS files, which is absent in the published package. Including `libraries` in the npm package ensures that the CLI has access to all packages, skills, and templates immediately upon installation.

## What Changes

- Add `"libraries"` to the `"files"` array in `package.json` to ensure it is packaged during `npm pack` and `npm publish`.
- Update `scripts/publish-npm.sh` to copy the `libraries` directory into the temporary packaging folder.
- Ensure paths in `src/core/init/init-command.ts` to `libraries` resolve correctly within the installed node_modules structure (which they already do since `import.meta.url` resolved to `dist/core/init/init-command.js` and `../../../libraries` correctly points to the root of the package, where the `libraries` folder will now be included).

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- `package.json`: Updated `"files"` field.
- Installed `only-one` package footprint will include the `libraries/` directory.
