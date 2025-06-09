import {reactive} from 'vue';
import browser from 'webextension-polyfill';
import {MessageAction, Message} from '~/logic/file-upload';

// Store files
const capturedFiles = reactive<File[]>([]);

browser.runtime.onMessage.addListener((message: any) => {
    const msg = message as Message;
    if (msg.target === 'sidepanel' && msg.action === MessageAction.UPLOAD_FILE) {
        if (!msg.file) {
            return Promise.reject("No file received.");
        }
        try {
            // Convert data URL back to File object
            const dataURL = msg.file.content as string;
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || msg.file.type;
            const bstr = atob(arr[1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            // Create a new File object
            const file = new File([u8arr], msg.file.name, {type: mime});

            // Add to our array
            capturedFiles.push(file);
            console.log(`Side panel received file: ${file.name}, size: ${file.size} bytes`);
        } catch (error) {
            console.error("Error reconstructing file:", error);
        }
    }
    return Promise.resolve();
});

export {capturedFiles};