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
