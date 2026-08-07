export type ViewState =
    | 'home'
    | 'doctor'
    | 'init'
    | 'combo'
    | 'skill'
    | 'workflow'
    | 'rule'
    | 'plugin'
    | 'mcp'
    | 'setting-vs'
    | 'extensions-vs'
    | 'structure-generate'
    | 'update';

export interface MenuItem {
    label: string;
    value: string;
    description?: string;
    icon?: string;
}
