import {useWebExtensionStorage} from '~/composables/useWebExtensionStorage'
import {ref} from 'vue'
import {LLMProvider} from "~/sidepanel/parse/llm";

export interface UserSettings {
    openaiOptions: {
        endpoint?: string
        model?: string
        auth: string
    },
    anthropicOptions: {
        endpoint?: string
        model?: string
        auth: string
        anthropicVersion?: string
    },
    ollamaOptions: {
        endpoint?: string
        model?: string
        auth?: string
    },
    googleOptions: {
        endpoint?: string
        model?: string
        auth: string
    },
    llmProvider: LLMProvider,
    backendUrl: string,
}

const settingsDefault = ref<UserSettings>({
    openaiOptions: {
        endpoint: 'https://api.openai.com/v1/responses',
        model: 'o4-mini',
        auth: '',
    },
    anthropicOptions: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3',
        auth: '',
        anthropicVersion: '2023-06-01',
    },
    ollamaOptions: {
        endpoint: 'http://localhost:11434/api/generate',
        model: 'gemma3:12b',
        auth: '',
    },
    googleOptions: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        model: 'gemini-2.0-flash',
        auth: '',
    },
    llmProvider: LLMProvider.OPENAI,
    backendUrl: '',
})


export const storageDemo = useWebExtensionStorage<string>('webext-demo', '')
export const storedSettings = useWebExtensionStorage<UserSettings>('settings', settingsDefault)