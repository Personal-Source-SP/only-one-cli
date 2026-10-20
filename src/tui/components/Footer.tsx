import React from 'react';
import { Box, Text } from 'ink';
import type { TuiMode } from '../types/task.js';

interface FooterProps {
    mode: TuiMode;
    isMoving?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ mode, isMoving }) => {
    const getHints = () => {
        if (mode === 'viewer') {
            return ['[↑/↓/PgUp/PgDn] Scroll', '[Tab] Switch Doc', '[e] Open Editor', '[Esc/q] Back to Board'];
        }
        if (mode === 'settings') {
            return ['[↑/↓] Chọn mục', '[Space/Enter] Đổi giá trị', '[←/→] Tăng giảm', '[Esc/s] Lưu & Thoát'];
        }
        if (mode === 'dispatch') {
            return ['[↑/↓] Di chuyển', '[Space] Chọn/Bỏ chọn', '[Enter] Dispatch', '[Esc] Hủy'];
        }
        if (isMoving) {
            return ['[←/→] Select Target Col', '[m/Enter] Drop Card', '[Esc] Cancel'];
        }
        return [
            '[←/→] Col',
            '[↑/↓] Task',
            '[m] Move',
            '[Enter] View MD',
            '[d] Dispatch',
            '[s] Settings',
            '[c] Clean',
            '[r] Refresh',
            '[q] Quit',
        ];
    };

    return (
        <Box marginTop={1} borderStyle="round" paddingX={1} borderColor="gray" justifyContent="space-between">
            <Box>
                <Text color="gray">
                    {getHints().map((hint, idx) => (
                        <Text key={idx}>
                            {idx > 0 ? '  •  ' : ''}
                            <Text color="cyan">{hint}</Text>
                        </Text>
                    ))}
                </Text>
            </Box>
        </Box>
    );
};
