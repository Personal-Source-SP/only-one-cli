import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export function scaffoldConcept(slug: string, title?: string, baseDir = process.cwd()): string {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Invalid slug format: '${slug}'. Must be lowercase kebab-case.`);
    }

    const taskDir = join(baseDir, 'only-one/tasks', slug);
    mkdirSync(taskDir, { recursive: true });

    const filePath = join(taskDir, 'concept.md');
    if (existsSync(filePath)) {
        return filePath;
    }

    const conceptTitle = title || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const now = new Date().toISOString();

    let template = '';
    const templatePath = resolve(dirname(import.meta.filename || ''), '../assets/concept-template.md');
    if (existsSync(templatePath)) {
        template = readFileSync(templatePath, 'utf8')
            .replace(/\{\{slug\}\}/g, slug)
            .replace(/\{\{title\}\}/g, conceptTitle)
            .replace(/\{\{created_at\}\}/g, now);
    } else {
        template = `---
slug: ${slug}
created_at: ${now}
status: concept
---

# Concept: ${conceptTitle}

## 1. Problem & Goal
## 2. Scope Boundaries
## 3. Proposed Solution & Core Mechanism
## 4. Critical Risks & Edge Cases
`;
    }

    writeFileSync(filePath, template, 'utf8');
    return filePath;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const slug = process.argv[2];
    if (!slug) process.exit(1);
    console.log(`Created concept at: ${scaffoldConcept(slug, process.argv[3])}`);
}
