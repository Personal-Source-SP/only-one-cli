---
name: only-one-canonical-ref-gate
description: Validate and read the --ref canonical reference input, summarize its structure, and establish it as the immutable planning anchor. Use at the start of frontend planning workflows before any discovery or design work.
---

This gate runs immediately after dependency preflight, before bounded discovery or UI design.

## Input requirement

The caller must provide `--ref <path>`. The path must point to one of:
- A **markdown document** describing the code pattern or structure to follow (e.g. `docs/patterns/page-template.md`)
- An **existing source folder** representing the canonical page structure (e.g. `src/app/invoices/`)
- A **single source file** as the structural reference (e.g. `src/app/invoices/page.tsx`)

## Validation

1. Verify that `--ref` was provided.
   - If missing: stop and output → `Error: --ref <path> is required. Provide a canonical doc, folder, or file. Do not proceed without it.`
2. Verify that the path exists on disk.
   - If not found: stop and output → `Error: --ref path "<value>" not found. Verify the path and retry.`

## Reading

3. Read the referenced content according to its type:
   - **File:** Read the file. Summarize its structure: page layout, components used, data fetching pattern, Server/Client split, naming conventions.
   - **Folder:** Read the entry-point file (e.g. `page.tsx`, `index.tsx`) and direct children. Summarize the same aspects.
   - **Markdown doc:** Read and extract the code pattern it describes.

## Recording

4. Record the resolved canonical reference as **`<canonical-ref>`** with:
   - Path
   - Type (file / folder / doc)
   - Extracted structural summary

`<canonical-ref>` becomes the **immutable anchor** for all planning decisions in this workflow.

## Constraints

- Do not modify, generate, or infer requirements from `<canonical-ref>`. It is read-only reference material.
- Do not search for or substitute a different reference if the provided path does not match expectations. Stop and ask the user to provide the correct path.
- Every structural decision in the plan must default to matching `<canonical-ref>` unless there is an approved, explicitly stated reason to diverge.
