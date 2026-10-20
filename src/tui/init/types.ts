export type AssetCategory = 'rule' | 'skill' | 'config' | 'package' | 'combo';

export type WizardFocusArea = 'header-ide' | 'header-overwrite' | 'list';

export interface IdeTargetOption {
    id: string;
    label: string;
    selected: boolean;
}

export interface ResourceItem {
    id: string;
    name: string;
    description: string;
    category: AssetCategory;
    isInstalled: boolean;
    selected: boolean;
    target?: string;
}

export interface InitWizardResult {
    selectedTools: string[];
    overwrite: boolean;
    selectedRules: Record<string, string[]>;
    selectedSkills: string[];
    selectedConfigs: string[];
    selectedPackages: string[];
    confirmed: boolean;
}
