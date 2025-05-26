import {extractDetails, JobPosting, ParseResult, PostingParser} from './base';
import axios from "axios";

const PROMPT = "You are a job posting parser. " +
    "You will be given a text of a page that contains a job posting details. " +
    "Extract only the job posting details from the text." +
    "The result should be a single JSON object with the following fields:\n" +
    "type JobPosting = {\n" +
    "    title: string;\n" +
    "    company: string;\n" +
    "    description: string;\n" +
    "    location: string;\n" +
    "    datePosted: Date | null;\n" +
    "    url: string;\n" +
    "    internalId: string | null;\n" +
    "    source: string;\n" +
    "    reposted?: boolean;\n" +
    "}\n" +
    "Note that not all fields are required, but the title, company, description, location, and url are required.\n" +
    "The description field of the object (not the entire object) should be formatted properly" +
    "(especially for elements like bullet lists and paragraphs and headings)\n" +
    "The description field is the most important field in the object. Do not omit important information. Add as much relevant text as possible.\n" +
    "Return the result as a JSON object (without backticks for formatting) without any additional text or explanation or quotes or escape characters (no ``` ``` formatting)\n" +
    "This is the url of the page: {url}\n" +
    "This is the text of the page: {text}\n"

/**
 * Generic type for request body formatters
 */
interface LLMOptions {
    endpoint?: string,
    model?: string,
    auth?: string,

    [key: string]: any
}

type RequestHandle = (prompt: string, options: LLMOptions) => Promise<ParseResult>;

export enum LLMProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GOOGLE = 'google',
    OLLAMA = 'ollama',
    UNKNOWN = 'unknown'
}

/**
 * Supported LLM providers and their formatters
 */
const LLM_CONFIG: Record<LLMProvider, RequestHandle> = {
    openai: async (prompt: string, options) => {
        return await axios.post(
            options.endpoint || 'https://api.openai.com/v1/responses',
            {
                model: options.model || 'o4-mini',
                input: prompt,
            },
            {headers: {'Authorization': `Bearer ${options.auth}`}}
        ).then(
            (response) => {
                const output = response.data.output as any[];
                const content = output.find(m => m.type === 'message').content;
                return JSON.parse(content[0].text) as JobPosting;
            }
        ).catch(error => new Error(`OpenAI API request failed: ${error}`));
    },
    anthropic: async (prompt: string, options) => {
        return axios.post(
            options.endpoint || 'https://api.anthropic.com/v1/messages',
            {
                model: options.model || 'claude-3',
                messages: [{role: 'user', content: prompt}]
            },
            {
                headers: {
                    'x-api-key': `${options.auth}`,
                    'anthropic-version': options.anthropicVersion || '2023-06-01',
                }
            }
        ).then(response => JSON.parse(response.data.completion) as JobPosting)
            .catch(error => new Error(`Anthropic API request failed: ${error}`));
    },
    google: async (prompt: string, options) => {
        return await axios.post(
            `${options.endpoint || 'https://generativelanguage.googleapis.com/v1beta/models'}/` +
            `${options.model || 'gemini-2.5-flash'}:generateContent?key=${options.auth}`,
            {contents: [{parts: [{"text": prompt}]}]}
        ).then(response => JSON.parse(response.data.candidates[0].content.parts[0].text) as JobPosting)
            .catch(error => new Error(`Google API request failed: ${error}`));
    },
    ollama: async (prompt: string, options) => {
        return axios.post(
            options.endpoint || 'http://localhost:11434/api/generate',
            {
                model: options.model || 'deepseek-r1',
                prompt: prompt,
                stream: false,
            },
            {headers: {'Authorization': `Bearer ${options.auth}`}}
        ).then(response => {
            if (response.status !== 200)
                return new Error(`Ollama API request failed: ${response.statusText}`);
            const obj = response.data.response as string;
            console.log(obj);
            return JSON.parse(obj.replace(/```(json)?/g, '')) as JobPosting;
        }).catch(error => new Error(`Ollama API request failed: ${error}`));
    },
    unknown: (_, __) => Promise.reject(new Error('Unknown LLM provider'))
};

export class LLMParser implements PostingParser {
    private provider: LLMProvider;
    private options: LLMOptions;

    changeProvider(provider: LLMProvider, options: LLMOptions = {endpoint: ""}) {
        if (provider === LLMProvider.UNKNOWN)
            throw new Error('Cannot change to unknown provider');
        this.provider = provider;
        this.options = options;
    }

    constructor(provider = LLMProvider.UNKNOWN, options: LLMOptions = {endpoint: ""}) {
        this.provider = provider;
        this.options = options;
    }

    async sendLLMRequest(url: string, text: string): Promise<ParseResult> {
        const formattedPrompt = PROMPT
            .replace('{url}', url)
            .replace('{text}', text);

        const requestHandle = LLM_CONFIG[this.provider];
        if (!requestHandle)
            return new Error('Unsupported LLM provider');

        return await requestHandle(formattedPrompt, this.options)
            .catch(e => new Error(`LLM API request failed: ${e}`));
    }

    async parse(): Promise<ParseResult> {
        const [tab] = await browser.tabs.query({active: true, currentWindow: true});
        if (!tab)
            return new Error('No active tab found.');
        if (!tab.url)
            return new Error('No URL found for the active tab.');

        const text = await extractDetails(tab, () => document.body.innerText) as string;

        return this.sendLLMRequest(tab.url, text);
    }
}
