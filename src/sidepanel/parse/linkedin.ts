import {ParseResult, PostingParser, PostingDate, extractDetails} from "./base";
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
    const [location, time, _] = details.split('·');

    function parseTime(time: string): PostingDate {
        const regex = /(\s*Reposted)?\s*(\d+)\s*(hour|day|week|month)s?\s*ago/i;
        const match = time.match(regex)!;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const ret = {
            from: new Date(),
            hours: 0,
            days: 0,
            weeks: 0,
            months: 0,
        }
        switch (unit) {
            case 'hour':
                ret.hours = value;
                break;
            case 'day':
                ret.days = value;
                break;
            case 'week':
                ret.weeks = value;
                break;
            case 'month':
                ret.months = value;
                break;
        }
        return ret;
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

    const linkedinID = (() => {
        const url = window.location.href;
        const regex = /\/jobs\/view\/(\d+)\//;
        const match = url.match(regex);
        if (match) {
            return match[0];
        } else {
            const viewMatch = url.match(/currentJobId=(\d+)/);
            if (viewMatch)
                return viewMatch[0];
        }
        return '?';
    })();

    return {
        title: jobTitleElem.textContent!,
        company: companyNameElem.textContent!,
        description: formatDesc(descElem).trim(),
        location: location,
        datePosted: parseTime(time),
        url: `${linkedinID ? 'https://www.linkedin.com/jobs/view/' + linkedinID : window.location.href}`,
        internalId: linkedinID,
        source: 'LinkedIn',
        reposted: time.startsWith('Reposted'),
    };
}

export class LinkedInParser implements PostingParser {
    async parse(): Promise<ParseResult> {
        const [tab] = await browser.tabs.query({active: true, currentWindow: true});
        if (!tab)
            return new Error('No active tab found.');
        if (!tab.url || !tab.url.startsWith('https://www.linkedin.com/'))
            return new Error('Not a LinkedIn job posting page.');

        return await extractDetails(tab, getDetails);
    }
}