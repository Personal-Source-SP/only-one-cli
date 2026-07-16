export enum VsEditorId {
    Antigravity = 'antigravity',
    Cursor = 'cursor',
    VSCode = 'vscode',
}

export enum VsPlatform {
    Darwin = 'darwin',
    Win32 = 'win32',
}

export interface VsEditorDescriptor {
    id: VsEditorId;
    name: string;
    commandCandidates: string[];
    resolveSettingsPath: (homeDir: string, platform: VsPlatform) => string;
}

export interface VsFileSystem {
    copyFile: (source: string, target: string) => Promise<void>;
    mkdir: (path: string) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    rename: (source: string, target: string) => Promise<void>;
    rm: (path: string) => Promise<void>;
    stat: (path: string) => Promise<{ isFile: () => boolean }>;
    writeFile: (path: string, content: string) => Promise<void>;
}

export interface VsProcessResult {
    code: number;
    stderr: string;
    stdout: string;
}

export interface VsProcessRunner {
    run: (command: string, args: string[]) => Promise<VsProcessResult>;
}

export interface VsProgressReporter {
    start: (total: number, label: string) => void;
    step: (label: string) => void;
    rollback: (label: string) => void;
}
