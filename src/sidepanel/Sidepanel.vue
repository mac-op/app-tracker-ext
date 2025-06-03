<script setup lang="ts">
import {ref} from 'vue'
import {storedSettings} from "~/logic";
import InputBox from '~/components/InputBox.vue'
import parsePosting from '~/sidepanel/parse/parse'
import {capturedFiles} from "~/sidepanel/file";
import axios from "axios";
import {onUnmounted} from "vue";
import browser from 'webextension-polyfill'
import NotificationPopup from '~/components/NotificationPopup.vue'

const showSettings = ref(false)
const toggleSettings = () => showSettings.value = !showSettings.value

const isSaving = ref(false)
const isParsing = ref(false)
const notification = ref({
    show: false,
    message: '',
    type: 'success'
})

const showNotification = (message: string, type = 'success') => {
    notification.value = {
        show: true,
        message,
        type
    }
}

function getFileUrl(file: File): string {
    return URL.createObjectURL(file);
}

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

async function parsePage() {
    if (isParsing.value) return
    isParsing.value = true

    try {
        const result = await parsePosting()

        if (result instanceof Error) {
            console.error('Error parsing posting:', result)
            showNotification(result.message || 'Error parsing job posting', 'error')
            return
        }

        if (typeof result === 'string') {
            console.error('Unexpected result type:', result)
            showNotification('Unexpected result format', 'error')
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

        showNotification('Job posting parsed successfully')
    } catch (error) {
        console.error('Error parsing posting:', error)
        showNotification('Failed to parse job posting', 'error')
    } finally {
        isParsing.value = false
    }
}

async function saveJob() {
    if (isSaving.value) return // Prevent multiple submissions

    isSaving.value = true
    const formData = new FormData();

    const applicationData = {
        title: job.value.title,
        description: job.value.description,
        company: job.value.company,
        location: job.value.location,
        url: job.value.url,
        date_posted: job.value.datePosted,
        internal_id: job.value.internalId,
        source: job.value.source,
        reposted: job.value.reposted,
        date_applied: new Date().toISOString(),
        num_files: capturedFiles.length
    };

    formData.append('application', JSON.stringify(applicationData));

    capturedFiles.forEach((file) => {
        formData.append('files', file);
    });

    const backendUrl = storedSettings.value.backendUrl || '';
    if (!backendUrl) {
        console.error('Backend URL not set in settings');
        showNotification('Please set Backend URL in settings', 'error');
        isSaving.value = false;
        return;
    }

    try {
        const response = await axios.post(`${backendUrl}/upload`, formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        });

        console.log(`${backendUrl} accepted request with response: \n${JSON.stringify(response.data)}`);
        showNotification('Job saved successfully!');
    } catch (error) {
        console.error('Error saving job:', error);
        showNotification('Failed to save job posting to all backends', 'error');
    }
    isSaving.value = false;
}
</script>

<template>
  <main class="w-full h-full px-4 py-5 text-gray-700">
    <NotificationPopup
      v-model:show="notification.show"
      :message="notification.message"
      :type="notification.type as ('warning' | 'error' | undefined | 'success')"
    />

    <template v-if="!showSettings">
      <div class="flex justify-between items-center w-full mb-4">
        <div class="flex items-center hover:text-teal-6 hover:cursor-pointer"
             @click="browser.runtime.openOptionsPage()">
          <Logo/>
          <span class="ml-2 text-lg font-semibold">Track yo shit </span>
        </div>
        <button
          class="p-2 text-gray-600 hover:text-gray-800 pr-4"
          @click="toggleSettings"
          title="Settings"
        >
          <carbon-settings class="w-5 h-5 scale-120"/>
        </button>
      </div>

      <div class="pt-5 px-1 flex items-center justify-between w-full">
        <button
          class="btn flex items-center justify-center"
          @click="parsePage()"
          :disabled="isParsing"
        >
          <span v-if="!isParsing">Parse this posting</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Parsing...
          </span>
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
      <div class="mt-10 flex justify-end pr-2">
        <button
          class="btn flex items-center justify-center relative"
          @click="saveJob()"
          :disabled="isSaving"
        >
          <span v-if="!isSaving">Save Job</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        </button>
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