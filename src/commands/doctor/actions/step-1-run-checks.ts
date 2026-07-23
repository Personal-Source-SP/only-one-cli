import { checkGit, checkNode, type DoctorCheckResult } from '@/core/doctor/checks.js';

export const runDoctorChecksStep = async (): Promise<DoctorCheckResult[]> => {
    return Promise.all([checkGit(), checkNode()]);
};
