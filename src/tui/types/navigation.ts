export type ViewState =
    | 'home'
    | 'doctor'
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
    | 'update';

export interface MenuItem {
    label: string;
    value: string;
    description?: string;
    icon?: string;
}
