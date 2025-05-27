<script setup lang="ts">

import {ref} from 'vue'
import {storedSettings} from "~/logic";
import InputBox from '~/components/InputBox.vue'
import parsePosting from '~/sidepanel/parse/parse'
import {capturedFiles} from "~/sidepanel/file";

const showSettings = ref(false)
const toggleSettings = () => showSettings.value = !showSettings.value

function getFileUrl(file: File): string {
  return URL.createObjectURL(file);
}

// Clean up object URLs when component is unmounted
onUnmounted(() => {
  capturedFiles.forEach(file => {
    const url = getFileUrl(file);
    URL.revokeObjectURL(url);
  });
});

const job = ref({
  title: '',
  company: '',
  description: '',
  location: '',
  datePosted: '',
  url: '',
  internalId: '',
  source: '',
  reposted: false
})

const clearJob = () => {
  job.value = {
    title: '',
    company: '',
    description: '',
    location: '',
    datePosted: '',
    url: '',
    internalId: '',
    source: '',
    reposted: false
  }
}

function updateJob() {
  parsePosting()
      .then((result) => {
        if (result instanceof Error) {
          console.error('Error parsing posting:', result)
          return
        }
        if (typeof result === 'string') {
          console.error('Unexpected result type:', result)
          return
        }
        console.log('Parsed posting:', result)
        job.value = {
          title: result.title || '',
          company: result.company || '',
          description: result.description || '',
          location: result.location || '',
          datePosted: result.datePosted instanceof Date
              ? result.datePosted.toDateString()
              : result.datePosted || '',
          url: result.url || '',
          internalId: result.internalId || '',
          source: result.source || '',
          reposted: result.reposted || false
        }
      })
      .catch((error) => {
        console.error('Error parsing posting:', error)
      })
}
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

      <div class="pt-5 px-1 flex items-center justify-between w-full">
        <button class="btn" @click="updateJob()">
          Parse this posting
        </button>
        <button class="text-blue-600 pr-4 hover:text-blue-800" @click="clearJob">Clear</button>
      </div>

      <div class="pt-5 pr-3">
        <div class="flex space-x-4">
          <InputBox class="flex-1" label="Title" v-model="job.title"/>
          <InputBox class="flex-1" label="Company" v-model="job.company"/>
        </div>
        <ResizeableInput label="Description" v-model="job.description"/>
        <div class="flex space-x-4">
          <InputBox class="flex-1" label="Location" v-model="job.location"/>
          <InputBox class="flex-1" label="Date Posted" v-model="job.datePosted"/>
        </div>
        <div class="flex space-x-4">
          <InputBox class="flex-1" label="Internal ID" v-model="job.internalId"/>
          <InputBox class="flex-1" label="Source" v-model="job.source"/>
        </div>
        <InputBox label="URL" v-model="job.url"/>

        <div class="pt-4">
          <div class="flex items-center">
            <input type="checkbox"
                   class="w-4 h-4 mr-2 accent-teal-600 hover:ring-teal-300 focus:ring-teal-500 focus:outline-none cursor-pointer"
                   v-model="job.reposted"/>
            <span>Reposted?</span>
          </div>
        </div>
      </div>

      <FileManager/>
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
        <InputBox
            v-model="storedSettings.backendUrl"
            label="Backend URL"
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

      </div>

      <div class="mt-10 flex justify-end">
        <button class="btn" @click="toggleSettings">
          Save and Close
        </button>
      </div>
    </template>
  </main>
</template>