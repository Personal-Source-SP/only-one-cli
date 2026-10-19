---
domain: tui
version: 1.0.0
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
