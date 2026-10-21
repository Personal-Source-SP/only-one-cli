# i18n & Constants Reference

## Internationalization (i18n) & Constants Standards

### 1. Translation Key Taxonomy (`pages.<feature>.*`)
Every feature page MUST organize its i18n localization keys under the standardized `pages.<feature>.*` prefix:

- **`actions`**: Buttons and interactive triggers (e.g., `pages.washModes.actions.create`).
- **`columns`**: Table header labels for `ListTable` (e.g., `pages.washModes.columns.name`).
- **`filters`**: Labels and placeholders for search/filter fields (e.g., `pages.washModes.filters.searchPlaceholder`).
- **`status`**: State representations rendered within Badges/Tags (e.g., `pages.washModes.status.active`).
- **`content`**: Titles for Drawers/Modals and general prose (e.g., `pages.washModes.content.createTitle`).
- **`notifications`**: Toast and modal alerts:
  - **`success`**: Confirmations for creation, update, and deletion (`pages.washModes.notifications.success.create`).
  - **`error`**: Business exception and system failure messages (`pages.washModes.notifications.error.create`).
- **`form`**: Form field language resources partitioned into:
  - **`labels`**: Form item label text (`pages.washModes.form.labels.name`).
  - **`placeholders`**: Input field placeholders (`pages.washModes.form.placeholders.name`).
  - **`rules`**: Validation feedback messages (`pages.washModes.form.rules.nameRequired`).

### 2. Custom Key Groupings
For specialized components not fitting standard form/table groupings (e.g., step wizards, credentials drawers):
- **Location**: Define top-level sibling groups under `pages.<feature>.*` (e.g., `pages.devices.credentialsDrawer`, `pages.devices.connectionSteps`).
- **Purpose**: Maintain shallow nesting hierarchies and avoid bloating standard dictionary groups.

### 3. Code Integration Guidelines
- ✅ **i18next Integration**:
  - Access translations via `const { t } = useTranslation()`.
  - ALWAYS wrap `columns`, `filters`, `actions`, and dropdown `options` invoking `t(...)` in `useMemo` to eliminate unnecessary re-render overhead.
- ✅ **Constants**:
  - Define static column widths (`MODE_COLUMN_WIDTH`), column index keys (`MODE_COLUMN_INDEX`), and fixed default values in the page's `constants.ts` file.
