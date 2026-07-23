/** Infer project repository name from a git remote URL string. */
export const inferName = (repoUrl: string): string => {
    const last = repoUrl.split('/').filter(Boolean).at(-1) ?? 'remote-repo';
    return last.replace(/\.git$/i, '') || 'remote-repo';
};

/** Infer repository archive name from a zip filepath string. */
export const inferArchiveName = (path: string): string => {
    const last = path.split(/[\\/]/).filter(Boolean).at(-1) ?? 'uploaded-repo';
    return last.replace(/\.zip$/i, '') || 'uploaded-repo';
};
