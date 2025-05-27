// filePreviewStore.ts
import {reactive} from 'vue';

export interface FilePreviewState {
    isOpen: boolean;
    currentFile: File | null;
}

// Create a reactive state
const state = reactive<FilePreviewState>({
    isOpen: false,
    currentFile: null,
});

// Functions to manipulate the state
export function openFilePreview(file: File) {
    state.currentFile = file;
    state.isOpen = true;
}

export function closeFilePreview() {
    state.isOpen = false;
}

export function downloadCurrentFile() {
    if (state.currentFile) {
        const url = URL.createObjectURL(state.currentFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.currentFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export function openCurrentFileInNewTab() {
    if (state.currentFile) {
        const url = URL.createObjectURL(state.currentFile);
        window.open(url, '_blank');
    }
}

// Export the state
export const filePreviewStore = state;