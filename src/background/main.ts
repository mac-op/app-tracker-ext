import browser from "webextension-polyfill";
// import {FileMessage} from "~/logic/uploadListener";

if (import.meta.hot) {
    // @ts-expect-error for background HMR
    import('/@vite/client')
    // load latest content script
    import('./contentScriptHMR')
}

// @ts-expect-error missing types
browser.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch((error: unknown) => console.error(error))

// const capturedFiles = new Map<string, any>();
//
// // Listen for messages from content script
// browser.runtime.onMessage.addListener((message, sender) => {
//     const msg = message as FileMessage;
//     if (msg.action === 'save') {
//         const fileData = msg.data;
//         const fileId = `${fileData.name} -${fileData.timestamp}`;
//
//         capturedFiles.set(fileId, fileData);
//         console.log(`File captured: ${fileData.name} (${fileData.size} bytes)`);
//
//         return Promise.resolve({success: true, fileId});
//     }
//
//     if (msg.action === 'get') {
//         const fileId = msg.data.fileId;
//         return Promise.resolve({
//             file: capturedFiles.get(fileId) || null
//         });
//     }
// });