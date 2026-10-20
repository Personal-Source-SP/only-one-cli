export type TaskStatus = 'concept' | 'plan' | 'in_progress' | 'review' | 'done';

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

export type TuiMode = 'board' | 'viewer' | 'confirm' | 'settings';

export interface ConfirmActionState {
    task: TaskModel;
    action: 'plan' | 'apply' | 'debug';
}
