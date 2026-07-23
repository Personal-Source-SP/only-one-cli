import type { ProgramDeps } from '@/cli/deps.js';
import { AllowedToolId } from '@/constants/allowed-tools.js';
import { PACKAGES } from '@assets/packages/index.js';
import { PLUGINS } from '@assets/plugins/index.js';
import { MCPS } from '@assets/mcps/index.js';
import { SKILLS } from '@assets/skills/index.js';
import { RULES } from '@assets/rules/index.js';
import type { PackageManifest, PluginManifest, RuleManifest } from '@assets/types.js';

export interface PreflightValidationResult {
    valid: boolean;
    errors: string[];
}

export interface DependencyPlan {
    packages: string[];
    plugins: string[];
    mcps: string[];
    skills: string[];
}

export const validateRuleDependenciesPreflight = (
    selectedRuleIds: string[],
    targetIds: AllowedToolId[],
    ruleManifests: RuleManifest[] = RULES,
    packageManifests: PackageManifest[] = PACKAGES,
    pluginManifests: PluginManifest[] = PLUGINS,
    mcpManifests: { id: string }[] = MCPS,
    skillManifests: { name: string }[] = SKILLS,
): PreflightValidationResult => {
    const errors: string[] = [];

    // Check for Codex target explicitly
    if (targetIds.includes(AllowedToolId.Codex)) {
        errors.push(`Target 'codex' does not support rule installation. Valid rule targets: antigravity, claude, cursor`);
    }

    for (const ruleId of selectedRuleIds) {
        const rule = ruleManifests.find((r) => r.id === ruleId);
        if (!rule) {
            errors.push(`Unknown rule ID '${ruleId}'`);
            continue;
        }

        // Verify target support for rule itself
        for (const targetId of targetIds) {
            if (!rule.supportedTargets.includes(targetId)) {
                errors.push(
                    `Rule '${ruleId}' does not support target '${targetId}'. Supported targets: ${rule.supportedTargets.join(', ')}`,
                );
            }
        }

        // Validate package dependencies
        for (const pkgId of rule.requiredPackages || []) {
            const pkg = packageManifests.find((p) => p.id === pkgId);
            if (!pkg) {
                errors.push(`Rule '${ruleId}' references unknown package dependency '${pkgId}'`);
            }
        }

        // Validate plugin dependencies
        for (const pluginId of rule.requiredPlugins || []) {
            const plugin = pluginManifests.find((p) => p.id === pluginId);
            if (!plugin) {
                errors.push(`Rule '${ruleId}' references unknown plugin dependency '${pluginId}'`);
            } else {
                for (const targetId of targetIds) {
                    if (!plugin.supportedTargets.includes(targetId)) {
                        errors.push(`Plugin dependency '${pluginId}' required by rule '${ruleId}' does not support target '${targetId}'`);
                    }
                }
            }
        }

        // Validate MCP dependencies
        for (const mcpId of rule.requiredMcps || []) {
            const mcp = mcpManifests.find((m) => m.id === mcpId);
            if (!mcp) {
                errors.push(`Rule '${ruleId}' references unknown MCP dependency '${mcpId}'`);
            }
        }

        // Validate Skill dependencies
        for (const skillName of rule.requiredSkills || []) {
            const skill = skillManifests.find((s) => s.name === skillName);
            if (!skill) {
                errors.push(`Rule '${ruleId}' references unknown Skill dependency '${skillName}'`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const buildDeduplicatedDependencyPlan = (selectedRuleIds: string[], ruleManifests: RuleManifest[] = RULES): DependencyPlan => {
    const packages = new Set<string>();
    const plugins = new Set<string>();
    const mcps = new Set<string>();
    const skills = new Set<string>();

    for (const ruleId of selectedRuleIds) {
        const rule = ruleManifests.find((r) => r.id === ruleId);
        if (!rule) continue;

        (rule.requiredPackages || []).forEach((p) => packages.add(p));
        (rule.requiredPlugins || []).forEach((p) => plugins.add(p));
        (rule.requiredMcps || []).forEach((m) => mcps.add(m));
        (rule.requiredSkills || []).forEach((s) => skills.add(s));
    }

    return {
        packages: Array.from(packages),
        plugins: Array.from(plugins),
        mcps: Array.from(mcps),
        skills: Array.from(skills),
    };
};
