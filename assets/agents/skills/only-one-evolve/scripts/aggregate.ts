import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

export interface ImprovementItem {
    slug: string;
    filePath: string;
    targetSkills: string[];
    deficiencies: string[];
    contextAndRootCause: string;
    suggestions: string[];
}

export interface AggregatedResult {
    totalPending: number;
    bySkill: Record<string, ImprovementItem[]>;
}

export function aggregateImprovements(dirPath: string, filterSkill?: string): AggregatedResult {
    const result: AggregatedResult = { totalPending: 0, bySkill: {} };
    if (!existsSync(dirPath)) return result;

    const files = readdirSync(dirPath).filter((f) => f.endsWith('.md'));

    for (const file of files) {
        const fullPath = join(dirPath, file);
        const content = readFileSync(fullPath, 'utf8');
        const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
        if (!match) continue;

        let frontmatter: any = {};
        try {
            frontmatter = yaml.load(match[1]) || {};
        } catch {
            continue;
        }

        if (frontmatter.status !== 'pending') continue;

        const targetSkills: string[] = Array.isArray(frontmatter.target_skills) ? frontmatter.target_skills : [];
        if (filterSkill && !targetSkills.includes(filterSkill)) continue;

        result.totalPending++;
        const body = content.slice(match[0].length);

        const deficiencies = extractBulletPoints(body, /## 1\.\s*Observed Deficiencies[\s\S]*?(?=## 2|$)/i);
        const contextMatch = body.match(/## 2\.\s*Context & Root Cause([\s\S]*?)(?=## 3|$)/i);
        const contextAndRootCause = contextMatch ? contextMatch[1].trim() : '';
        const suggestions = extractBulletPoints(body, /## 3\.\s*(?:Recommended Adjustments|Desired Skill Guardrail)[\s\S]*?(?=#|$)/i);

        const item: ImprovementItem = {
            slug: frontmatter.task_slug || file.replace(/\.md$/, ''),
            filePath: fullPath,
            targetSkills,
            deficiencies,
            contextAndRootCause,
            suggestions,
        };

        for (const skill of targetSkills) {
            if (filterSkill && skill !== filterSkill) continue;
            if (!result.bySkill[skill]) result.bySkill[skill] = [];
            result.bySkill[skill].push(item);
        }
    }

    return result;
}

function extractBulletPoints(text: string, sectionRegex: RegExp): string[] {
    const match = text.match(sectionRegex);
    if (!match) return [];
    return match[0]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- ') || line.startsWith('* '))
        .map((line) => line.replace(/^[-*]\s+/, ''));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const targetDir = process.env.IMPROVEMENTS_DIR || resolve(process.cwd(), 'only-one/improvements');
    const filterSkill = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : undefined;
    console.log(JSON.stringify(aggregateImprovements(targetDir, filterSkill), null, 2));
}
