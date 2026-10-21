---
domain: tui
version: 1.4.0
triggers:
  - "packages/tui-engine/**"
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

### TUI-006: Target Pane Verification Before Split Dispatch
- **MUST_DO**: Verify target pane existence against the full session pane collection (`listHerdrPanes`) and reuse existing pane terminals before invoking split commands.
- **NEVER_DO**: Filter target panes only against active agent lists (`listHerdrAgents`) or unconditionally trigger split commands when a target pane is configured.
- **RATIONALE**: Plain shell terminals (`pwsh`, `cmd`, `bash`) do not run an active agent until initialized, causing false negatives and duplicate terminal panes.

### TUI-007: Dispatch Clean Workflows via Herdr Agent Routing
- **MUST_DO**: Dispatch the `/only-one-clean` workflow command to the configured clean agent pane through Herdr process orchestration when triggering cleanup.
- **NEVER_DO**: Delete or mutate task folder archives directly within the TUI process execution thread.
- **RATIONALE**: Clean workflows require knowledge audit, rule distillation, and git synchronization handled safely by the clean workflow agent.

### TUI-008: Native OS Syscalls Over Shell Spawning for Metrics
- **MUST_DO**: Query system metrics (CPU, RAM, Uptime) via native OS APIs (e.g. Windows syscalls `GlobalMemoryStatusEx`) with lightweight platform fallback stubs in TUI event loops.
- **NEVER_DO**: Spawn external shell processes (such as `powershell.exe` or `wmic`) inside high-frequency TUI tick loops to collect CPU or RAM stats.
- **RATIONALE**: Heavy process creation overhead introduces CPU spikes, UI frame drops, and terminal redraw stutter.

### TUI-009: Non-Blocking Cached Extraction for External CLI Metadata
- **MUST_DO**: Query external CLI telemetry (such as agent quotas or session lists) with asynchronous background execution, graceful timeout, and in-memory TTL caching.
- **NEVER_DO**: Execute synchronous external CLI calls directly on the primary Bubble Tea render or tick thread.
- **RATIONALE**: Slow external CLI tools or network latency freeze the terminal UI and drop user keyboard/mouse input frames.

### TUI-010: Strip ANSI Escape Codes Before Formatting Terminal Status
- **MUST_DO**: Clean and strip raw ANSI escape sequences (`\x1b\[...`) and cursor control codes from external terminal logs before rendering inside Lipgloss bordered boxes.
- **NEVER_DO**: Inject raw terminal buffer streams directly into Lipgloss or Bubble Tea layout blocks.
- **RATIONALE**: Raw ANSI codes distort Lipgloss width calculation, produce line wrap anomalies, and break box borders.

### TUI-011: Dedicated Multi-Line Presentation for Concurrent Agent Processes
- **MUST_DO**: Render concurrent background/worker agent jobs on dedicated discrete lines with individual spinners, elapsed durations, and cleaned action logs.
- **NEVER_DO**: Overload concurrent progress updates into a single truncated string or overwrite previous active jobs.
- **RATIONALE**: Preserves clear operator observability across multiple parallel dispatch panes simultaneously.
