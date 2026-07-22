import { describe, expect, it } from 'vitest';
import { ALLOWED_TOOL_IDS, AllowedToolCapability, AllowedToolId } from '@src/constants/index.js';
import {
    ALLOWED_TARGETS,
    assertAllowedTargetBackings,
    getAllowedAgentTargets,
    getAllowedMcpTargets,
    getAllowedVsExtensionsTargets,
    getAllowedVsSettingsTargets,
} from '@src/core/target-selection/index.js';

describe('allowed target catalog', () => {
    it('keeps unique IDs in stable display order', () => {
        expect(ALLOWED_TOOL_IDS).toEqual([AllowedToolId.Antigravity, AllowedToolId.Claude, AllowedToolId.Cursor, AllowedToolId.Codex]);
        expect(new Set(ALLOWED_TOOL_IDS)).toHaveLength(ALLOWED_TOOL_IDS.length);
        expect(ALLOWED_TARGETS.map((target) => target.id)).toEqual(ALLOWED_TOOL_IDS);
    });

    it('resolves capability subsets in allowlist order', () => {
        expect(getAllowedAgentTargets().map((target) => target.id)).toEqual(ALLOWED_TOOL_IDS);
        expect(getAllowedMcpTargets().map((target) => target.id)).toEqual(ALLOWED_TOOL_IDS);
        expect(getAllowedVsSettingsTargets().map((target) => target.id)).toEqual([AllowedToolId.Antigravity, AllowedToolId.Cursor]);
        expect(getAllowedVsExtensionsTargets().map((target) => target.id)).toEqual([AllowedToolId.Antigravity, AllowedToolId.Cursor]);
    });

    it('requires implementation backings for declared capabilities', () => {
        expect(assertAllowedTargetBackings).not.toThrow();
        expect(() =>
            assertAllowedTargetBackings([
                {
                    capabilities: [AllowedToolCapability.Mcp],
                    id: AllowedToolId.Claude,
                },
            ]),
        ).toThrow("Missing MCP backing for allowed target 'claude'");
    });
});
