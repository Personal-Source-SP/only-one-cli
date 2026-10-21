# Refine & Custom Hooks Reference

Comprehensive reference guide detailing all API, Refine, permission, responsive, and utility hooks provided at `@/hooks` (and `@/hooks/api`) across Portal applications.

---

## Table of Contents
- [1. `useCustomTable` (Table Orchestration & Pagination)](#1-usecustomtable-table-orchestration--pagination)
- [2. `useCustomDrawerForm` (Form Drawer for Create / Edit)](#2-usecustomdrawerform-form-drawer-for-create--edit)
- [3. `useCustomModalForm` (Modal Form for Create / Edit)](#3-usecustommodalform-modal-form-for-create--edit)
- [4. `useCustomSelect` (Dropdown Select Options Loader)](#4-usecustomselect-dropdown-select-options-loader)
- [5. `useCustomData` & `useCustomMutationData` (Custom API Requests)](#5-usecustomdata--usecustommutationdata-custom-api-requests)
- [6. Granular CRUD & Data Hooks (`useCustomOne`, `useCustomList`, `useCustomDelete`)](#6-granular-crud--data-hooks)
- [7. Configuration & Parameter Hooks (`useSettings`, `useResourceService`, `useSearchParamsString`)](#7-configuration--parameter-hooks)
- [8. Permission & Authorization Hooks (`usePermission`, `usePagePermissions`, `useHasRole`)](#8-permission--authorization-hooks)
- [9. Responsive & Utility Hooks (`useMediaQuery`, `useDebounce`, `useDebounceSearch`, `useTableChange`)](#9-responsive--utility-hooks)
- [10. Guidelines for Hook Usage](#10-guidelines-for-hook-usage)

---

## 1. `useCustomTable` (Table Orchestration & Pagination)

Orchestrates props for Ant Design Tables, automatically managing pagination, sorting, search debouncing, and notifications.

- **Import**: `import { useCustomTable } from "@/hooks";`
- **Generics**: `useCustomTable<TData>`
- **Options (`UseCustomTableRequest<TData>`)**:
  - `resource` *(string)*: Target API endpoint path (e.g., `API_ENDPOINT.WASH_MODES.BASE`).
  - `pagination` *(object)*: Pagination configuration (`pageSize`, `currentPage`, or `{ mode: "off" }` to disable pagination).
  - `sorters` *(object)*: Default sort configuration (`{ initial: [{ field: "position", order: "asc" }] }`).
  - `rowKey` *(string | function)*: Row identity key (defaults to `"id"`).
  - `errorMessage` / `successMessage` *(string)*: Custom localized toast messages.
- **Return Values**:
  - `tableProps`: Bound directly to `<ListTable tableProps={tableProps} />` (includes `onChange`, `rowKey`, `dataSource`).
  - `tableQuery`: Query object (contains `isLoading`, `error`, `refetch`, `data`).
  - `debouncedSearch(value)`: Debounced search function (passed to search filter `onChange`).
  - `setFilters(filters)`: Programmatic filter updater.
  - `setCurrentPage(page)`: Page navigator.
  - `pageSize`, `setPageSize`: Current page size state and setter.

```tsx
const {
  tableProps,
  tableQuery,
  debouncedSearch,
  setFilters,
  setCurrentPage,
} = useCustomTable<WashMode>({
  pagination: { mode: "off" },
  resource: API_ENDPOINT.WASH_MODES.BASE,
});
```

---

## 2. `useCustomDrawerForm` (Form Drawer for Create / Edit)

Coordinates Form Drawers, handling automated record fetching on edit, data transformation pipelines, and post-mutation table refetching.

- **Import**: `import { useCustomDrawerForm } from "@/hooks";`
- **Generics**: `useCustomDrawerForm<TQueryFnData, TVariables, TData>`
- **Options (`UseCustomDrawerFormRequest`)**:
  - `action`: Form action mode (`"create"` | `"edit"` | `"clone"`).
  - `resource`: API endpoint path.
  - `onMutationSuccess`: Post-save callback (typically `async () => { await tableQuery.refetch(); }`).
  - `initialValuesMapper(data)`: Transforms fetched API record into initial form values (e.g., converting seconds to minutes).
  - `onFinish(values)`: Transforms form values prior to submitting payload to the API (e.g., converting minutes to seconds).
- **Return Values**:
  - `drawerProps`: Bound to Antd Drawer (`visible`, `onClose`).
  - `formProps`: Bound to Form (`form`, `onFinish`).
  - `show(id?)`: Opens drawer (supply `id` during edit actions).
  - `close()`: Closes drawer.
  - `mode`: Current action mode (`"create"` or `"edit"`).
  - `id`: Current record ID being edited.
  - `queryResult`: Underlying query result for the fetched record.

```tsx
const editDrawerForm = useCustomDrawerForm<WashMode, WashModeFormValues, WashMode>({
  action: "edit",
  resource: API_ENDPOINT.WASH_MODES.BASE,
  onMutationSuccess: async () => {
    await tableQuery.refetch();
  },
  initialValuesMapper: (washMode) => ({
    estimatedDurationSec: convertSecondsToMinutes(washMode.estimatedDurationSec),
  }),
  onFinish: (values) => ({
    ...values,
    estimatedDurationSec: convertMinutesToSeconds(values.estimatedDurationSec),
  }),
});
```

---

## 3. `useCustomModalForm` (Modal Form for Create / Edit)

Equivalent to `useCustomDrawerForm`, designed specifically for modal dialog interfaces.

- **Import**: `import { useCustomModalForm } from "@/hooks";`
- **Generics**: `useCustomModalForm<TQueryFnData, TVariables, TData>`
- **Options & Return Values**: `modalProps`, `formProps`, `show(id?)`, `close()`, `onFinish`, `initialValuesMapper`, `mode`, `id`.

---

## 4. `useCustomSelect` (Dropdown Select Options Loader)

Automatically queries resources from API endpoints and transforms them into `SelectOption[]` arrays for `<Select>` or `<CustomSelectInput>`.

- **Import**: `import { useCustomSelect } from "@/hooks";`
- **Options**: `resource`, `optionLabel`, `optionValue`, `filters`, `sorters`.
- **Return Values**:
  - `options`: `SelectOption[]` array formatted for Ant Design dropdowns.
  - `selectProps`: Props passed directly to Antd `<Select {...selectProps} />`.
  - `queryResult`: Underlying query object.

```tsx
const { options: stationOptions } = useCustomSelect<DeviceStation>({
  resource: API_ENDPOINT.STATIONS.BASE,
  optionLabel: "name",
  optionValue: "id",
});
```

---

## 5. `useCustomData` & `useCustomMutationData` (Custom API Requests)

Dedicated to custom API endpoints outside standard REST CRUD patterns.

- **`useCustomData`** (GET Query):
  ```tsx
  const { data, isLoading, query } = useCustomData<StatsReport>({
    url: `${API_ENDPOINT.REPORTS.BASE}/summary`,
    method: "get",
  });
  ```
- **`useCustomMutationData`** (POST / PUT / PATCH / DELETE Mutation):
  ```tsx
  const { mutate, isLoading } = useCustomMutationData<TData, TVariables>();
  // Trigger mutation:
  mutate({
    url: `${API_ENDPOINT.DEVICES.BASE}/${id}/rotate-secret`,
    method: "post",
    values: {},
  });
  ```

---

## 6. Granular CRUD & Data Hooks

- **`useCustomOne`**: Fetch a single detailed record by ID with automatic error handling:
  ```tsx
  const { data: record, isLoading } = useCustomOne<Banner>({
    resource: API_ENDPOINT.BANNERS.BASE,
    id: bannerId,
    enabled: Boolean(bannerId),
  });
  ```
- **`useCustomList`**: Query a list of records with custom filter and sort criteria:
  ```tsx
  const { data: list, isLoading } = useCustomList<BannerCategory>({
    resource: API_ENDPOINT.BANNER_CATEGORIES.BASE,
    sorters: [{ field: "sortOrder", order: "asc" }],
  });
  ```
- **`useCustomDelete`**: Execute single or batch delete mutations:
  ```tsx
  const { handleDelete, isLoading } = useCustomDelete<Banner>({
    resource: API_ENDPOINT.BANNERS.BASE,
  });
  // Execute deletion:
  handleDelete({ id: "banner-id", onSuccess: () => tableQuery.refetch() });
  ```

---

## 7. Configuration & Parameter Hooks

- **`useSettings`**: Fetches dynamic tenant/application settings from `API_ENDPOINT.SETTINGS.BASE`, caching them in `localStorage` for instant hydration across page transitions:
  ```tsx
  const { settings, isLoading } = useSettings();
  ```
- **`useResourceService`**: Dynamically creates and caches a typed `ResourceService` instance for a specific API resource:
  ```tsx
  const bannerService = useResourceService<Banner>(API_ENDPOINT.BANNERS.BASE);
  ```
- **`useSearchParamsString`**: Memoizes and tracks URL search params as a stable serialized query string:
  ```tsx
  const searchParamsString = useSearchParamsString();
  ```

---

## 8. Permission & Authorization Hooks

- **`usePermission`**: Checks granular access rights against current user permissions:
  ```tsx
  const { can, canAny, canMap } = usePermission();
  const canDelete = can(PermissionGroups.DEVICES, PermissionActions.DELETE);
  const canManage = canAny(
    [PermissionGroups.DEVICES, PermissionActions.CREATE],
    [PermissionGroups.DEVICES, PermissionActions.UPDATE],
  );
  ```
- **`usePagePermissions`**: Evaluates complete CRUD permissions (`canRead`, `canCreate`, `canEdit`, `canDelete`, `canOperator`) for a given feature group:
  ```tsx
  const { canCreate, canEdit, canDelete, canRead } = usePagePermissions(PermissionGroups.WASH_MODES);
  ```
- **`useHasRole`**: Evaluates whether the current authenticated user has any of the specified roles:
  ```tsx
  const isSuperAdmin = useHasRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]);
  ```

---

## 9. Responsive & Utility Hooks

- **`useMediaQuery`**: Subscribes to window media queries and returns reactive boolean matches:
  ```tsx
  const isMobile = useMediaQuery("(max-width: 768px)");
  ```
- **`useDebounce`**: Debounces any fast-changing reactive state value:
  ```tsx
  const debouncedKeyword = useDebounce(keyword, 400);
  ```
- **`useDebounceSearch`**: Debounces search text input, triggers CRUD filter updates (`operator: "contains"`), and automatically resets the active table pagination back to page `1`:
  - **Import**: `import { useDebounceSearch } from "@/hooks";`
  - **Options**: `fieldName` (default: `"q"`), `debounceTime` (default: `500`), `setCurrentPage`, `setFilters`.
  - **Return**: `{ debouncedSearch: (value: string) => void }`.
  ```tsx
  const { debouncedSearch } = useDebounceSearch({
    fieldName: "q",
    debounceTime: 500,
    setCurrentPage,
    setFilters,
  });

  // Bound to FilterPanel / Input:
  <Input.Search
    placeholder={t("pages.devices.filters.searchPlaceholder")}
    onChange={(e) => debouncedSearch(e.target.value)}
  />
  ```
- **`useTableChange`**: Bridges Ant Design `<Table onChange={...}>` events with Refine's reactive state setters (`setPageSize`, `setCurrentPage`, `setSorters`), synchronizing pagination changes, sorting directions (`ascend` $\rightarrow$ `asc`, `descend` $\rightarrow$ `desc`), and sort resets:
  - **Import**: `import { useTableChange } from "@/hooks";`
  - **Options**: `setPageSize`, `setCurrentPage`, `setSorters`.
  - **Return**: `{ handleTableChange: TableProps<TRecord>["onChange"] }`.
  ```tsx
  const { handleTableChange } = useTableChange<Device>({
    setPageSize,
    setCurrentPage,
    setSorters,
  });

  <Table
    columns={columns}
    dataSource={dataSource}
    onChange={handleTableChange}
  />
  ```

---

## 10. Guidelines for Hook Usage

- ✅ **Encapsulate API & Data Logic in Page Hooks (`hooks/`)**:
  - Encapsulate Refine hooks (`useCustomTable`, `useCustomDrawerForm`, `useCustomSelect`), data mappings, and mutation triggers inside dedicated hooks in `src/pages/<feature>/hooks/` (e.g., `useFeaturePage.ts`).
  - Keep the Main Page component (`index.tsx`) focused exclusively on layout, column configuration, and presentation orchestration.
- ✅ **Enforce Custom Hooks**: Do not author raw `axios` or `fetch` calls directly inside UI components.
- ✅ **Hook Declaration Grouping**: Place hook declarations within the **State & Hooks** block sorted by line length.
- ✅ **Debug-Friendly Return**: Assign hook return properties and computed data transformations to descriptive variables prior to returning.
