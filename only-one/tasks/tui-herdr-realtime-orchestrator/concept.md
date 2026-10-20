---
slug: tui-herdr-realtime-orchestrator
created_at: 2026-10-20T14:18:33+07:00
status: concept
---

# Concept: TUI Realtime Task Watcher & Herdr Agent Orchestrator

## 1. Problem & Goal

### Problem (Current Bottlenecks & Deficiencies)
- **Context & Trigger**: User interacts with tasks via TUI, but task board only scans on initial launch.
- **Symptom & Defect**: Board requires manual restart to see new files. Pending tasks require manual execution in separate terminals.
- **Root Cause**: TUI lacks filesystem event watchers, process orchestration bindings, and global configuration storage.
- **Impact / Blast Radius**: Workflows stay fragmented. Users perform repetitive terminal commands and manual task cleanup.

### Goal (Target Technical Outcomes)
- **Core Goal**: Transform TUI into an interactive, realtime task dispatcher and lifecycle supervisor using Herdr.
- **Acceptance Criteria**:
  - Watch `only-one/tasks/` continuously and refresh board state without restart.
  - Dispatch pending tasks to target agents via Herdr CLI commands (`pane split`, `agent start`, `agent prompt`).
  - Read and persist user configurations in global `~/.only-one/config.json`.
  - Provide an interactive Settings screen within TUI to customize routing rules and cleanup thresholds.
  - Auto-archive completed tasks into `only-one/archives/` when completed task count exceeds configured threshold.

## 2. Scope Boundaries
- **In-Scope**:
  - Realtime filesystem watcher with debounced event processing for task files.
  - Interactive dispatch action (`[D]`) mapping phases to target AI agents via Herdr.
  - Global configuration storage schema at `~/.only-one/config.json`.
  - Dedicated interactive Settings view in TUI for cleanup policies and agent routing.
  - Herdr session detection (`HERDR_ENV`) with visual status indicators and safety fallbacks.
  - Configurable auto-archive engine triggered by task count thresholds.
- **Explicit Out-of-Scope**:
  - Direct AI API integration inside TUI (Herdr manages agent processes).
  - Background daemon process running independently when TUI exits.
  - Editing raw task markdown contents directly from TUI screens.

## 3. Proposed Solution & Core Mechanism

### Core Mechanism
The system adopts a Hybrid Herdr Context Engine architecture:
1. **Realtime Watcher Engine**: A background file watcher tracks directory modifications in `only-one/tasks/`. Debounced updates trigger state refreshes in the React Ink board.
2. **Global Configuration Manager**: Manages read/write operations for `~/.only-one/config.json`. Config defines agent routing tables and auto-archive thresholds.
3. **Interactive Settings Screen**: An accessible view (`[S]`) renders interactive controls. Users configure policies without manually modifying JSON files.
4. **Herdr Dispatch Supervisor**: Validates session context. When triggered, it splits a sibling pane, starts the designated agent, and passes the execution prompt.
5. **Lifecycle Cleaner Service**: Inspects task board state. When completed items exceed threshold, it automatically moves archived directories.

### Conceptual Flow & State Transitions
```mermaid
flowchart TD
    subgraph Filesystem
        Tasks["only-one/tasks/*"]
        Config["~/.only-one/config.json"]
        Archives["only-one/archives/"]
    end

    subgraph TUI["only-one TUI Engine"]
        Watcher["File Watcher"]
        BoardState["Board State Store"]
        Dispatcher["Herdr Dispatcher"]
        SettingsUI["Settings Screen"]
        CleanService["Lifecycle Cleaner"]
    end

    subgraph HerdrSession["Herdr Multiplexer"]
        SplitPane["Split Sibling Pane"]
        StartAgent["Start Assigned Agent"]
        SubmitPrompt["Submit Prompt to Agent"]
    end

    Tasks -->|Filesystem Events| Watcher
    Watcher -->|Debounced Update| BoardState
    Config <-->|Read / Write| SettingsUI
    Config -->|Routing Rules| Dispatcher
    Config -->|Threshold Rule| CleanService

    BoardState -->|User Triggers Dispatch [D]| Dispatcher
    Dispatcher -->|Check HERDR_ENV| SplitPane
    SplitPane --> StartAgent
    StartAgent --> SubmitPrompt

    BoardState -->|Done Tasks Exceed Threshold| CleanService
    CleanService -->|Move Task Directory| Archives
```

### UI Wireframes

#### 1. Realtime Task Board with Herdr Status
```text
┌─ ONLY-ONE TASK MANAGER ───────────────────────────────── [HERDR: CONNECTED] ─┐
│                                                                             │
│  [1] IDEA (1)        [2] PLAN (2)          [3] IMPLEMENT (1)   [4] DONE (6) │
│ ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ ┌───────────┐ │
│ │ auth-flow      │  │►tui-herdr-sync   │  │ payment-v2      │ │ init-cli  │ │
│ │ Pending        │  │  Ready to Run    │  │ Running (Claude)│ │ [Archived]│ │
│ └────────────────┘  ├──────────────────┤  └─────────────────┘ └───────────┘ │
│                     │ api-gateway      │                      │ ... +5 more │
│                     │ Pending          │                      └───────────┘ │
│                     └──────────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Task: tui-herdr-sync | Target Agent: antigravity (from config)              │
│ Status: Ready to dispatch | Clean trigger: 6 done tasks (Threshold: 5) ⚠️   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [↑↓←→] Navigate  [D] Dispatch via Herdr  [C] Clean Now  [S] Settings  [Q] Quit│
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. Interactive Settings Screen (`[S]`)
```text
┌─ ONLY-ONE SETTINGS (~/.only-one/config.json) ───────────────────────────────┐
│                                                                             │
│  1. AUTO-CLEAN POLICY                                                       │
│     ( ) Disabled                                                            │
│     (•) When Completed Tasks exceed threshold                               │
│         Threshold Count: [ 5 ] tasks                                        │
│     ( ) Immediately on task completion                                      │
│                                                                             │
│  2. AGENT DISPATCH ROUTING (HERDR)                                          │
│     Phase 'idea'      ──► Agent Kind: [ antigravity            ▼ ]          │
│     Phase 'plan'      ──► Agent Kind: [ antigravity            ▼ ]          │
│     Phase 'apply'     ──► Agent Kind: [ codex                  ▼ ]          │
│     Phase 'debug'     ──► Agent Kind: [ claudecode             ▼ ]          │
│                                                                             │
│  3. HERDR TOPOLOGY PREFERENCES                                              │
│     Split Direction:  (•) Right   ( ) Down                                  │
│     Focus on Spawn:   ( ) Yes     (•) No (Keep focus on TUI)                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Tab / ↑↓] Select Option   [Space / Enter] Toggle / Edit   [Esc / S] Save & Back│
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Critical Risks & Edge Cases
- **Non-Herdr Environments**: Running TUI outside Herdr causes dispatch commands to fail. The system inspects environment variables and displays clear fallback warnings.
- **Filesystem Write Debouncing**: Concurrent agent writes cause incomplete parse events. The watcher enforces debouncing windows before parsing tasks.
- **Agent Input Blocking**: Agents prompt users for interactive approvals. Panes launch side-by-side without focus hijacking so users can respond directly.
- **Missing Global Configuration**: Missing config files trigger automatic creation using safe default values.
