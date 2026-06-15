import { statSync } from 'node:fs';
import { join } from 'node:path';
import { AI_TOOLS, type AgentToolOption } from './tools.js';

/**
 * Ported from open-spec-source/src/core/available-tools.ts
 */
export const getAvailableTools = (projectPath: string): AgentToolOption[] =>
    AI_TOOLS.filter((tool) => tool.available !== false).filter((tool) => {
        if (!tool.skillsDir) {
            return false;
        }

        if (tool.detectionPaths?.length) {
            return tool.detectionPaths.some((p) => {
                try {
                    statSync(join(projectPath, p));
                    return true;
                } catch {
                    return false;
                }
            });
        }

        try {
            return statSync(join(projectPath, tool.skillsDir)).isDirectory();
        } catch {
            return false;
        }
    });
