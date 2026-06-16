## 1. Package Configuration

- [x] 1.1 Add `"libraries"` to the `"files"` array in `package.json`
- [x] 1.2 Copy `libraries` to the packaging folder in `scripts/publish-npm.sh`

## 2. Verification

- [x] 2.1 Run local packing/validation to verify `libraries` directory exists in package payload
- [x] 2.2 Run `openspec validate include-libraries-in-package --type change --strict`
