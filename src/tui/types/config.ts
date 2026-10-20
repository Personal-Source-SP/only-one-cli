export interface CleanPolicy {
    enabled: boolean;
    trigger: 'threshold' | 'immediate';
    thresholdCount: number;
}

export interface PhaseAgentRoute {
    pane: string; // 'auto' | 'w4:p1' | 'w4:p4' ...
    cli: string; // 'agy' | 'codex' | 'claude' | 'cursor' | 'gemini'
}

export interface AgentRoutingConfig {
    concept: PhaseAgentRoute;
    plan: PhaseAgentRoute;
    apply: PhaseAgentRoute;
    debug: PhaseAgentRoute;
    review: PhaseAgentRoute;
    clean?: PhaseAgentRoute;
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
        concept: { pane: 'auto', cli: 'agy' },
        plan: { pane: 'auto', cli: 'agy' },
        apply: { pane: 'auto', cli: 'codex' },
        debug: { pane: 'auto', cli: 'claude' },
        review: { pane: 'auto', cli: 'claude' },
        clean: { pane: 'auto', cli: 'agy' },
    },
    herdr: {
        splitDirection: 'right',
        focusOnSpawn: false,
    },
};
