import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';

export interface LintViolation {
    type: 'frontmatter' | 'section' | 'ste100_length' | 'bloat';
    message: string;
    line?: number;
}

export interface LintResult {
    valid: boolean;
    wordCount: number;
    violations: LintViolation[];
}

export function lintSkill(content: string): LintResult {
    const violations: LintViolation[] = [];
    const words = content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const fmMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!fmMatch) {
        violations.push({ type: 'frontmatter', message: 'Missing YAML frontmatter' });
    } else {
        try {
            const parsed: any = yaml.load(fmMatch[1]);
            if (!parsed?.name) violations.push({ type: 'frontmatter', message: 'Missing name in frontmatter' });
            if (!parsed?.description) violations.push({ type: 'frontmatter', message: 'Missing description in frontmatter' });
        } catch (e: any) {
            violations.push({ type: 'frontmatter', message: `Invalid YAML in frontmatter: ${e.message}` });
        }
    }

    if (!/^#\s+.+/m.test(content)) violations.push({ type: 'section', message: 'Missing H1 Title' });
    if (!/^##\s+Overview/im.test(content)) violations.push({ type: 'section', message: 'Missing ## Overview section' });
    if (!/^##\s+Guardrails/im.test(content)) violations.push({ type: 'section', message: 'Missing ## Guardrails section' });

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- **MUST_DO**') || trimmed.startsWith('- **NEVER_DO**') || trimmed.startsWith('- 🛑')) {
            const instructionText = trimmed.replace(/^-\s*(\*\*[A-Z_]+\*\*:|🛑)\s*/, '');
            const sentenceWords = instructionText.split(/\s+/).filter(Boolean);
            if (sentenceWords.length > 25) {
                violations.push({
                    type: 'ste100_length',
                    message: `Instruction exceeds ASD-STE100 limit (${sentenceWords.length} words > 25): "${instructionText.slice(0, 50)}..."`,
                    line: idx + 1,
                });
            }
        }
    });

    if (wordCount > 2500) {
        violations.push({
            type: 'bloat',
            message: `Skill length exceeds recommended token budget (${wordCount} words > 2500)`,
        });
    }

    return {
        valid: violations.filter((v) => v.type !== 'bloat').length === 0,
        wordCount,
        violations,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename || '')) {
    const targetFile = process.argv[2];
    if (!targetFile || !existsSync(targetFile)) {
        console.error('Usage: npx tsx lint-skill.ts <path-to-SKILL.md>');
        process.exit(1);
    }
    const result = lintSkill(readFileSync(targetFile, 'utf8'));
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exit(1);
}
