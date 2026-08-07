export interface GitAssetManifest {
    id: string;
    name: string;
    description: string;
    targetOs: ('win32' | 'darwin' | 'linux')[];
    files: { src: string; dest: string }[];
}

export interface GitSnippet {
    id: string;
    name: string;
    description: string;
    file: string;
    defaultSelected?: boolean;
}

export const GIT_MANIFESTS: Record<string, GitAssetManifest> = {
    gitbash: {
        id: 'gitbash',
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
        name: 'Zsh Git Profile (.zshrc)',
        description: 'Zsh shell configuration for macOS with Git prompt and aliases',
        targetOs: ['darwin'],
        files: [{ src: 'zsh/.zshrc', dest: '.zshrc' }],
    },
};

export const GIT_SNIPPETS: GitSnippet[] = [
    {
        id: 'nvm',
        name: 'NVM Environment Setup',
        description: 'Load NVM environment variables & bash auto-completion',
        file: 'snippets/nvm.sh',
        defaultSelected: true,
    },
    {
        id: 'ssh-alias',
        name: 'SSH & Identity Switcher',
        description: 'Aliases to switch SSH keys and local Git identity (ghpersonal, activezodinet)',
        file: 'snippets/ssh-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'git-alias',
        name: 'Git Workflow Aliases',
        description: 'Git shortcuts (gps, gpf, gcm, gbc) and gsq() squash merge function',
        file: 'snippets/git-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'system-alias',
        name: 'System & Development Aliases',
        description: 'Terminal utilities (cls, mrun, mrevert, cft cloudflare tunnel)',
        file: 'snippets/system-alias.sh',
        defaultSelected: true,
    },
    {
        id: 'gitnexus',
        name: 'GitNexus Workspace Commands',
        description: 'GitNexus helper aliases (nus-ana, nus-list, nus-status, etc.)',
        file: 'snippets/gitnexus.sh',
        defaultSelected: false,
    },
    {
        id: 'antigravity',
        name: 'Antigravity IDE & CLI PATH',
        description: 'Export PATH for Antigravity IDE and agy CLI installer',
        file: 'snippets/antigravity.sh',
        defaultSelected: true,
    },
    {
        id: 'k8s-dev-forward',
        name: 'K8s Dev Forwarding Helper',
        description: 'f-all() function to port-forward Postgres, Redis, EMQX in dev cluster',
        file: 'snippets/k8s-dev-forward.sh',
        defaultSelected: false,
    },
];
