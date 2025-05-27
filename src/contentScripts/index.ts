import browser from "webextension-polyfill";
import {FileAction} from "~/logic/file-upload";

function handleFileCapture(files: File[]) {
    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = () => {
            console.log(`File captured: ${file.name}, size: ${file.size} bytes`);
            browser.runtime.sendMessage({
                action: FileAction.UPLOAD,
                target: 'sidepanel',
                data: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    content: reader.result as string, // base64 encoded content
                    timestamp: Date.now(),
                    fileId: crypto.randomUUID() // generate a unique ID for the file
                }
            }).catch(e => console.error(e));
        };

        // Read file as data URL (base64)
        reader.readAsDataURL(file);
    });
}

document.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.type === 'file' && target.files && target.files.length > 0) {
        handleFileCapture(Array.from(target.files));
    }
}, true);

document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    const fileInputs = form.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        const fileInput = input as HTMLInputElement;
        if (fileInput.files && fileInput.files.length > 0) {
            handleFileCapture(Array.from(fileInput.files));
        }
    });
}, true);

document.addEventListener('drop', (event) => {
    const dt = event.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
        handleFileCapture(Array.from(dt.files));
    }
}, true);

