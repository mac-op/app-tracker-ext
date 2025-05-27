import browser from "webextension-polyfill";
import {FileAction} from "~/logic/file-upload";

async function handleFileCapture(files: File[]) {
    try {
        // Check if the side panel is currently open
        const response: null | { isOpen: boolean } = await browser.runtime.sendMessage({
            query: "checkSidePanelState"
        });
        console.log(response);

        if (response && response.isOpen) {
            console.log("Side panel is open, processing files...");
        } else {
            console.log("Side panel is not open, skipping file processing.");
            return; // Exit if the side panel is not open
        }
        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = () => {
                browser.runtime.sendMessage({
                    action: FileAction.UPLOAD,
                    target: 'sidepanel',
                    data: {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        content: reader.result as string, // base64 encoded content
                        timestamp: Date.now(),
                        fileId: crypto.randomUUID()
                    }
                }).catch(e => console.error(e));
            };

            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error("Error checking side panel state:", error);
    }
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

