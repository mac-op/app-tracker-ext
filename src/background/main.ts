// @ts-nocheck
import browser from "webextension-polyfill";
import {MessageAction} from "~/logic/file-upload";
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

const workdayURLs: Record<number, string> = {};

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const url = tab.url;

    if (tab.url.includes('myworkdayjobs')) {
        workdayURLs[tabId] = url;
        return;
    }
    if (tab.status === 'complete' && url.includes("community.workday.com/maintenance-page")) {
        browser.tabs.sendMessage(tabId, {
            target:'content-script',
            action: MessageAction.WORKDAY_URL,
            url: workdayURLs[tabId] || '',
        }).catch(e => console.error(e));
    }
})

browser.tabs.onRemoved.addListener((tabId) => {
    if (workdayURLs[tabId]) {
        delete workdayURLs[tabId];
    }
})
