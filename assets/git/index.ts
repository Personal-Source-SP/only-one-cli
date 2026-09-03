export interface GitAssetManifest {
    id: string;
    version: string;
    name: string;
    description: string;
    targetOs: ('win32' | 'darwin' | 'linux')[];
    files: { src: string; dest: string }[];
}

export interface GitSnippet {
    id: string;
    version: string;
    name: string;
    description: string;
    file: string;
    defaultSelected?: boolean;
}

export const GIT_MANIFESTS: Record<string, GitAssetManifest> = {
    gitbash: {
        id: 'gitbash',
        version: '0.0.1',
        name: 'Git Bash Profile (.bashrc, .bash_profile)',
        description: 'Git Bash shell configuration with Git prompt, UTF-8, and aliases',
        targetOs: ['win32', 'darwin'],
        files: [
            { src: 'bash/.bashrc', dest: '.bashrc' },
            { src: 'bash/.bash_profile', dest: '.bash_profile' },
        ],
    },
    zsh: {
        id: 'zsh',
        version: '0.0.1',
        name: 'Zsh Git Profile (.zshrc)',
        description: 'Zsh shell configuration for macOS with Git prompt and aliases',
        targetOs: ['darwin'],
        files: [{ src: 'zsh/.zshrc', dest: '.zshrc' }],
    },
};

export const GIT_SNIPPETS: GitSnippet[] = [
    {
        id: 'nvm',
        version: '0.0.1',
        name: 'NVM Environment Setup',
        description: 'Load NVM environment variables & bash auto-completion',
        file: 'snippets/nvm.sh',
        defaultSelected: true,
    },
    {
        id: 'ssh-alias',
        version: '0.0.1',
        name: 'SSH & Identity Switcher',
        description: 'Aliases to switch SSH keys and local Git identity (ghpersonal, activezodinet)',
        file: 'snippets/ssh-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'git-alias',
        version: '0.0.1',
        name: 'Git Workflow Aliases',
        description: 'Git shortcuts (gps, gpf, gcm, gbc) and gsq() squash merge function',
        file: 'snippets/git-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'system-alias',
        version: '0.0.1',
        name: 'System & Development Aliases',
        description: 'Terminal utilities (cls, mrun, mrevert, cft cloudflare tunnel)',
        file: 'snippets/system-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'gitnexus',
        version: '0.0.1',
        name: 'GitNexus Workspace Commands',
        description: 'GitNexus helper aliases (nus-ana, nus-list, nus-status, etc.)',
        file: 'snippets/gitnexus.sh',
        defaultSelected: false,
    },
    {
        id: 'antigravity',
        version: '0.0.1',
        name: 'Antigravity IDE & CLI PATH',
        description: 'Export PATH for Antigravity IDE and agy CLI installer',
        file: 'snippets/antigravity.sh',
        defaultSelected: true,
    },
    {
        id: 'k8s-dev-forward',
        version: '0.0.1',
        name: 'K8s Dev Forwarding Helper',
        description: 'f-all() function to port-forward Postgres, Redis, EMQX in dev cluster',
        file: 'snippets/k8s-dev-forward.sh',
        defaultSelected: false,
    },
];
