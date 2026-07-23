export const REPORT_DIVIDER = '==================================================';

/** Format report header title enclosed with standard CLI dividers. */
export const formatReportTitle = (title: string, center = false): string => {
    const padded = center ? title : `                ${title}`;
    return `${REPORT_DIVIDER}\n${padded}\n${REPORT_DIVIDER}`;
};
