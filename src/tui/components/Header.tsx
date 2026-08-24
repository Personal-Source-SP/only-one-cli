import React from 'react';
import { Box, Text } from 'ink';
import { VERSION } from '@/constants/index.js';

interface HeaderProps {
    breadcrumb?: string[];
    repoName?: string;
    gitBranch?: string;
}

export const Header: React.FC<HeaderProps> = ({ breadcrumb, repoName, gitBranch }) => {
    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0} marginBottom={1}>
            <Box justifyContent="space-between">
                <Text bold color="cyan">
                    🚀 ONLY-ONE CLI <Text color="gray">v{VERSION}</Text>
                </Text>
                <Text color="gray">
                    {repoName ? `[repo: ${repoName}]` : ''}
                    {gitBranch ? ` [git: ${gitBranch}]` : ''}
                </Text>
            </Box>
            {breadcrumb && breadcrumb.length > 0 && (
                <Box marginTop={0}>
                    <Text color="gray">
                        Navigation: <Text color="yellow">{breadcrumb.join(' > ')}</Text>
                    </Text>
                </Box>
            )}
        </Box>
    );
};
