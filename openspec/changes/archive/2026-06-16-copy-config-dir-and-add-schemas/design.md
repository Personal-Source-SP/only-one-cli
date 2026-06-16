## Context

Currently, the configuration copying code in `only-one-cli` uses the `files` array defined in `libraries/configs/index.yaml`. It maps file paths individually, copying specific files.
We need to copy the entire configuration directory (such as `openspec` directory containing `config.yaml` and `schemas`) recursively, so that we don't have to specify each file inside `index.yaml`.

## Goals / Non-Goals

**Goals:**
- Add `openspec/schemas` directory containing OpenSpec schema files inside `libraries/configs/openspec`.
- Change `libraries/configs/index.yaml` to specify directory copy mapping (e.g. source `openspec`, destination `openspec`).
- Support recursive directory copying in `src/core/init/init-command.ts`.

**Non-Goals:**
- Changing package or tool installation logic.

## Decisions

### Decision 1: Directory mapping in index.yaml
Update `libraries/configs/index.yaml` to copy the whole directory:
```yaml
openspec:
  description: "OpenSpec default rules configuration"
  files:
    - src: "openspec"
      dest: "openspec"
```

### Decision 2: Recursive directory copying implementation
The Node `fs/promises` `cp` function with `{ recursive: true, force: true }` copies files and directories. Since we create `dest` or its parent directory using `mkdir`, we need to make sure that:
- If `src` is a directory, we run `mkdir(destPath, { recursive: true })` then `cp(srcPath, destPath, { recursive: true, force: true })`.
- If `src` is a file, we run `mkdir(join(destPath, '..'), { recursive: true })` then `cp(srcPath, destPath, { recursive: true, force: true })`.

This is already mostly supported in the code:
```typescript
const isDir = (await stat(srcPath)).isDirectory();
if (!isDir) {
    await mkdir(join(destPath, '..'), { recursive: true });
} else {
    await mkdir(destPath, { recursive: true });
}
await cp(srcPath, destPath, { recursive: true, force: true });
```
However, we will double-check and test this behavior to ensure that directory contents are copied correctly and there are no nested destination folder issues (e.g., copying `openspec` into `openspec` resulting in `openspec/openspec/`).

## Risks / Trade-offs

- **Risk**: Node.js `cp` behaviour with directory targets can vary slightly depending on Node version or if target directory exists.
- **Mitigation**: We will verify behavior with automated/manual tests and ensure target path structure remains correct.

## Migration Plan

No migration needed as this is a local init-time CLI configuration update.
