export enum MessageAction {
    UPLOAD_FILE ,
    WORKDAY_URL ,
}

export interface FileData {
    name: string,
    size: number,
    type: string,
    content: string,
    timestamp?: number,
    fileId?: string,
}

export interface Message {
    action: MessageAction,
    target: 'sidepanel' | 'background' | 'content-script',
    file: FileData,
    url: string
}