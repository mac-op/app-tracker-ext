<script setup lang="ts">
import {ref} from 'vue'
import {storedSettings} from "~/logic";
// import {storedSettings} from '~/logic/storage'
const showSettings = ref(false)
const toggleSettings = () => showSettings.value = !showSettings.value

</script>

<template>
  <main class="w-full h-full px-4 py-5 text-gray-700">
    <template v-if="!showSettings">
      <div class="flex justify-between items-center w-full mb-4">
        <div class="flex items-center">
          <Logo/>
          <span class="ml-2 text-lg font-semibold">Track yo shit</span>
        </div>
        <button
            class="p-2 text-gray-600 hover:text-gray-800"
            @click="toggleSettings"
            title="Settings"
        >
          <carbon-settings class="w-5 h-5"/>
        </button>
      </div>

      <div class="mt-2">
        <button class="btn">
          Parse this posting
        </button>
        <span> {{ storedSettings.openaiOptions.auth }}</span>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center w-full mb-8">
        <button
            class="text-gray-600 hover:text-gray-800 mr-2"
            @click="toggleSettings"
            title="Back"
        >
          <carbon-chevron-left class="w-5 h-5"/>
        </button>
        <h1 class="text-lg font-medium">Settings</h1>
      </div>

      <div class="m-2 space-y-5">

        <div>
          <label class="block font-medium mb-1 px-1">LLM Provider</label>
          <Dropdown
              v-model="storedSettings.llmProvider"
              :options="
               [
                  { label: 'OpenAI', value: 'openai' },
                  { label: 'Anthropic', value: 'anthropic' },
                  { label: 'Google', value: 'google' },
                  { label: 'Ollama', value: 'ollama' },
               ]"
              placeholder="Select an option"
              class="w-full">
          </Dropdown>
        </div>
        <div>
          <label class="font-medium mb-1 px-1">Setting 1</label>
          <input type="text" class="box"/>
        </div>

        <Accordion title="OpenAI" :defaultOpen="false">
          <div>
            <label class="font-medium mb-1 px-1">Auth</label>
            <input
                type="text" :value="storedSettings.openaiOptions.auth" class="box"
                @change="(event: Event) => storedSettings.openaiOptions.auth = (event.target as HTMLInputElement).value"
            />
          </div>
          <div>
            <label class="font-medium mb-1 px-1">Model</label>
            <input
                type="text" :value="storedSettings.openaiOptions.model" class="box"
                @change="(event: Event) => storedSettings.openaiOptions.model = (event.target as HTMLInputElement).value"
            />
          </div>
        </Accordion>

        <Accordion title="Anthropic" :defaultOpen="false">
          <div>
            <label class="font-medium mb-1 px-1">Auth</label>
            <input
                type="text" :value="storedSettings.anthropicOptions.auth" class="box"
                @change="(event: Event) => storedSettings.anthropicOptions.auth = (event.target as HTMLInputElement).value"
            />
          </div>
          <div>
            <label class="font-medium mb-1 px-1">Model</label>
            <input
                type="text" :value="storedSettings.anthropicOptions.model" class="box"
                @change="(event: Event) => storedSettings.anthropicOptions.model = (event.target as HTMLInputElement).value"
            />
          </div>
        </Accordion>
        <Accordion title="Google" :defaultOpen="false">
          <div>
            <label class="font-medium mb-1 px-1">Auth</label>
            <input
                type="text" :value="storedSettings.googleOptions.auth" class="box"
                @change="(event: Event) => storedSettings.googleOptions.auth = (event.target as HTMLInputElement).value"
            />
          </div>
          <div>
            <label class="font-medium mb-1 px-1">Model</label>
            <input
                type="text" :value="storedSettings.googleOptions.model" class="box"
                @change="(event: Event) => storedSettings.googleOptions.model = (event.target as HTMLInputElement).value"
            />
          </div>
        </Accordion>

        <Accordion title="Ollama" :defaultOpen="false">
          <div>
            <label class="font-medium mb-1 px-1">Endpoint</label>
            <input
                type="text" :value="storedSettings.ollamaOptions.endpoint" class="box"
                @change="(event: Event) => storedSettings.ollamaOptions.endpoint = (event.target as HTMLInputElement).value"
            />
          </div>

          <div>
            <label class="font-medium mb-1 px-1">Auth</label>
            <input
                type="text" :value="storedSettings.ollamaOptions.auth" class="box"
                @change="(event: Event) => storedSettings.ollamaOptions.auth = (event.target as HTMLInputElement).value"
            />
          </div>
          <div>
            <label class="font-medium mb-1 px-1">Model</label>
            <input
                type="text" :value="storedSettings.ollamaOptions.model" class="box"
                @change="(event: Event) => storedSettings.ollamaOptions.model = (event.target as HTMLInputElement).value"
            />
          </div>
        </Accordion>

        <div>
          <label class="block text-sm font-medium mb-1">Enable Feature</label>
          <div class="flex items-center">
            <input type="checkbox" class="mr-2"/>
            <span>This is a sample feature</span>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end">
        <button class="btn" @click="toggleSettings">
          Save and Close
        </button>
      </div>
    </template>
  </main>
</template>