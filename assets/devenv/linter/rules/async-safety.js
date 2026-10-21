export const asyncSafetyRule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent floating unhandled promises and ensure async safety',
            category: 'Async',
        },
        schema: [],
        messages: {
            missingAwait: 'Async function call "{{name}}" must be awaited or handled with .catch().',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.callee && node.callee.name && node.callee.name.endsWith('Async')) {
                    const parent = node.parent;
                    if (parent && parent.type !== 'AwaitExpression' && parent.type !== 'ReturnStatement') {
                        context.report({
                            node,
                            messageId: 'missingAwait',
                            data: { name: node.callee.name },
                        });
                    }
                }
            },
        };
    },
};
export default asyncSafetyRule;
