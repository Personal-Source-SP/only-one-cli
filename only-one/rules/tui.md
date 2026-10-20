---
domain: tui
version: 1.1.0
triggers:
  - "src/tui/**"
  - "src/prompts/**"
---

# Rules: Terminal User Interface (TUI) & Prompts

### TUI-001: Focus Lock on Global Enter Key
- **MUST_DO**: Route keyboard events through an active focus lock when parent and child both register `useInput`.
- **NEVER_DO**: Attach global Enter listeners at the parent level without routing isolation.
- **RATIONALE**: Prevents race conditions terminating the view before child action execution completes.

### TUI-002: Curated Component Reuse Over Raw Elements
- **MUST_DO**: Utilize shared Ink layout primitives and curated component wrappers.
- **NEVER_DO**: Construct deep raw box hierarchies that duplicate shared view components.
- **RATIONALE**: Maintains terminal layout consistency and prevents text wrapping overflow bugs.

### TUI-003: Ink Layout Primitives and Margin Constraints
- **MUST_DO**: Apply margin and layout spacing props (`margin`, `marginBottom`, `marginTop`, `marginX`, `padding`) exclusively to `<Box>` elements in Ink.
- **NEVER_DO**: Apply margin props to Ink `<Text>` components.
- **RATIONALE**: Ink's `<Text>` component ignores or misbehaves on box model margin styling, breaking terminal UI layouts.

### TUI-004: Decoupled Herdr Routing Properties
- **MUST_DO**: Model Herdr phase routing with decoupled `pane` (target pane ID or 'auto') and `cli` (tool name) fields via `normalizePhaseRoute`.
- **NEVER_DO**: Store raw overloaded strings combining pane and CLI tool in configuration without normalization.
- **RATIONALE**: Decouples execution binary selection from terminal pane routing, enabling independent switching.

### TUI-005: 4-Column Kanban Lifecycle Invariant
- **MUST_DO**: Maintain the 4 standard Kanban columns: `concept`, `plan`, `processing`, and `done`.
- **NEVER_DO**: Introduce intermediate or ad-hoc column names (such as `review`) that deviate from the standard 4-column model.
- **RATIONALE**: Ensures consistent task tracking across all workflows and clean automatic filtering of completed tasks.
