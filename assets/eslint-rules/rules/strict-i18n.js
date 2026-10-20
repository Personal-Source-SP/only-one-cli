export const strictI18nRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow hardcoded text strings in JSX; enforce translation keys',
            category: 'i18n',
        },
        schema: [],
        messages: {
            hardcodedText: 'Hardcoded string "{{text}}" in JSX. Wrap with translation hook (t).',
        },
    },
    create(context) {
        return {
            JSXText(node) {
                const text = node.value.trim();
                if (text.length > 1 && /[a-zA-Z\u00C0-\u1EF9]/.test(text)) {
                    context.report({
                        node,
                        messageId: 'hardcodedText',
                        data: { text: text.slice(0, 30) },
                    });
                }
            },
        };
    },
};
export default strictI18nRule;
