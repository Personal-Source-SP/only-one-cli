---
name: only-one-component-inventory
description: Build a component and design system inventory from the existing codebase, then apply and enforce the reuse-first rule ([USE]/[EXTEND]/[NEW]) for every component decision. Use during frontend planning (to produce the inventory) and frontend implementation (to enforce it per task).
---

This skill has two modes: **produce** (used in planning) and **enforce** (used in implementation).

## Mode A — Produce (planning phase)

Run after bounded discovery and before UI design.

### Component inventory

1. Read the design system to identify all custom components relevant to the feature:
   - Component name, file path, and accepted props/variants.
2. List the design system conventions in use:
   - Color tokens, spacing tokens, typography scales, theme/CSS variable naming.
   - Icon sets, illustration assets, and animation utilities.

### Reuse-first classification

3. For every component the feature will touch, apply the following decision order:
   - **`[USE]`** — an existing component already covers the need. Use it as-is.
   - **`[EXTEND]`** — a small prop or variant addition satisfies the need without breaking existing usage. Document the backward-compatible change required.
   - **`[NEW]`** — no existing component can be reasonably extended to cover the need. This must be explicitly justified; new components must use existing design-system tokens only.
4. Record every component decision in this format:
   - `[USE] ComponentName`
   - `[EXTEND] ComponentName — add prop X (backward-compatible: existing callers unaffected)`
   - `[NEW] ComponentName — justified because no existing component covers Y`

### Token rule

5. Never duplicate color values, spacing values, or typography definitions inline in any new or modified component. Always reference the existing token.

### Output

Present the component inventory (items 1–2) and the classification table (items 3–4) before the UI design phase begins.

---

## Mode B — Enforce (implementation phase, per task)

Run at the start of each task in the OpenSpec task loop before writing any code.

1. Re-read the component inventory from the approved plan.
2. Identify every component this task will create or modify.
3. Verify the approved classification for each:
   - **`[USE]`**: import and use the existing component as-is. Do not copy, inline, or recreate it.
   - **`[EXTEND]`**: add only the approved prop/variant. Verify that existing usages of the component remain unbroken before and after the change.
   - **`[NEW]`**: only proceed if `[NEW]` was explicitly approved in the plan. The component must use existing design-system tokens; never use hardcoded values.
4. **Never** introduce inline color values, spacing values, or typography that duplicates an existing token.
5. If the required classification is missing or ambiguous for any component this task touches: stop and ask before writing any code.
