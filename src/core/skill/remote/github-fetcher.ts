import { createHash } from 'node:crypto';

export interface GitHubSkillItem {
    name: string;
    path: string;
    downloadUrl: string;
}

export async function fetchSkillContentFromGitHub(
    source: string,
    skillPath: string,
    branch = 'main',
): Promise<{ content: string; hash: string }> {
    const rawUrl = `https://raw.githubusercontent.com/${source}/${branch}/${skillPath}`;
    const headers: Record<string, string> = {
        'User-Agent': 'only-one-cli',
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(rawUrl, { headers });
    if (!res.ok) {
        throw new Error(`Failed to fetch skill from ${rawUrl}: ${res.statusText} (${res.status})`);
    }

    const content = await res.text();
    const hash = computeSha256(content);
    return { content, hash };
}

export async function fetchGitHubRepoSkills(repo: string, branch = 'main'): Promise<GitHubSkillItem[]> {
    const url = `https://api.github.com/repos/${repo}/contents/skills?ref=${branch}`;
    const headers: Record<string, string> = {
        'User-Agent': 'only-one-cli',
        Accept: 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
        throw new Error(`Failed to fetch skills directory from ${repo}: ${res.statusText} (${res.status})`);
    }

    const data = (await res.json()) as Array<{ name: string; path: string; type: string }>;
    return data
        .filter((item) => item.type === 'dir')
        .map((item) => ({
            name: item.name,
            path: `${item.path}/SKILL.md`,
            downloadUrl: `https://raw.githubusercontent.com/${repo}/${branch}/${item.path}/SKILL.md`,
        }));
}

export function computeSha256(content: string): string {
    return createHash('sha256').update(content, 'utf-8').digest('hex');
}
