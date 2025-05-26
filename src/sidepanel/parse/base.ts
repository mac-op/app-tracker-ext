import browser from "webextension-polyfill";

export type JobPosting = {
    title: string;
    company: string;
    description: string;
    location: string;
    datePosted: Date | string | null;
    url: string;
    internalId: string | null;
    source: string;
    reposted: boolean | null;
}

export type ParseResult = JobPosting | Error | string;

export async function extractDetails(tab: browser.Tabs.Tab, func: () => ParseResult): Promise<ParseResult> {
    if (browser.scripting === undefined) {
        return new Error('Scripting API is not available in this browser.');
    }

    const results = await browser.scripting.executeScript({
        target: {tabId: tab.id!},
        func: func,
    });

    if (!results || !results[0] || results[0].result === undefined) {
        return new Error('Failed to extract description.');
    }

    return results[0].result as ParseResult;
}


export interface PostingParser {
    parse(tab: browser.Tabs.Tab): Promise<ParseResult>;
}