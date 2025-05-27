import {extractDetails, ParseResult, PostingParser} from "./base";
import browser from "webextension-polyfill";

function getDetails(): ParseResult {
    const descElem = document.getElementById('job-details');
    const companyNameElem = document.getElementsByClassName(
        'job-details-jobs-unified-top-card__company-name')[0];
    const jobTitleElem = document.getElementsByClassName(
        'job-details-jobs-unified-top-card__job-title')[0];
    const detailElem = document.getElementsByClassName(
        'job-details-jobs-unified-top-card__tertiary-description-container')[0] as HTMLElement;

    if (!descElem || !companyNameElem || !jobTitleElem || !detailElem) {
        console.error('getDetails: Element not found.');
        return new Error('Element not found.');
    }
    const details = detailElem.innerText;
    const [location, when, _] = details.split('·');

    function parseTime(t: string): Date {
        const regex = /(?:\s*Reposted)?\s*(\d+)\s*(hour|day|week|month)s?\s*ago/i;
        const match = t.match(regex)!;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const now = new Date();
        console.error(value, unit, now);
        switch (unit) {
            case 'hour':
                return new Date(now.getTime() - value * 60 * 60 * 1000);
            case 'day':
                return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
            case 'week':
                return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
        }
        return now;
    }

    function formatDesc(element: HTMLElement): string {
        let content = '';
        for (const node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                content += node.textContent!.replace(/\n{3,}/g, '\n\n');
            }
            if (node.nodeType !== Node.ELEMENT_NODE)
                continue;

            const childElement = node as HTMLElement;
            switch (childElement.tagName.toUpperCase()) {
                case 'STRONG':
                    content += `<b>${formatDesc(childElement)}</b>`;
                    break;
                case 'UL':
                    content += '\n';
                    childElement.childNodes.forEach(ulChildNode => {
                        const elem = ulChildNode as HTMLElement;
                        if (elem.nodeType === Node.ELEMENT_NODE && elem.tagName.toUpperCase() === 'LI')
                            content += `* ${formatDesc(elem).trim()}\n`;
                        else if (elem.nodeType === Node.ELEMENT_NODE)
                            content += formatDesc(elem);
                        else if (elem.nodeType === Node.TEXT_NODE)
                            content += elem.textContent || '';
                        else if (elem.tagName.toUpperCase() === 'BR') {
                        }
                    });
                    break;
                case 'LI':
                    content += `* ${formatDesc(childElement).trim()}\n`;
                    break;
                case 'BR':
                    content += '\n\n';
                    break;
                case 'P':
                    content += `${formatDesc(childElement).trim()}\n\n`;
                    break;
                default:
                    content += formatDesc(childElement);
                    break;
            }

        }
        return content;
    }

    console.log(parseTime(when));

    const linkedinID = (() => {
        const url = window.location.href;
        const regex = /\/jobs\/view\/(\d+)\//;
        const match = url.match(regex);
        if (match) {
            return match[1];
        } else {
            const viewMatch = url.match(/currentJobId=(\d+)/);
            if (viewMatch)
                return viewMatch[1];
        }
        return '?';
    })();

    return {
        title: jobTitleElem.textContent!.trim(),
        company: companyNameElem.textContent!.trim(),
        description: formatDesc(descElem).trim(),
        location: location.trim(),
        datePosted: parseTime(when).toDateString(),
        url: `${linkedinID ? 'https://www.linkedin.com/jobs/view/' + linkedinID : window.location.href}`,
        internalId: linkedinID,
        source: 'LinkedIn',
        reposted: when.startsWith('Reposted'),
    };
}

export class LinkedInParser implements PostingParser {
    async parse(tab: browser.Tabs.Tab): Promise<ParseResult> {
        if (!tab.url || !tab.url.startsWith('https://www.linkedin.com/'))
            return new Error('Not a LinkedIn job posting page.');

        return await extractDetails(tab, getDetails);
    }
}