import { exec } from 'node:child_process';
import type { OnlyOneGlobalConfig, PhaseAgentRoute } from '../types/config.js';
import type { HerdrAgent, HerdrTab, TaskModel, TaskStatus } from '../types/task.js';

export function toCanonicalHerdrKind(kind: string): string {
    const normalized = (kind || '').toLowerCase().trim();
    if (normalized === 'antigravity') return 'agy';
    if (normalized === 'claudecode') return 'claude';
    return normalized || 'agy';
}

export function normalizePhaseRoute(raw: unknown): PhaseAgentRoute {
    if (!raw) return { pane: 'auto', cli: 'agy' };
    if (typeof raw === 'string') {
        return { pane: 'auto', cli: toCanonicalHerdrKind(raw) };
    }
    const obj = raw as Partial<PhaseAgentRoute>;
    return {
        pane: obj.pane || 'auto',
        cli: toCanonicalHerdrKind(obj.cli || 'agy'),
    };
}

export function enrichAgentsWithTabLabels(agents: HerdrAgent[], tabs: HerdrTab[]): HerdrAgent[] {
    const tabMap = new Map(tabs.map((t) => [t.tab_id, t.label]));
    return agents.map((a) => ({
        ...a,
        name: (a.tab_id && tabMap.get(a.tab_id)) || a.pane_id,
    }));
}

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
    const route = normalizePhaseRoute(config.agentRouting[routingKey]);
    const targetAgent = route.cli;
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
    const route = normalizePhaseRoute(config.agentRouting.clean);
    const targetAgent = route.cli;
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

    const route = normalizePhaseRoute(config.agentRouting.clean);
    if (route.pane && route.pane !== 'auto') {
        const allPanes = await listHerdrPanes();
        const targetPane = allPanes.find((p) => p.pane_id === route.pane);
        if (targetPane) {
            const activeAgents = await listHerdrAgents();
            const hasAgent = activeAgents.some((a) => a.pane_id === route.pane);
            if (hasAgent) {
                await waitHerdrAgent(route.pane, 30000);
                return new Promise((resolve) => {
                    exec(`herdr agent prompt ${route.pane} "/only-one-clean"`, (err) => {
                        if (err) resolve({ success: false, message: `Lỗi khi prompt pane ${route.pane}: ${err.message}` });
                        else resolve({ success: true, message: `Đã gửi tác vụ Clean tới pane ${route.pane}.` });
                    });
                });
            } else {
                const agentName = 'agy-archivist';
                return new Promise((resolve) => {
                    exec(`herdr agent start ${agentName} --kind ${route.cli} --pane ${route.pane}`, (startErr) => {
                        if (startErr) {
                            resolve({ success: false, message: `Lỗi khi start agent trên pane ${route.pane}: ${startErr.message}` });
                            return;
                        }
                        exec(`herdr agent prompt ${route.pane} "/only-one-clean"`, (promptErr) => {
                            if (promptErr) resolve({ success: false, message: `Lỗi khi prompt pane ${route.pane}: ${promptErr.message}` });
                            else resolve({ success: true, message: `Đã khởi chạy agent và gửi lệnh Clean tới pane ${route.pane}.` });
                        });
                    });
                });
            }
        }
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

    const routingKey = (phase === 'processing' ? 'apply' : phase) as keyof OnlyOneGlobalConfig['agentRouting'];
    const route = normalizePhaseRoute(config.agentRouting[routingKey]);
    const phaseCmd = phase === 'concept' ? 'idea' : phase === 'processing' ? 'apply' : phase;
    const promptText = `/only-one-${phaseCmd} only-one/tasks/${task.slug}`;

    // 1. Nếu có chỉ định Target Pane cụ thể (khác 'auto') và pane đó đang hoạt động trong Herdr
    if (route.pane && route.pane !== 'auto') {
        const allPanes = await listHerdrPanes();
        const livePane = allPanes.find((a) => a.pane_id === route.pane);
        if (livePane) {
            const activeAgents = await listHerdrAgents();
            const hasAgent = activeAgents.some((a) => a.pane_id === route.pane);
            if (hasAgent) {
                await waitHerdrAgent(route.pane, 45000);
                return new Promise((resolve) => {
                    exec(`herdr agent prompt ${route.pane} "${promptText}"`, (err) => {
                        if (err) {
                            resolve({ success: false, message: `Lỗi khi gửi prompt tới pane ${route.pane}: ${err.message}` });
                        } else {
                            resolve({ success: true, message: `Đã gửi lệnh thực thi phase ${phase} tới pane ${route.pane}.` });
                        }
                    });
                });
            } else {
                const agentName = `agy-${task.slug
                    .replace(/[^a-z0-9]/gi, '')
                    .slice(0, 15)
                    .toLowerCase()}`;
                return new Promise((resolve) => {
                    exec(`herdr agent start ${agentName} --kind ${route.cli} --pane ${route.pane}`, (startErr) => {
                        if (startErr) {
                            resolve({ success: false, message: `Lỗi khi start agent trên pane ${route.pane}: ${startErr.message}` });
                            return;
                        }
                        exec(`herdr agent prompt ${route.pane} "${promptText}"`, (promptErr) => {
                            if (promptErr) {
                                resolve({ success: false, message: `Lỗi khi gửi prompt tới pane ${route.pane}: ${promptErr.message}` });
                            } else {
                                resolve({ success: true, message: `Đã khởi chạy agent và gửi lệnh thực thi tới pane ${route.pane}.` });
                            }
                        });
                    });
                });
            }
        }
    }

    // 2. Nếu Pane chưa mở hoặc ở chế độ 'auto' -> Mở pane mới và start agent với cli tương ứng
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
                let agents: HerdrAgent[] = data?.result?.agents || [];
                exec('herdr tab list', (tabErr, tabStdout) => {
                    if (!tabErr && tabStdout) {
                        try {
                            const tabData = JSON.parse(tabStdout);
                            const tabs: HerdrTab[] = tabData?.result?.tabs || [];
                            agents = enrichAgentsWithTabLabels(agents, tabs);
                        } catch {}
                    }
                    resolve(agents);
                });
            } catch {
                resolve([]);
            }
        });
    });
}

export async function listHerdrPanes(): Promise<HerdrAgent[]> {
    if (!isHerdrSessionActive()) return [];
    return new Promise((resolve) => {
        exec('herdr pane list', (err, stdout) => {
            if (err) {
                resolve([]);
                return;
            }
            try {
                const data = JSON.parse(stdout);
                const rawPanes = data?.result?.panes || [];
                exec('herdr tab list', (tabErr, tabStdout) => {
                    const tabMap = new Map<string, string>();
                    if (!tabErr && tabStdout) {
                        try {
                            const tabData = JSON.parse(tabStdout);
                            for (const t of tabData?.result?.tabs || []) {
                                tabMap.set(t.tab_id, t.label);
                            }
                        } catch {}
                    }
                    const result: HerdrAgent[] = rawPanes.map((p: any) => ({
                        pane_id: p.pane_id,
                        agent: p.agent || p.terminal_title_stripped || 'terminal',
                        agent_status: p.agent_status === 'unknown' ? 'terminal' : p.agent_status || 'idle',
                        name: (p.tab_id && tabMap.get(p.tab_id)) || p.pane_id,
                        cwd: p.cwd,
                    }));
                    resolve(result);
                });
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
