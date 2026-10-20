import { exec } from 'node:child_process';
import type { OnlyOneGlobalConfig } from '../types/config.js';
import type { HerdrAgent, TaskModel, TaskStatus } from '../types/task.js';

export function isHerdrSessionActive(env: NodeJS.ProcessEnv = process.env): boolean {
    return env.HERDR_ENV === '1';
}

export interface HerdrDispatchPlan {
    splitCommand: string;
    agentStartCommand: string;
    agentPromptCommand: string;
    targetAgent: string;
}

export interface HerdrDispatchResult {
    success: boolean;
    message: string;
}

export function buildHerdrDispatchPlan(
    task: TaskModel,
    phase: TaskStatus,
    config: OnlyOneGlobalConfig,
    workspaceDir: string,
): HerdrDispatchPlan {
    const routingKey = (phase === 'processing' ? 'apply' : phase) as keyof OnlyOneGlobalConfig['agentRouting'];
    const targetAgent = config.agentRouting[routingKey] || 'antigravity';
    const agentName = `agy-${task.slug
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 15)
        .toLowerCase()}`;
    const direction = config.herdr.splitDirection;
    const focusFlag = config.herdr.focusOnSpawn ? '' : '--no-focus';

    return {
        splitCommand: `herdr pane split --current --direction ${direction} --cwd "${workspaceDir}" ${focusFlag}`.trim(),
        agentStartCommand: `herdr agent start ${agentName} --kind ${targetAgent}`,
        agentPromptCommand: `herdr agent prompt ${agentName} "/only-one-${phase === 'concept' ? 'idea' : phase === 'processing' ? 'apply' : phase} only-one/tasks/${task.slug}"`,
        targetAgent,
    };
}

export function buildHerdrCleanDispatchPlan(config: OnlyOneGlobalConfig, workspaceDir: string): HerdrDispatchPlan {
    const targetAgent = config.agentRouting.clean || 'antigravity';
    const agentName = 'agy-archivist';
    const direction = config.herdr.splitDirection;
    const focusFlag = config.herdr.focusOnSpawn ? '' : '--no-focus';

    return {
        splitCommand: `herdr pane split --current --direction ${direction} --cwd "${workspaceDir}" ${focusFlag}`.trim(),
        agentStartCommand: `herdr agent start ${agentName} --kind ${targetAgent}`,
        agentPromptCommand: `herdr agent prompt ${agentName} "/only-one-clean"`,
        targetAgent,
    };
}

export async function dispatchCleanViaHerdr(config: OnlyOneGlobalConfig, workspaceDir: string): Promise<HerdrDispatchResult> {
    if (!isHerdrSessionActive()) {
        return {
            success: false,
            message: 'Herdr session không hoạt động (HERDR_ENV != 1). Vui lòng mở trong Herdr workspace.',
        };
    }

    const plan = buildHerdrCleanDispatchPlan(config, workspaceDir);

    return new Promise((resolve) => {
        exec(plan.splitCommand, (splitErr, splitStdout) => {
            if (splitErr) {
                resolve({ success: false, message: `Lỗi khi split pane: ${splitErr.message}` });
                return;
            }

            let paneId = '';
            try {
                const parsed = JSON.parse(splitStdout);
                paneId = parsed?.result?.pane?.pane_id || '';
            } catch {
                // Bỏ qua lỗi parse
            }

            const startCmd = paneId ? `${plan.agentStartCommand} --pane ${paneId}` : plan.agentStartCommand;

            exec(startCmd, (startErr) => {
                if (startErr) {
                    resolve({ success: false, message: `Lỗi khi start agent: ${startErr.message}` });
                    return;
                }

                exec(plan.agentPromptCommand, (promptErr) => {
                    if (promptErr) {
                        resolve({ success: false, message: `Lỗi khi prompt agent: ${promptErr.message}` });
                        return;
                    }
                    resolve({
                        success: true,
                        message: `Đã điều phối tác vụ Clean tới ${plan.targetAgent} (/only-one-clean) trong pane kế bên.`,
                    });
                });
            });
        });
    });
}

