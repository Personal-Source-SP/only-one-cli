export enum IgnoreTarget {
    Docker = 'docker',
    Git = 'git',
    Npm = 'npm',
}

export interface IgnoreTemplate {
    fileName: string;
    target: IgnoreTarget;
}

export const IGNORE_TEMPLATES: Record<IgnoreTarget, IgnoreTemplate> = {
    [IgnoreTarget.Docker]: { fileName: '.dockerignore', target: IgnoreTarget.Docker },
    [IgnoreTarget.Git]: { fileName: '.gitignore', target: IgnoreTarget.Git },
    [IgnoreTarget.Npm]: { fileName: '.npmignore', target: IgnoreTarget.Npm },
};
