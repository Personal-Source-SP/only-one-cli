export const strictDesignTokensRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow hardcoded color hex codes in JSX styles; use theme design tokens',
            category: 'Styling',
        },
        schema: [],
        messages: {
            forbiddenHardcodedColor: 'Hardcoded color "{{value}}" is forbidden. Use a design token variable instead.',
        },
    },
    create(context) {
        return {
            Literal(node) {
                if (typeof node.value === 'string' && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(node.value)) {
                    context.report({
                        node,
                        messageId: 'forbiddenHardcodedColor',
                        data: { value: node.value },
                    });
                }
            },
        };
    },
};
export default strictDesignTokensRule;
