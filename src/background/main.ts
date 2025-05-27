// @ts-nocheck
import browser from "webextension-polyfill";

if (import.meta.hot) {
    // @ts-expect-error for background HMR
    import('/@vite/client')
    // load latest content script
    import('./contentScriptHMR')
}

browser.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch((error: unknown) => console.error(error))

// Message handler for content script to check side panel state
browser.runtime.onMessage.addListener(async (message) => {
    if (message.query === "checkSidePanelState") {
        const contexts = await browser.runtime.getContexts({contextTypes: ["SIDE_PANEL"]});
        return contexts.length > 0 ? {isOpen: true} : {isOpen: false};
    }
    return null;
});
