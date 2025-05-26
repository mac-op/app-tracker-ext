<script setup lang="ts">
import {ref} from 'vue'
import {storedSettings} from "~/logic";

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
        <span> {{ storedSettings.openaiOptions }} </span>
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
        <ResizeableInput
            v-model="storedSettings.openaiOptions.auth"
            label="LLM Prompt"
        />

        <Accordion title="OpenAI" :defaultOpen="false">
          <InputBox
              v-model="storedSettings.openaiOptions.auth"
              label="Auth"
          />
          <InputBox
              v-model="storedSettings.openaiOptions.model"
              label="Model"
          />
        </Accordion>

        <Accordion title="Anthropic" :defaultOpen="false">
          <InputBox
              v-model="storedSettings.anthropicOptions.auth"
              label="Auth"
          />
          <InputBox
              v-model="storedSettings.anthropicOptions.model"
              label="Model"
          />
        </Accordion>
        <Accordion title="Google" :defaultOpen="false">
          <InputBox
              v-model="storedSettings.googleOptions.auth"
              label="Auth"
          />
          <InputBox
              v-model="storedSettings.googleOptions.model"
              label="Model"
          />
        </Accordion>

        <Accordion title="Ollama" :defaultOpen="false">
          <InputBox
              v-model="storedSettings.ollamaOptions.endpoint"
              label="Host"
          />
          <InputBox
              v-model="storedSettings.ollamaOptions.auth"
              label="Auth"
          />
          <InputBox
              v-model="storedSettings.ollamaOptions.model"
              label="Model"
          />
        </Accordion>

        <!--        <div>-->
        <!--          <label class="block text-sm font-medium mb-1">Enable Feature</label>-->
        <!--          <div class="flex items-center">-->
        <!--            <input type="checkbox" class="mr-2"/>-->
        <!--            <span>This is a sample feature</span>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>

      <div class="mt-10 flex justify-end">
        <button class="btn" @click="toggleSettings">
          Save and Close
        </button>
      </div>
    </template>
  </main>
</template>