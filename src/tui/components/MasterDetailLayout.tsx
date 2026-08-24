import React, { FC, ReactNode } from 'react';
import { Box } from 'ink';

interface MasterDetailLayoutProps {
    sidebar: ReactNode;
    content: ReactNode;
}

export const MasterDetailLayout: FC<MasterDetailLayoutProps> = ({ sidebar, content }) => {
    return (
        <Box flexDirection="row" width="100%" minHeight={16}>
            <Box width="38%" flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1} marginRight={1}>
                {sidebar}
            </Box>
            <Box width="62%" flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0}>
                {content}
            </Box>
        </Box>
    );
};
