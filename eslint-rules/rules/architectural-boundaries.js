export const architecturalBoundariesRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce architectural boundaries between layers and modules',
            category: 'Architecture',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowTypeImports: { type: 'boolean' },
                    boundaries: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                layer: { type: 'string' },
                                cannotImportFrom: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                            required: ['layer', 'cannotImportFrom'],
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            forbiddenCrossImport: 'Forbidden cross-layer import from "{{source}}" into "{{target}}".',
        },
    },
    create(context) {
        const options = context.options?.[0] || {};
        const allowTypeImports = options.allowTypeImports !== false;
        const boundaries = options.boundaries || [
            { layer: '/domain/', cannotImportFrom: ['/infra/', '/controllers/'] },
        ];

        return {
            ImportDeclaration(node) {
                if (allowTypeImports && node.importKind === 'type') {
                    return;
                }
                const source = node.source?.value;
                if (!source) return;
                const filename = (context.filename || context.getFilename?.() || '').replace(/\\/g, '/');

                for (const boundary of boundaries) {
                    if (filename.includes(boundary.layer)) {
                        for (const forbidden of boundary.cannotImportFrom) {
                            if (source.includes(forbidden)) {
                                context.report({
                                    node,
                                    messageId: 'forbiddenCrossImport',
                                    data: { source, target: filename },
                                });
                                return;
                            }
                        }
                    }
                }
            },
        };
    },
};
export default architecturalBoundariesRule;

