export type ViewState = 'home' | 'doctor' | 'init' | 'skill' | 'mcp' | 'settings';

export interface MenuItem {
    label: string;
    value: string;
    description?: string;
    icon?: string;
}
