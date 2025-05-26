// import {onMessage, sendMessage} from 'webext-bridge/background'

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

