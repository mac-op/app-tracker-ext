import browser from "webextension-polyfill";

export type PostingDate = Date | {
    from: Date,
    hours?: number,
    days?: number,
    weeks?: number,
    months?: number,
};

export type JobPosting = {
    title: string;
    company: string;
    description: string;
    location: string;
    datePosted: PostingDate | null;
    url: string;
    internalId: string | null;
    source: string;
    reposted?: boolean;
}

export type ParseResult = JobPosting | Error | string;

export async function extractDetails(tab: browser.Tabs.Tab, func: () => ParseResult): Promise<ParseResult> {
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
    parse(): Promise<ParseResult>;
}