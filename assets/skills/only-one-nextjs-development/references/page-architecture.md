# Page Feature Architecture

## Standard Feature Page Directory Structure

Each Feature Page (e.g., `src/pages/<feature>/`) MUST adhere to a self-encapsulated modular directory structure:

```text
src/pages/<feature>/
├── index.tsx              # Presentation Orchestrator (ListWrapper, ListTable, FilterPanel, Drawers)
├── components/            # Page-specific UI sub-components (FormDrawer, Modals, Details)
│   └── index.ts           # Barrel export for all sub-components
├── hooks/                 # Headless API & Business Hooks (Data fetching, table, drawer forms, mutations)
│   └── index.ts           # Barrel export for all page hooks
├── constants.ts           # Page constants (Column widths, index keys, default values, drawer titles)
├── enums/                 # Feature enums
│   └── index.ts           # Barrel export
├── types/                 # Interface & type definitions (Data models, FormValues, Params)
│   └── index.ts           # Barrel export
└── utils/                 # Pure helper functions (Converters, Formatters, Parsers)
    └── index.ts           # Barrel export
```

---

## Headless API Hook & UI Separation Architecture

To keep the Main Page (`index.tsx`) clean, declarative, and well below the **200 LOC ceiling**, encapsulate **all API fetching, mutations, and Refine hook wiring inside dedicated page hooks** (`src/pages/<feature>/hooks/`):

### 1. Separation of Responsibilities
- **Data & Logic Layer (`src/pages/<feature>/hooks/`)**:
  - Encapsulates `useCustomTable`, `useCustomDrawerForm`, `useCustomSelect`, and ad-hoc mutations.
  - Handles `initialValuesMapper`, `onFinish` payload transformation, `onMutationSuccess` table refetching, and search debouncing.
  - Exposes clean, structured data objects and action callbacks to the UI.
- **Presentation Layer (`src/pages/<feature>/index.tsx` & `components/`)**:
  - Consumes the headless page hook(s).
  - Prepares table columns via `useMemo`, filter controls, and action triggers.
  - Renders `<ListWrapper>`, `<ListTable>`, and Form Drawers without embedding raw API logic.

### 2. Code Example: Headless Page Hook (`hooks/use-feature-page.ts`)

```tsx
import { API_ENDPOINT } from "@/config";
import { useCustomDrawerForm, useCustomSelect, useCustomTable } from "@/hooks";
import type { Feature, FeatureFormValues, CategoryOption } from "../types";

export const useFeaturePage = () => {
  // 1. Table Orchestration
  const {
    tableProps,
    tableQuery,
    debouncedSearch,
    setFilters,
  } = useCustomTable<Feature>({
    resource: API_ENDPOINT.FEATURES.BASE,
  });

  // 2. Form Drawer Orchestration (Create & Edit)
  const createDrawerForm = useCustomDrawerForm<Feature, FeatureFormValues, Feature>({
    action: "create",
    resource: API_ENDPOINT.FEATURES.BASE,
    onMutationSuccess: async () => {
      await tableQuery.refetch();
    },
  });

  const editDrawerForm = useCustomDrawerForm<Feature, FeatureFormValues, Feature>({
    action: "edit",
    resource: API_ENDPOINT.FEATURES.BASE,
    onMutationSuccess: async () => {
      await tableQuery.refetch();
    },
  });

  // 3. Dropdown Options Loader
  const { options: categoryOptions } = useCustomSelect<CategoryOption>({
    resource: API_ENDPOINT.CATEGORIES.BASE,
    optionLabel: "name",
    optionValue: "id",
  });

  return {
    table: {
      tableProps,
      tableQuery,
      debouncedSearch,
      setFilters,
    },
    drawers: {
      createDrawerForm,
      editDrawerForm,
    },
    options: {
      categoryOptions,
    },
  };
};
```

### 3. Code Example: Main Page Orchestrator (`index.tsx`)

```tsx
import { useMemo } from "react";
import { useTranslation } from "next-i18next";
import { ListTable, ListWrapper } from "@/components";
import { PermissionGroups } from "@/enums";
import { FeatureFormDrawer } from "./components";
import { useFeaturePage } from "./hooks";
import type { ColumnsType } from "antd/es/table";
import type { Feature } from "./types";

const FeaturePage = () => {
  const { t } = useTranslation();
  const { table, drawers, options } = useFeaturePage();

  const columns: ColumnsType<Feature> = useMemo(() => [
    {
      title: t("pages.features.columns.name"),
      dataIndex: "name",
      key: "name",
    },
  ], [t]);

  const actions = useMemo(() => (
    <Button type="primary" onClick={() => drawers.createDrawerForm.show()}>
      {t("pages.features.actions.create")}
    </Button>
  ), [drawers.createDrawerForm, t]);

  return (
    <>
      <ListWrapper
        actions={actions}
        isLoading={table.tableQuery.isLoading}
        permissionGroup={PermissionGroups.FEATURE}
      >
        <ListTable
          columns={columns}
          tableProps={table.tableProps}
          tableQuery={table.tableQuery}
          onEdit={(record) => drawers.editDrawerForm.show(record.id)}
        />
      </ListWrapper>

      <FeatureFormDrawer
        drawerForm={drawers.createDrawerForm}
        categoryOptions={options.categoryOptions}
      />
      <FeatureFormDrawer
        drawerForm={drawers.editDrawerForm}
        categoryOptions={options.categoryOptions}
      />
    </>
  );
};

export default FeaturePage;
```

---

## Conventions in `index.tsx` (Main Page Component)

### 1. Import Statement Ordering
Group imports into 3 distinct sections separated by a single blank line:
1. Third-party dependencies (React, Ant Design, Icons, i18next).
2. Shared project components, hooks, and utilities (`@/components`, `@/hooks`, `@/utilities`, `@/enums`, `@/config`).
3. Local page files (`./components`, `./hooks`, `./constants`, `./enums`, `./types`, `./utils`).

### 2. Component Declaration Order & Formatting
Declarations inside `.tsx` components MUST follow the role-ordered pipeline:

$$\text{Constants} \rightarrow \text{State \& Hooks} \rightarrow \text{Memos (useMemo)} \rightarrow \text{Effects (useEffect)} \rightarrow \text{Callbacks (useCallback)} \rightarrow \text{JSX Return}$$

- **Line Length Sorting**: Within each role group, sort variable and hook declaration lines **from shortest to longest** (character count).
- **Group Separation**: Separate distinct role groups by **exactly one blank line**.
- **File Length Ceiling**: Keep each component file within **200 lines**. Move API logic and data fetching into `hooks/` and UI pieces into `components/`.
- **Empty Array Check**: Standardize empty array checks using `!list?.length` across the project.
- **Debug-Friendly Return**: ALWAYS assign configurations (`actions`, `filters`, `columns`) and computed JSX elements to descriptive variables before returning.
