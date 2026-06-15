export type StructurePullCommandOptions = {
    list?: boolean;
    force?: boolean;
    output?: string;
    project?: string;
};

export type StructurePullCommandJson = {
    source: string;
    projectId: string;
    projectName: string;
    bytesWritten: number;
    blueprintPath: string;
};

export type StructurePullListCommandJson = {
    projectId: string;
    organization?: string;
    project?: string;
    name?: string;
    structuralFilename: string;
    structuralFileSize: number;
}[];