export async function dispatchTaskViaHerdr(
    task: TaskModel,
    phase: TaskStatus,
    config: OnlyOneGlobalConfig,
    workspaceDir: string,
): Promise<HerdrDispatchResult> {
    if (!isHerdrSessionActive()) {
        return {
            success: false,
            message: 'Herdr session không hoạt động (HERDR_ENV != 1). Vui lòng mở trong Herdr workspace.',
        };
    }

    const plan = buildHerdrDispatchPlan(task, phase, config, workspaceDir);

    return new Promise((resolve) => {
        exec(plan.splitCommand, (splitErr, splitStdout) => {
            if (splitErr) {
                resolve({ success: false, message: `Lỗi khi split pane: ${splitErr.message}` });
                return;
            }

            let paneId = '';
            try {
                const parsed = JSON.parse(splitStdout);
                paneId = parsed?.result?.pane?.pane_id || '';
            } catch {
                // Bỏ qua lỗi parse
            }

            const startCmd = paneId ? `${plan.agentStartCommand} --pane ${paneId}` : plan.agentStartCommand;

            exec(startCmd, (startErr) => {
                if (startErr) {
                    resolve({ success: false, message: `Lỗi khi start agent: ${startErr.message}` });
                    return;
                }

                exec(plan.agentPromptCommand, (promptErr) => {
                    if (promptErr) {
                        resolve({ success: false, message: `Lỗi khi prompt agent: ${promptErr.message}` });
                        return;
                    }
                    resolve({
                        success: true,
                        message: `Đã điều phối task tới ${plan.targetAgent} trong pane kế bên.`,
                    });
                });
            });
        });
    });
}

export async function listHerdrAgents(): Promise<HerdrAgent[]> {
    if (!isHerdrSessionActive()) return [];
    return new Promise((resolve) => {
        exec('herdr agent list', (err, stdout) => {
            if (err) {
                resolve([]);
                return;
            }
            try {
                const data = JSON.parse(stdout);
                const agents: HerdrAgent[] = data?.result?.agents || [];
                resolve(agents);
            } catch {
                resolve([]);
            }
        });
    });
}

export async function waitHerdrAgent(target: string, timeoutMs: number = 60000): Promise<boolean> {
    if (!isHerdrSessionActive()) return false;
    return new Promise((resolve) => {
        exec(`herdr agent wait ${target} --until idle --timeout ${timeoutMs}`, (err) => {
            resolve(!err);
        });
    });
}

export async function dispatchTaskToHerdrAgents(
    task: TaskModel,
    targets: string[],
    workspaceDir: string,
    onProgress?: (msg: string) => void,
): Promise<HerdrDispatchResult> {
    if (!isHerdrSessionActive()) {
        return { success: false, message: 'Herdr session không hoạt động (HERDR_ENV != 1).' };
    }
    if (targets.length === 0) {
        return { success: false, message: 'Chưa chọn agent nào để điều phối.' };
    }

    const phaseCmd = task.status === 'concept' ? 'idea' : task.status === 'processing' ? 'apply' : task.status;
    const promptText = `/only-one-${phaseCmd} only-one/tasks/${task.slug}`;

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        onProgress?.(`[${i + 1}/${targets.length}] Đang kiểm tra trạng thái agent ${target}...`);
        const ready = await waitHerdrAgent(target, 45000);
        if (!ready) {
            return {
                success: false,
                message: `Agent ${target} không thể chuyển sang trạng thái rảnh (timeout).`,
            };
        }
        onProgress?.(`[${i + 1}/${targets.length}] Gửi lệnh tới agent ${target}...`);
        const promptSuccess = await new Promise<boolean>((resolve) => {
            exec(`herdr agent prompt ${target} "${promptText}"`, (err) => {
                resolve(!err);
            });
        });
        if (!promptSuccess) {
            return { success: false, message: `Lỗi khi gửi prompt tới agent ${target}.` };
        }
    }

    return {
        success: true,
        message: `Đã điều phối thành công task ${task.slug} tới ${targets.length} agent.`,
    };
}
