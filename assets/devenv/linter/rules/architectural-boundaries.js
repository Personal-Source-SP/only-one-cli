export const architecturalBoundariesRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce architectural boundaries between layers and modules',
            category: 'Architecture',
        },
        schema: [],
        messages: {
            forbiddenCrossImport: 'Forbidden cross-layer import from "{{source}}" into "{{target}}".',
        },
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const source = node.source.value;
                const filename = context.filename || context.getFilename();
                if (filename.includes('/domain/') && (source.includes('/infra/') || source.includes('/controllers/'))) {
                    context.report({
                        node,
                        messageId: 'forbiddenCrossImport',
                        data: { source, target: filename },
                    });
                }
            },
        };
    },
};
export default architecturalBoundariesRule;
