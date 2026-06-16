export interface InitCommandOptions {
    force?: boolean;
    installSkill?: boolean;
    tools?: string;
}

export interface InitCommandRequest {
    command: import('commander').Command;
    json?: boolean;
    options: InitCommandOptions;
}

export interface InitCommandResponse {
    installSkipped: boolean;
}
