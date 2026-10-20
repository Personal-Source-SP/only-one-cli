export type TaskStatus = 'concept' | 'plan' | 'processing' | 'review' | 'done';

export interface HerdrAgent {
    agent: string;
    agent_status: 'idle' | 'working' | 'blocked' | 'done' | 'unknown' | string;
    pane_id: string;
    workspace_id?: string;
    cwd?: string;
    focused?: boolean;
}

export interface TaskDoc {
    name: string;
    path: string;
    content: string;
}

export interface TaskModel {
    slug: string;
    folderPath: string;
    status: TaskStatus;
    title: string;
    createdAt?: string;
    updatedAt?: string;
    docs: TaskDoc[];
    activeDocIndex: number;
}

export interface ColumnModel {
    id: TaskStatus;
    title: string;
    color: 'cyan' | 'blue' | 'yellow' | 'magenta' | 'green';
    tasks: TaskModel[];
}

export type TuiMode = 'board' | 'viewer' | 'confirm' | 'settings' | 'dispatch';

export interface ConfirmActionState {
    task: TaskModel;
    action: 'plan' | 'apply' | 'debug';
}
