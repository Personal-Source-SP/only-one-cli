import { exec } from 'node:child_process';
import type { OnlyOneGlobalConfig } from '../types/config.js';
import type { TaskModel, TaskStatus } from '../types/task.js';

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
    const routingKey = (phase === 'in_progress' ? 'debug' : phase) as keyof OnlyOneGlobalConfig['agentRouting'];
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
        agentPromptCommand: `herdr agent prompt ${agentName} "/only-one-${phase === 'concept' ? 'idea' : phase} only-one/tasks/${task.slug}"`,
        targetAgent,
    };
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
