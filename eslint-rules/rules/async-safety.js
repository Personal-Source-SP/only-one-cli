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
                const calleeName =
                    node.callee?.name ||
                    (node.callee?.type === 'MemberExpression' && node.callee.property?.name);
                if (calleeName && calleeName.endsWith('Async')) {
                    const parent = node.parent;
                    if (parent && parent.type === 'ExpressionStatement') {
                        context.report({
                            node,
                            messageId: 'missingAwait',
                            data: { name: calleeName },
                        });
                    }
                }
            },
        };
    },
};
export default asyncSafetyRule;

