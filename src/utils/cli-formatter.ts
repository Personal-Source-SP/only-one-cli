export const REPORT_DIVIDER = '==================================================';

/** Format report header title enclosed with standard CLI dividers. */
export const formatReportTitle = (title: string, center = false): string => {
    const padded = center ? title : `                ${title}`;
    return `${REPORT_DIVIDER}\n${padded}\n${REPORT_DIVIDER}`;
};

/** Pad a text cell value to width for tabular display output. */
export const padCell = (value: string, width: number): string => {
    if (value.length >= width) {
        return value.slice(0, width);
    }
    return value.padEnd(width);
};
