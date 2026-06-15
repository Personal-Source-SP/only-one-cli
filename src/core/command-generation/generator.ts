import { isAbsolute, join } from 'node:path';
import type { CommandContent, GeneratedCommand, ToolCommandAdapter } from './types.js';

export const resolveCommandWritePath = (projectDir: string, adapterPath: string): string =>
    isAbsolute(adapterPath) ? adapterPath : join(projectDir, adapterPath);

export const generateCommand = (content: CommandContent, adapter: ToolCommandAdapter): GeneratedCommand => ({
    content: adapter.formatFile(content),
    path: adapter.getFilePath(content.id),
});

export const generateCommands = (contents: CommandContent[], adapter: ToolCommandAdapter): GeneratedCommand[] =>
    contents.map((content) => generateCommand(content, adapter));
