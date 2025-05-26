import {ParseResult} from "~/sidepanel/parse/base";
import browser from "webextension-polyfill";
import {LinkedInParser} from "~/sidepanel/parse/linkedin";
import {LLMOptions, LLMParser, LLMProvider} from "~/sidepanel/parse/llm";
import {storedSettings} from "~/logic";

export default async function parsePosting(): Promise<ParseResult> {
    const [tab] = await browser.tabs.query({active: true, currentWindow: true});
    if (!tab)
        return new Error('No active tab found.');
    if (!tab.url)
        return new Error('Invalid URL.');

    if (tab.url.startsWith('https://www.linkedin.com/'))
        return new LinkedInParser().parse(tab);

    const llm = storedSettings.value.llmProvider;
    let options: LLMOptions = {};
    switch (llm) {
        case LLMProvider.OLLAMA:
            options = storedSettings.value.ollamaOptions;
            break;
        case LLMProvider.OPENAI:
            options = storedSettings.value.openaiOptions;
            break;
        case LLMProvider.GOOGLE:
            options = storedSettings.value.googleOptions;
            break;
        case LLMProvider.ANTHROPIC:
            options = storedSettings.value.anthropicOptions;
            break;
    }
    return new LLMParser(llm, options).parse(tab);
}