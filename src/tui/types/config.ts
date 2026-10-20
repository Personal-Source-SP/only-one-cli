export interface CleanPolicy {
    enabled: boolean;
    trigger: 'threshold' | 'immediate';
    thresholdCount: number;
}

export interface AgentRoutingConfig {
    concept: string;
    plan: string;
    apply: string;
    debug: string;
    review: string;
    clean?: string;
}

export interface HerdrConfig {
    splitDirection: 'right' | 'down';
    focusOnSpawn: boolean;
}

export interface OnlyOneGlobalConfig {
    schemaVersion: number;
    cleanPolicy: CleanPolicy;
    agentRouting: AgentRoutingConfig;
    herdr: HerdrConfig;
}

export const DEFAULT_GLOBAL_CONFIG: OnlyOneGlobalConfig = {
    schemaVersion: 1,
    cleanPolicy: {
        enabled: true,
        trigger: 'threshold',
        thresholdCount: 5,
    },
    agentRouting: {
        concept: 'antigravity',
        plan: 'antigravity',
        apply: 'codex',
        debug: 'claudecode',
        review: 'claudecode',
        clean: 'antigravity',
    },
    herdr: {
        splitDirection: 'right',
        focusOnSpawn: false,
    },
};
