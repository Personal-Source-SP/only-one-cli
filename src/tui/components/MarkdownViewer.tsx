import { Box, Text, useInput } from 'ink';
import React, { FC, useState } from 'react';
import { exec } from 'node:child_process';
import type { TaskModel } from '../types/task.js';
import { formatMarkdown } from '../utils/markdownParser.js';

interface MarkdownViewerProps {
    task: TaskModel;
    onClose: () => void;
}

export const MarkdownViewer: FC<MarkdownViewerProps> = ({ task, onClose }) => {
    const [activeDocIndex, setActiveDocIndex] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);

    const docs = task.docs;
    const currentDoc = docs[activeDocIndex] || { name: 'none', path: '', content: 'No content' };
    const formattedLines = formatMarkdown(currentDoc.content);

    const viewportHeight = Math.max(10, (process.stdout.rows || 24) - 8);
    const maxScroll = Math.max(0, formattedLines.length - viewportHeight);
    const visibleLines = formattedLines.slice(scrollOffset, scrollOffset + viewportHeight);
    const scrollPercent = formattedLines.length > 0 ? Math.round((scrollOffset / Math.max(1, maxScroll)) * 100) : 0;

    useInput((input, key) => {
        if (key.escape || input === 'q') {
            onClose();
            return;
        }
        if (key.tab && docs.length > 1) {
            setActiveDocIndex((prev) => (prev + 1) % docs.length);
            setScrollOffset(0);
            return;
        }
        if (key.upArrow || input === 'k') {
            setScrollOffset((prev) => Math.max(0, prev - 1));
            return;
        }
        if (key.downArrow || input === 'j') {
            setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
            return;
        }
        if (key.pageUp) {
            setScrollOffset((prev) => Math.max(0, prev - 10));
            return;
        }
        if (key.pageDown) {
            setScrollOffset((prev) => Math.min(maxScroll, prev + 10));
            return;
        }
        if (input === 'e' || input === 'o') {
            const editorCmd = process.env.EDITOR || 'code';
            exec(`${editorCmd} "${currentDoc.path}"`);
        }
    });

    return (
        <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
            <Box justifyContent="space-between" borderStyle="single" borderColor="gray" paddingX={1}>
                <Box gap={1}>
                    <Text bold color="cyan">
                        DOCUMENT:
                    </Text>
                    {docs.map((d, idx) => (
                        <Text key={d.name} bold={idx === activeDocIndex} color={idx === activeDocIndex ? 'cyan' : 'gray'}>
                            {idx === activeDocIndex ? `[● ${d.name}]` : `[○ ${d.name}]`}
                        </Text>
                    ))}
                </Box>
                <Text dimColor>
                    [Lines {scrollOffset + 1}-{Math.min(formattedLines.length, scrollOffset + viewportHeight)} of {formattedLines.length}] (
                    {scrollPercent}%)
                </Text>
            </Box>

            <Box flexDirection="column" marginY={1}>
                {visibleLines.map((line, idx) => (
                    <Text key={scrollOffset + idx}>{line.formatted}</Text>
                ))}
            </Box>
        </Box>
    );
};
