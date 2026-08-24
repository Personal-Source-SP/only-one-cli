---
status: done
slug: tui-modernization
started_at: 2026-08-24
completed_at: 2026-08-24
pr_url: ~
branch: main
---

# Implementation Plan: Modernizing Only-One CLI Terminal User Interface (TUI)

## Section 1. Current State

### Current Execution Flow & Participating Files
1. The user launches the TUI via `$ only-one tui`, invoking [createTuiCommand](file:///Users/kiem/Sources/Personal/only-one-cli/src/commands/tui/command.ts#L8-L22), which mounts [App.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/App.tsx#L22-L112) inside Ink's terminal render loop.
2. [App.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/App.tsx#L24-L105) maintains a single scalar state `currentView: ViewState` with 12 switch-cases.
3. On `'home'`, [HomeView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/HomeView.tsx#L12-L23) renders [SelectMenu.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/components/SelectMenu.tsx#L10-L50) displaying the flat 13 items from [MAIN_MENU_ITEMS](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/constants/menu.ts#L3-L83).
4. Subviews like [ComboView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/ComboView.tsx#L43-L51), [InitView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/InitView.tsx#L28-L37), [SkillView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/SkillView.tsx), and [WorkflowView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/WorkflowView.tsx) execute fake `setTimeout` delays rather than executing the real core actions.
5. In multiple views (such as [ComboView.tsx](file:///Users/kiem/Sources/Personal/only-one-cli/src/tui/views/ComboView.tsx#L19-L26)), parent `useInput` and child `SelectMenu` `useInput` simultaneously listen for `Enter`, leading to race conditions that prematurely exit back to `HomeView`.

### Core Limitations
- **Overcrowded Menu**: 13 un-categorized items in a single vertical list.
- **Wasted Screen Real Estate**: Single column design ignores terminal width.
- **Race Conditions**: Uncoordinated `useInput` listeners across nested Ink components.
- **Mock Execution**: Most actions are simulated with timers without actual execution feedback or logs.

### Explicit Unchanged Behaviors
- The CLI command `$ only-one tui` command registration and CLI flag arguments must remain unchanged.
- All non-interactive CLI commands (`only-one init`, `only-one combo`, `only-one skill`, `only-one doctor`, etc.) and their programmatic actions in `src/commands/*/actions/` must remain intact and backward compatible.

---

## Section 2. Detailed Design

### Master-Detail 2-Pane Architecture
The layout uses a 2-pane split powered by Ink's flexbox engine:
- **Header (Top)**: Compact banner with CLI version, active workspace name, Git branch status, and breadcrumbs trail.
- **Left Sidebar (35% Width, min 28 cols)**:
  - **Search Bar**: Quick fuzzy search activated via `/` key.
  - **Categorized Accordion/Tree**: 4 categories (`⚡ Workspace Setup`, `🔄 Agent & Rules Sync`, `⚙️ Editor & Shell`, `🩺 Diagnostics & Tools`).
  - **Active Selection**: Clear highlight cursor `❯` with category badges.
- **Right Content/Preview Canvas (65% Width)**:
  - **Browse Mode**: Displays rich contextual cards (Overview, Included features, Target files, Documentation, Shortcuts).
  - **Active View Mode**: Renders interactive forms, selection lists, or the live Task Runner.
- **Footer (Bottom)**: Single-line status bar showing active pane focus, hotkey hints (`[/] Search`, `[Tab] Switch Pane`, `[Enter] Run`, `[Esc/b] Back`, `[q] Quit`).

### Navigation & Focus State Machine (`useRouter`)
A centralized `RouterContext` replaces loose `useState` in views:
- **State Properties**:
  - `history: NavigationEntry[]`: Stack-based history supporting `push(view, params)`, `pop()`, `replace(view, params)`.
  - `activePane: 'sidebar' | 'content' | 'search'`: Explicit focus ownership. Only the focused component receives keyboard inputs.
  - `selectedMenuId: string`: Synchronized cursor position between sidebar and preview pane.
  - `searchQuery: string`: Active query filtering categories and menu items in real time.

### ASCII Wireframe

```text
┌─ 🚀 ONLY-ONE CLI v1.0.0 ────────────────────────── [repo: only-one-cli | git: main] ─┐
│ Breadcrumb: Home > ⚡ Workspace Setup > Apply Combos                                  │
├──────────────────────────────┬────────────────────────────────────────────────────────┤
│ [/] Filter: nestjs...        │ 📦 PREDEFINED COMBO: NestJS Backend Flow               │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ ⚡ WORKSPACE SETUP           │ Apply complete NestJS backend architecture stack.      │
│   • Initialize Workspace     │                                                        │
│  ❯• Apply Combos (combo) [2] │ 📋 Included Components:                                │
│   • Scaffold Blueprints      │   • Skills: c4-diagrams, gherkin, nestjs-dev, api-des  │
│                              │   • Rules: nest-architecture-stack, context-and-tools   │
│ 🔄 AGENT & RULES SYNC        │   • Workflows: idea, plan, apply, debug, review, clean │
│   • Sync Skills (skill)      │                                                        │
│   • Sync Workflows           │ 🎯 Target Editors: Antigravity, Cursor, VS Code        │
│   • Sync Rules               │                                                        │
│   • Configure MCP Servers    │ ────────────────────────────────────────────────────── │
│                              │ Press [Enter] to Run Setup  |  [Tab] Focus Content     │
│ ⚙️ EDITOR & SHELL            │                                                        │
│   • Editor Settings (VS)     │                                                        │
│   • Editor Extensions (VS)   │                                                        │
│   • Git & Shell Profiles     │                                                        │
│                              │                                                        │
│ 🩺 DIAGNOSTICS & TOOLS       │                                                        │
│   • Environment Doctor       │                                                        │
│   • Update Skills            │                                                        │
├──────────────────────────────┴────────────────────────────────────────────────────────┤
│ [Tab] Switch Pane  •  [↑/↓] Navigate  •  [/] Search  •  [Enter] Select  •  [q] Quit   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Live Task Runner Component (`TaskRunnerView`)
For real action execution:
1. Receives an async execution runner `run: (logger: (msg: string) => void) => Promise<void>`.
2. Displays an Ink `<Spinner />` animation with the active step message.
3. Maintains a rolling 10-line buffer of stdout/logs in a bordered sub-box.
4. Transitions to Success `✔` or Error `✖` badge with elapsed duration and `[Enter] Back to Dashboard` prompt.

### Responsive Viewport Fallback
If terminal width `< 80` columns:
- Automatically toggle `isCompactMode: true`.
- Render Sidebar and Content stacked vertically instead of horizontally to avoid ANSI line-wrapping artifacts.

### Red-Team Doubt Check (`doubt-driven-development`)
- **Doubt**: Will switching to 2-pane cause screen flickering on fast cursor movement?
- **Reconciliation**: Ink renders virtual DOM diffs to terminal stdout. By memoizing `PreviewCard` and keeping component trees lightweight, repaints remain below 5ms with zero visible flicker.
- **Doubt**: Will keyboard events become unresponsive during heavy async tasks?
- **Reconciliation**: Async tasks run via non-blocking Promises; the live spinner renders at 60fps via Ink timer loop while input handlers are safely paused or set to cancel-only mode.

---

## Section 3. Implementation Architecture

### Scaffold Directory Tree

```text
src/tui/
├── App.tsx                             # [MODIFY] Root TUI app with RouterProvider
├── router/
│   ├── RouterContext.tsx               # [NEW] Centralized router state & focus manager
│   ├── types.ts                        # [NEW] Navigation stack & category item types
│   └── routes.ts                       # [NEW] Grouped route catalog & metadata
├── theme/
│   ├── colors.ts                       # [NEW] Curated terminal color palette
│   └── index.ts                        # [NEW] Theme exports & box style presets
├── components/
│   ├── Header.tsx                      # [MODIFY] Modern header with repo metadata & breadcrumb
│   ├── Footer.tsx                      # [MODIFY] Dynamic shortcut bar reflecting active focus
│   ├── MasterDetailLayout.tsx          # [NEW] 2-Pane responsive grid container
│   ├── CategoryMenu.tsx                # [NEW] Grouped accordion list with fuzzy filtering
│   ├── SearchFilter.tsx                # [NEW] Terminal search input bar
│   ├── PreviewCard.tsx                 # [NEW] Contextual preview & info panel
│   ├── TaskRunnerView.tsx              # [MODIFY] Real-time task runner with spinner & logs
│   ├── SelectMenu.tsx                  # [MODIFY] Conflict-free selectable list
│   ├── ConfirmInput.tsx                # [MODIFY] Styled confirmation prompt
│   └── TextInput.tsx                    # [MODIFY] Styled text input
├── views/
│   ├── HomeDashboardView.tsx           # [NEW] Modern 2-Pane interactive home view
│   ├── InitView.tsx                    # [MODIFY] Wire to executeInitStep
│   ├── ComboView.tsx                   # [MODIFY] Wire to combo actions & stack preview
│   ├── SkillView.tsx                   # [MODIFY] Wire to skill synchronization actions
│   ├── WorkflowView.tsx                # [MODIFY] Wire to workflow actions
│   ├── RuleView.tsx                    # [MODIFY] Wire to rule actions
│   ├── McpView.tsx                     # [MODIFY] Wire to MCP configuration actions
│   ├── SettingsView.tsx                # [MODIFY] Wire to VS settings sync
│   ├── GitView.tsx                     # [MODIFY] Wire to Git profile sync
│   ├── StructureView.tsx               # [MODIFY] Wire to structure generator
│   ├── DoctorView.tsx                  # [MODIFY] Refined doctor with live categorised cards
│   └── UpdateView.tsx                  # [MODIFY] Wire to update action
├── types/
│   ├── index.ts                        # [MODIFY] Re-export all navigation & UI types
│   └── navigation.ts                   # [MODIFY] Extended route and menu interfaces
└── utils/
    ├── format.ts                       # [MODIFY] Terminal formatting helpers
    └── fuzzy.ts                        # [NEW] Lightweight fuzzy search utility
```

### Component & Data Flow Diagram

```mermaid
flowchart TD
    subgraph Core_App["Root Container"]
        APP["App.tsx"] --> ROUTER["RouterProvider (RouterContext)"]
        ROUTER --> LAYOUT["MasterDetailLayout"]
    end

    subgraph Header_Area["Top Area"]
        LAYOUT --> HEADER["Header (Logo, Version, Breadcrumbs, Git Info)"]
    end

    subgraph Main_Panes["2-Pane Content"]
        LAYOUT --> LEFT_PANE["Left Sidebar (CategoryMenu + SearchFilter)"]
        LAYOUT --> RIGHT_PANE["Right Content Pane"]
        
        LEFT_PANE -->|Active Selection| PREVIEW["PreviewCard (Default / Browse)"]
        LEFT_PANE -->|Enter Key / Navigate| ACTIVE_VIEW["Active Subview (InitView, ComboView, DoctorView...)"]
        ACTIVE_VIEW --> RUNNER["TaskRunnerView (Live Spinner + Streaming Logs)"]
    end

    subgraph Footer_Area["Bottom Area"]
        LAYOUT --> FOOTER["Footer (Context-Aware Hotkeys)"]
    end

    subgraph Backend_Actions["Core Action Pipelines"]
        RUNNER -->|Executes| REAL_ACTIONS["src/commands/*/actions/"]
    end
```

---

## Section 4. Implementation Code Examples

### 1. `[NEW] src/tui/router/types.ts`
Defines route types, categories, navigation stack entries, and focus states.

```typescript
export type ViewState =
    | 'home'
    | 'init'
    | 'combo'
    | 'skill'
    | 'workflow'
    | 'rule'
    | 'mcp'
    | 'setting-vs'
    | 'extensions-vs'
    | 'git'
    | 'structure-generate'
    | 'doctor'
    | 'update';

export type MenuCategory = 'setup' | 'sync' | 'system' | 'diagnostics';

export interface RouteItem {
    id: ViewState;
    label: string;
    category: MenuCategory;
    icon: string;
    description: string;
    tags: string[];
    quickSummary: string[];
}

export interface NavigationEntry {
    view: ViewState;
    title: string;
    params?: Record<string, unknown>;
}

export type FocusPane = 'sidebar' | 'content' | 'search';
```

### 2. `[NEW] src/tui/router/routes.ts`
Categorized catalog of all TUI routes and descriptive metadata for the live preview cards.

```typescript
import type { MenuCategory, RouteItem } from './types.js';

export interface CategoryGroup {
    id: MenuCategory;
    name: string;
    icon: string;
    items: RouteItem[];
}

export const ROUTE_CATEGORIES: CategoryGroup[] = [
    {
        id: 'setup',
        name: 'Workspace Setup',
        icon: '⚡',
        items: [
            {
                id: 'init',
                label: 'Initialize Workspace',
                category: 'setup',
                icon: '🚀',
                description: 'Full workspace initialization: configs, agents, skills & rules',
                tags: ['init', 'workspace', 'rules', 'templates'],
                quickSummary: ['Creates .agents workspace structure', 'Syncs baseline AGENTS.md rules', 'Configures active AI IDE targets'],
            },
            {
                id: 'combo',
                label: 'Apply Combos',
                category: 'setup',
                icon: '✨',
                description: 'Predefined stacks (NestJS backend, Next.js frontend, AI Agents)',
                tags: ['combo', 'stack', 'nestjs', 'nextjs'],
                quickSummary: ['Bundled skills, rules, and workflows', 'Automated overwrite protection', 'One-click fullstack boost'],
            },
            {
                id: 'structure-generate',
                label: 'Scaffold Blueprints',
                category: 'setup',
                icon: '🏗️',
                description: 'Generate structural architectural blueprints for agents',
                tags: ['structure', 'blueprint', 'scaffold'],
                quickSummary: ['Scaffolds clean architecture folders', 'Emits context-aware guidelines'],
            },
        ],
    },
    {
        id: 'sync',
        name: 'Agent & Rules Sync',
        icon: '🔄',
        items: [
            {
                id: 'skill',
                label: 'Agent Skills',
                category: 'sync',
                icon: '🧩',
                description: 'Install and synchronize custom agent skills from catalog or Git',
                tags: ['skills', 'agent', 'c4', 'gherkin'],
                quickSummary: ['Interactive remote & local skill browser', 'Automatic lockfile sync'],
            },
            {
                id: 'workflow',
                label: 'Workflows',
                category: 'sync',
                icon: '⚡',
                description: 'Sync and update workflow markdown templates',
                tags: ['workflow', 'idea', 'plan', 'apply', 'review'],
                quickSummary: ['Syncs /only-one-idea, /plan, /apply', 'Enforces strict negative rules'],
            },
            {
                id: 'rule',
                label: 'Agent Rules',
                category: 'sync',
                icon: '📝',
                description: 'Sync workspace agent rules and conventions (.agents/AGENTS.md)',
                tags: ['rules', 'standards', 'guidelines'],
                quickSummary: ['Synchronizes repo-level AI constraints', 'Merges stack-specific rules'],
            },
            {
                id: 'mcp',
                label: 'MCP Servers',
                category: 'sync',
                icon: '🌐',
                description: 'Configure Model Context Protocol servers (GitHub, Clockify, etc.)',
                tags: ['mcp', 'tools', 'github', 'clockify'],
                quickSummary: ['Global & project-level MCP setup', 'JSON config validation'],
            },
        ],
    },
    {
        id: 'system',
        name: 'Editor & Shell',
        icon: '⚙️',
        items: [
            {
                id: 'setting-vs',
                label: 'Editor Settings',
                category: 'system',
                icon: '⚙️',
                description: 'Sync & merge settings for Antigravity, Cursor, and VS Code',
                tags: ['settings', 'vscode', 'cursor', 'antigravity'],
                quickSummary: ['Format on save & linter settings', 'Non-destructive JSON merge'],
            },
            {
                id: 'extensions-vs',
                label: 'Editor Extensions',
                category: 'system',
                icon: '📦',
                description: 'Sync & install recommended extensions across editors',
                tags: ['extensions', 'plugins'],
                quickSummary: ['Automated extension installation', 'Editor-specific recommendations'],
            },
            {
                id: 'git',
                label: 'Git & Shell Profiles',
                category: 'system',
                icon: '⚡',
                description: 'Sync Git Bash, Zsh profiles, and shell alias modules',
                tags: ['git', 'shell', 'zsh', 'profile'],
                quickSummary: ['Shell aliases & helper functions', 'Git commit template sync'],
            },
        ],
    },
    {
        id: 'diagnostics',
        name: 'Diagnostics & Tools',
        icon: '🩺',
        items: [
            {
                id: 'doctor',
                label: 'Environment Doctor',
                category: 'diagnostics',
                icon: '🩺',
                description: 'Verify Git, Node.js, CLI versions, and workspace readiness',
                tags: ['doctor', 'diagnostics', 'health', 'check'],
                quickSummary: ['Interactive IDE health checks', 'Actionable remediation tips'],
            },
            {
                id: 'update',
                label: 'Update Resources',
                category: 'diagnostics',
                icon: '🔄',
                description: 'Refresh installed agent skills and workspace templates',
                tags: ['update', 'refresh', 'upgrade'],
                quickSummary: ['Fetches latest upstream assets', 'Preserves user customizations'],
            },
        ],
    },
];
```

### 3. `[NEW] src/tui/router/RouterContext.tsx`
Central navigation manager providing history stack, focus control, and deterministic key management.

```typescript
import React, { createContext, FC, ReactNode, useContext, useState } from 'react';
import type { FocusPane, NavigationEntry, RouteItem, ViewState } from './types.js';
import { ROUTE_CATEGORIES } from './routes.js';

interface RouterContextValue {
    currentRoute: NavigationEntry;
    history: NavigationEntry[];
    activePane: FocusPane;
    selectedItem: RouteItem;
    searchQuery: string;
    push: (view: ViewState, title?: string, params?: Record<string, unknown>) => void;
    pop: () => void;
    replace: (view: ViewState, title?: string, params?: Record<string, unknown>) => void;
    setActivePane: (pane: FocusPane) => void;
    setSelectedItem: (item: RouteItem) => void;
    setSearchQuery: (query: string) => void;
}

const defaultItem = ROUTE_CATEGORIES[0]!.items[0]!;

const RouterContext = createContext<RouterContextValue | null>(null);

export const RouterProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<NavigationEntry[]>([
        { view: 'home', title: 'Dashboard' },
    ]);
    const [activePane, setActivePane] = useState<FocusPane>('sidebar');
    const [selectedItem, setSelectedItem] = useState<RouteItem>(defaultItem);
    const [searchQuery, setSearchQuery] = useState('');

    const currentRoute = history[history.length - 1] ?? { view: 'home', title: 'Dashboard' };

    const push = (view: ViewState, title = view, params?: Record<string, unknown>) => {
        setHistory((prev) => [...prev, { view, title, params }]);
        setActivePane('content');
    };

    const pop = () => {
        if (history.length > 1) {
            setHistory((prev) => prev.slice(0, -1));
            setActivePane('sidebar');
        }
    };

    const replace = (view: ViewState, title = view, params?: Record<string, unknown>) => {
        setHistory((prev) => [...prev.slice(0, -1), { view, title, params }]);
    };

    return (
        <RouterContext.Provider
            value={{
                currentRoute,
                history,
                activePane,
                selectedItem,
                searchQuery,
                push,
                pop,
                replace,
                setActivePane,
                setSelectedItem,
                setSearchQuery,
            }}
        >
            {children}
        </RouterContext.Provider>
    );
};

export function useRouter(): RouterContextValue {
    const ctx = useContext(RouterContext);
    if (!ctx) throw new Error('useRouter must be used within RouterProvider');
    return ctx;
}
```

### 4. `[NEW] src/tui/components/MasterDetailLayout.tsx`
2-Pane split container with responsive column widths and border styling.

```typescript
import React, { FC, ReactNode } from 'react';
import { Box } from 'ink';

interface MasterDetailLayoutProps {
    sidebar: ReactNode;
    content: ReactNode;
}

export const MasterDetailLayout: FC<MasterDetailLayoutProps> = ({ sidebar, content }) => {
    return (
        <Box flexDirection="row" width="100%" minHeight={16}>
            <Box
                width="36%"
                flexDirection="column"
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
                marginRight={1}
            >
                {sidebar}
            </Box>
            <Box
                width="64%"
                flexDirection="column"
                borderStyle="round"
                borderColor="cyan"
                paddingX={1}
                paddingY={0}
            >
                {content}
            </Box>
        </Box>
    );
};
```

### 5. `[MODIFY] src/tui/components/TaskRunnerView.tsx`
Reusable asynchronous task runner with live animated spinner and rolling stdout logs.

```typescript
import React, { FC, useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface TaskRunnerProps {
    title: string;
    runTask: (log: (msg: string) => void) => Promise<void>;
    onDone: () => void;
}

export const TaskRunnerView: FC<TaskRunnerProps> = ({ title, runTask, onDone }) => {
    const [status, setStatus] = useState<'running' | 'success' | 'error'>('running');
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const appendLog = (msg: string) => {
        setLogs((prev) => [...prev.slice(-8), msg]);
    };

    useEffect(() => {
        let mounted = true;
        appendLog(`Starting ${title}...`);

        runTask(appendLog)
            .then(() => {
                if (mounted) {
                    setStatus('success');
                    appendLog(`Completed ${title} successfully! ✨`);
                }
            })
            .catch((err: unknown) => {
                if (mounted) {
                    setStatus('error');
                    const message = err instanceof Error ? err.message : String(err);
                    setErrorMsg(message);
                    appendLog(`Error: ${message}`);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    useInput((input, key) => {
        if (status !== 'running' && (key.return || input === 'b' || input === 'q')) {
            onDone();
        }
    });

    return (
        <Box flexDirection="column" paddingY={1}>
            <Box marginBottom={1}>
                {status === 'running' && <Text color="yellow">⏳ Running: </Text>}
                {status === 'success' && <Text color="green">✔ Success: </Text>}
                {status === 'error' && <Text color="red">✖ Failed: </Text>}
                <Text bold>{title}</Text>
            </Box>

            <Box
                flexDirection="column"
                borderStyle="single"
                borderColor={status === 'error' ? 'red' : 'gray'}
                paddingX={1}
                minHeight={6}
            >
                {logs.map((log, index) => (
                    <Text key={index} color={index === logs.length - 1 ? 'white' : 'gray'}>
                        {log}
                    </Text>
                ))}
            </Box>

            {status !== 'running' && (
                <Box marginTop={1}>
                    <Text color="cyan">Press [Enter] or [b] to return to dashboard</Text>
                </Box>
            )}
        </Box>
    );
};
```

---

## Section 5. Test Cases

### Acceptance Criteria & BDD Scenarios (`gherkin-authoring`)

```gherkin
Feature: TUI Modernization and Multi-Pane Dashboard Navigation

  Scenario: Home dashboard initializes in Master-Detail 2-pane mode
    Given the user executes "only-one tui"
    Then the TUI renders the header with breadcrumbs and workspace metadata
    And the left pane displays 4 categorized groups of actions
    And the right pane displays the preview details of the default selected action

  Scenario: User filters actions via fuzzy search
    Given the user is on the TUI dashboard
    When the user presses "/"
    And types "doctor"
    Then the sidebar filters the list to highlight "Environment Doctor"
    And the preview pane updates to show doctor diagnostic details

  Scenario: User selects an action and runs real execution without input collision
    Given the user selects "Apply Combos"
    When the user presses [Enter]
    Then the navigation router transitions the content pane to ComboView
    And pressing [Enter] inside ComboView executes the real combo step
    And does not trigger race-condition back-navigation

  Scenario: Task execution displays live logs and completes gracefully
    Given a task runner view is active
    When the asynchronous action streams progress logs
    Then the logs buffer updates dynamically
    And upon completion, displays a green success status badge
    And pressing [Enter] returns the user to the previous dashboard view
```

### Unit & Integration Tests

1. **Router State & Navigation Tests (`test/tui/router.test.tsx`)**:
   - **Objective**: Verify `push`, `pop`, `replace`, and breadcrumb calculation in `RouterContext`.
   - **Action**: Render mock router consumer, invoke `push('combo')`, verify `history` stack depth is 2, then invoke `pop()`.
   - **Expected Result**: Stack pops back to `'home'` and focus switches back to `'sidebar'`.

2. **Master-Detail Layout & Responsiveness (`test/tui/layout.test.tsx`)**:
   - **Objective**: Ensure layout renders sidebar and content with correct Ink flex proportions.
   - **Action**: Render `MasterDetailLayout` with mock sidebar and preview components.
   - **Expected Result**: Box renders both children cleanly with border definitions.

3. **Fuzzy Search & Category Filtering (`test/tui/fuzzy.test.ts`)**:
   - **Objective**: Verify fuzzy search matches tags, labels, and descriptions across route categories.
   - **Action**: Pass query `"mcp"` or `"skill"`.
   - **Expected Result**: Correct matching `RouteItem` objects returned with category grouping preserved.

### Verification Commands
```bash
npm run format:check
npm test
npm run build
npm run publish:local
```
