export type CommandContent = {
    body: string;
    category: string;
    description: string;
    id: string;
    name: string;
    tags: string[];
};

export type GeneratedCommand = {
    content: string;
    path: string;
};

export type ToolCommandAdapter = {
    formatFile: (content: CommandContent) => string;
    getFilePath: (commandId: string) => string;
    getInvokeLabel: (commandId: string) => string;
    toolId: string;
};

export type SkillContent = {
    body: string;
    description: string;
    name: string;
};

export type GeneratedSkill = {
    content: string;
    path: string;
};
