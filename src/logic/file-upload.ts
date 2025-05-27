export enum FileAction {
    UPLOAD = 'upload',
    SAVE = 'save',
    GET = 'get',
}

export interface FileData {
    name: string,
    size: number,
    type: string,
    content: string,
    timestamp?: number,
    fileId?: string,
}

export interface FileMessage {
    action: FileAction,
    target: 'sidepanel' | 'background',
    data: FileData
}