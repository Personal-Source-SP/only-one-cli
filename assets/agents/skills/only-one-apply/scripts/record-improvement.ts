import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export interface RecordImprovementOptions {
    slug: string;
    targetSkills: string[];
    deficiency: string;
    cause: string;
    suggestion?: string;
    baseDir?: string;
}

export function recordTaskImprovement(options: RecordImprovementOptions): string {
    const baseDir = options.baseDir || process.cwd();
    const targetDir = join(baseDir, 'only-one/tasks', options.slug);
    mkdirSync(targetDir, { recursive: true });
    const filePath = join(targetDir, 'improvements.md');

    if (!existsSync(filePath)) {
        const templatePath = resolve(dirname(import.meta.filename || ''), '../assets/improvements-template.md');
        let content = '';
        if (existsSync(templatePath)) {
            content = readFileSync(templatePath, 'utf8')
                .replace(/\{\{slug\}\}/g, options.slug)
                .replace(/\{\{created_at\}\}/g, new Date().toISOString())
                .replace(/\{\{target_skills\}\}/g, options.targetSkills.map((s) => `  - ${s}`).join('\n'))
                .replace(/\{\{deficiencies\}\}/g, `- **${options.targetSkills.join(', ')}**: ${options.deficiency}`)
                .replace(/\{\{context\}\}/g, `- ${options.cause}`)
                .replace(/\{\{suggestions\}\}/g, `- ${options.suggestion || 'Add guardrail or verification checklist to target skill.'}`);
        } else {
            content = `---
task_slug: ${options.slug}
created_at: ${new Date().toISOString()}
target_skills:
${options.targetSkills.map((s) => `  - ${s}`).join('\n')}
---

# Task Improvements: ${options.slug}

## 1. Observed Deficiencies
- **${options.targetSkills.join(', ')}**: ${options.deficiency}

## 2. Context & Root Cause
- ${options.cause}

## 3. Desired Skill Guardrail / Checklist
- ${options.suggestion || 'Add guardrail or verification checklist to target skill.'}
`;
        }
        writeFileSync(filePath, content, 'utf8');
    } else {
        const existing = readFileSync(filePath, 'utf8');
        const updated = existing.replace(
            /## 1\.\s*Observed Deficiencies\s*[\r\n]+/,
            `## 1. Observed Deficiencies\n- **${options.targetSkills.join(', ')}**: ${options.deficiency}\n`,
        );
        writeFileSync(filePath, updated, 'utf8');
    }

    return filePath;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const slug = process.argv[2];
    const skill = process.argv[3];
    const deficiency = process.argv[4];
    const cause = process.argv[5];
    if (!slug || !skill || !deficiency || !cause) {
        process.exit(1);
    }
    const suggestion = process.argv[6];
    const filePath = recordTaskImprovement({ slug, targetSkills: [skill], deficiency, cause, suggestion });
    console.log(`Recorded improvement note at: ${filePath}`);
}
