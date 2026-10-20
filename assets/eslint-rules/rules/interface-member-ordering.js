export const interfaceMemberOrderingRule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce deterministic ordering of TypeScript interface members',
            category: 'TypeScript',
        },
        fixable: 'code',
        schema: [],
        messages: {
            invalidMemberOrder: 'Required property "{{name}}" must precede optional properties.',
        },
    },
    create(context) {
        return {
            TSInterfaceDeclaration(node) {
                const body = node.body.body;
                let seenOptional = false;
                for (const member of body) {
                    if (member.type === 'TSPropertySignature') {
                        if (member.optional) {
                            seenOptional = true;
                        } else if (seenOptional) {
                            const name = member.key?.name || 'property';
                            context.report({
                                node: member,
                                messageId: 'invalidMemberOrder',
                                data: { name },
                            });
                        }
                    }
                }
            },
        };
    },
};
export default interfaceMemberOrderingRule;
