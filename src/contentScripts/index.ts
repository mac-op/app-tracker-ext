import browser from "webextension-polyfill";
import {Message, MessageAction} from "~/logic/file-upload";

async function handleFileCapture(files: File[]) {
    try {
        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = () => {
                browser.runtime.sendMessage({
                    action: MessageAction.UPLOAD_FILE,
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
        console.error("Error sending file to side panel:", error);
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

browser.runtime.onMessage.addListener((message: any) => {
    const msg = message as Message;
    if (msg.target === 'content-script' && msg.action === MessageAction.WORKDAY_URL) {
        console.log(`Content script received URL: ${msg.url}`);
        const elem = document.createElement('p');
        elem.style.position = 'fixed';
        elem.style.top = '0';
        elem.style.fontSize = '20px';
        elem.style.backgroundColor = 'red';
        elem.innerText = msg.url;
        document.body.appendChild(elem);
    }
    return Promise.resolve();
})