import { platform } from 'node:os';
import { VsPlatform } from '@/core/vs/index.js';

/** Resolve system OS platform to VsPlatform target enum. */
export const resolveVsPlatform = (): VsPlatform => {
    const current = platform();
    if (current === 'win32') return VsPlatform.Win32;
    return VsPlatform.Darwin;
};
