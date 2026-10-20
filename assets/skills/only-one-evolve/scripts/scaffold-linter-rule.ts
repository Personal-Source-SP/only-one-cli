import fs from 'node:fs/promises';
import path from 'node:path';

export interface ScaffoldOptions {
    ruleSlug: string;
    description: string;
    astNode: string; // e.g. 'ImportDeclaration', 'CallExpression'
    targetDir?: string;
}

export function generateRuleTemplate(slug: string, description: string, astNode: string): string {
    const camelName = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Rule';
    return `export const ${camelName} = {
    meta: {
        type: 'problem',
        docs: {
            description: '${description}',
            category: 'EvolvedRules',
        },
        schema: [],
        messages: {
            violation: 'Detected violation of rule "${slug}": ${description}.',
        },
    },
    create(context) {
        return {
            ${astNode}(node) {
                // TODO: Custom AST match logic for recurrent mistake
                const isViolated = false;
                if (isViolated) {
                    context.report({ node, messageId: 'violation' });
                }
            },
        };
    },
};
export default ${camelName};
`;
}

export async function scaffoldLinterRule(options: ScaffoldOptions): Promise<string> {
    const root = options.targetDir || path.join(process.cwd(), 'eslint-rules', 'rules');
    await fs.mkdir(root, { recursive: true });
    const rulePath = path.join(root, `${options.ruleSlug}.js`);
    const content = generateRuleTemplate(options.ruleSlug, options.description, options.astNode);
    await fs.writeFile(rulePath, content, 'utf-8');
    return rulePath;
}

if (process.argv[1] && process.argv[1].endsWith('scaffold-linter-rule.ts')) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log('Usage: npx tsx scaffold-linter-rule.ts <rule-slug> "<description>" <ASTNode>');
        process.exit(0);
    }
    const slug = process.argv[2] || 'no-recurrent-error';
    const desc = process.argv[3] || 'Auto-generated rule for recurrent mistake';
    const node = process.argv[4] || 'ImportDeclaration';
    scaffoldLinterRule({ ruleSlug: slug, description: desc, astNode: node }).then((p) => {
        console.log(`Generated rule scaffold at: ${p}`);
    });
}
