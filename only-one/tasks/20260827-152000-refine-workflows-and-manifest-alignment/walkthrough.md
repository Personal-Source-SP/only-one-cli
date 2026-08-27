# Walkthrough: Workflows & Manifest Alignment

Task: `20260827-152000-refine-workflows-and-manifest-alignment`

## Changes Summary
- **Skills Registered**: `conversational-english-coaching`, `english-learning-extraction`, `task-lifecycle-resolution` added to `assets/skills/` and `assets/skills/index.ts`.
- **Workflow Manifest Aligned**: Updated `assets/workflows/index.ts` requiredSkills mappings.
- **Templates & Schemas Fixed**:
  - `only-one-idea.md`: Renumbered Section 7 to Section 5, unified `only-one/CONTEXT.md`.
  - `only-one-plan.md` & `only-one-apply.md`: Added `Status` column to Task Matrix (`[ ]`, `[/]`, `[x]`).
  - `only-one-pr-git.md` & `agent-workflows.ts`: Expanded supported conventional commit tags (`chore`, `docs`, `test`, `perf`, `ci`, `build`).
  - `only-one-review.md`: Added working tree audit (`git status`).
  - `only-one-conflict.md`: Used `git commit --no-edit`.
  - `only-one-archive.md`: Aligned Section 5 reference.
- **Mirrors Synced**: `.agents/workflows/` and `.agents/skills/`.

## Test Results
- `npm test`: 50/50 test files passed (201/201 tests passing).
- `npm run build`: Prettier formatting check and TypeScript build passed 100%.
