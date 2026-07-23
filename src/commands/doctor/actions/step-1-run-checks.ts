import { checkGit, checkNode, type CheckResult } from '@/core/doctor/checks.js';

export const runDoctorChecksStep = async (): Promise<CheckResult[]> => {
    return Promise.all([checkGit(), checkNode()]);
};
