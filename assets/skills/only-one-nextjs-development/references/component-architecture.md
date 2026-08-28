# Component Architecture

## UI Component & Sub-Component Design Standards

- ✅ **Leverage Common Components (`src/components`)**:
  - MUST audit and reuse available common components in `@/components` (`ListWrapper`, `ListTable`, `FilterPanel`, `CardAction`, `CustomDrawerForm`, `CustomInputForm`, `CustomSelectInput`, `CustomModal`, `UploadImage`) rather than creating bespoke duplicates.
- ✅ **Form Drawer Pattern (`<CustomDrawerForm>`)**:
  - Receive the `drawerForm` prop (derived from `useCustomDrawerForm`).
  - Use `<CustomDrawerForm>` as the root form container paired with `createInitialValues`.
  - Use `<CustomInputForm>` (supporting `type="text" | "number" | "html" | ...`) for text and numerical inputs.
  - Use `<CustomSelectInput>` for dropdown controls (configured with `selectProps={{ showSearch: true, options }}`).
  - Specify validation rules using `FormRuleType` from `@/utilities` (e.g., `type: FormRuleType.Required`).
- ✅ **Component Directory Layout (Simple vs Complex)**:
  - **Simple Component**: Authored in a **single `.tsx` file** (e.g., `components/ModeFormDrawer.tsx`). Maintain a maximum limit of **200 lines per file**.
  - **Complex Component**: Encapsulated in a **dedicated subdirectory** (e.g., `components/ModeFormDrawer/`) containing a main `index.tsx` and partitioned sub-components (`ModeFormBasic.tsx`, `ModeFormAdvanced.tsx`).
  - Re-export all sub-components through `components/index.ts`.
- ✅ **Semantic HTML & Stable List Keys**:
  - Favor semantic HTML5 tags (`<section>`, `<article>`, `<header>`, `<nav>`) over excessive `<div>` wrapping.
  - ALWAYS provide a unique, stable `key` prop for every element rendered within `.map()` loops.
- ✅ **Design System & Styling**:
  - Reuse Ant Design components (`Button`, `Tag`, `Typography`, `Card`, `Space`).
  - Use centralized constant palettes for badge/status styling (`ACTIVE_STATUS_COLORS`, `BOOLEAN_TAG_COLORS`).
- ✅ **Debug-Friendly Return-by-Variable**:
  - ALWAYS bind computed JSX elements or data structures to descriptive variables prior to returning.
