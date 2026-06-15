import { amazonQCommandAdapter } from './adapters/amazon-q.js';
import { antigravityCommandAdapter } from './adapters/antigravity.js';
import { auggieCommandAdapter } from './adapters/auggie.js';
import { bobCommandAdapter } from './adapters/bob.js';
import { claudeCommandAdapter } from './adapters/claude.js';
import { clineCommandAdapter } from './adapters/cline.js';
import { codebuddyCommandAdapter } from './adapters/codebuddy.js';
import { codexCommandAdapter } from './adapters/codex.js';
import { continueCommandAdapter } from './adapters/continue.js';
import { costrictCommandAdapter } from './adapters/costrict.js';
import { crushCommandAdapter } from './adapters/crush.js';
import { cursorCommandAdapter } from './adapters/cursor.js';
import { factoryCommandAdapter } from './adapters/factory.js';
import { geminiCommandAdapter } from './adapters/gemini.js';
import { githubCopilotCommandAdapter } from './adapters/github-copilot.js';
import { iflowCommandAdapter } from './adapters/iflow.js';
import { junieCommandAdapter } from './adapters/junie.js';
import { kilocodeCommandAdapter } from './adapters/kilocode.js';
import { kiroCommandAdapter } from './adapters/kiro.js';
import { lingmaCommandAdapter } from './adapters/lingma.js';
import { opencodeCommandAdapter } from './adapters/opencode.js';
import { piCommandAdapter } from './adapters/pi.js';
import { qoderCommandAdapter } from './adapters/qoder.js';
import { qwenCommandAdapter } from './adapters/qwen.js';
import { roocodeCommandAdapter } from './adapters/roocode.js';
import { windsurfCommandAdapter } from './adapters/windsurf.js';
import type { ToolCommandAdapter } from './types.js';

const adapters: ToolCommandAdapter[] = [
    amazonQCommandAdapter,
    antigravityCommandAdapter,
    auggieCommandAdapter,
    bobCommandAdapter,
    claudeCommandAdapter,
    clineCommandAdapter,
    codebuddyCommandAdapter,
    codexCommandAdapter,
    continueCommandAdapter,
    costrictCommandAdapter,
    crushCommandAdapter,
    cursorCommandAdapter,
    factoryCommandAdapter,
    geminiCommandAdapter,
    githubCopilotCommandAdapter,
    iflowCommandAdapter,
    junieCommandAdapter,
    kilocodeCommandAdapter,
    kiroCommandAdapter,
    lingmaCommandAdapter,
    opencodeCommandAdapter,
    piCommandAdapter,
    qoderCommandAdapter,
    qwenCommandAdapter,
    roocodeCommandAdapter,
    windsurfCommandAdapter,
];

const commandAdapters = new Map<string, ToolCommandAdapter>(adapters.map((a) => [a.toolId, a]));

export const CommandAdapterRegistry = {
    get: (toolId: string): ToolCommandAdapter | undefined => commandAdapters.get(toolId),
    has: (toolId: string): boolean => commandAdapters.has(toolId),
    list: (): string[] => [...commandAdapters.keys()],
};

export const getSupportedCommandToolIds = (): string[] => CommandAdapterRegistry.list();
