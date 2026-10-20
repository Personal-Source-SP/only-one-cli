export type AssetCategory = 'combo' | 'skill' | 'rule' | 'package' | 'config' | 'mcp' | 'hook' | 'git' | 'vs' | 'ignore' | 'eslint';

export type WizardFocusArea = 'header-ide' | 'header-overwrite' | 'sidebar' | 'content';

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
    selectedCombos?: string[];
    selectedMcps?: string[];
    selectedHooks?: string[];
    selectedGit?: string[];
    selectedVs?: string[];
    selectedIgnore?: string[];
    selectedEslint?: string[];
    confirmed: boolean;
}
