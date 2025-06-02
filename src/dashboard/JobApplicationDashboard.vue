<script setup lang="ts">
import {ref, onMounted, computed, inject, watch} from 'vue'
import FilePreviewModal from '~/components/FilePreviewModal.vue'
import axios from "axios"
import {
    filePreviewStore,
    closeFilePreview,
    openFilePreview,
    downloadCurrentFile,
    openCurrentFileInNewTab
} from '~/logic/filePreviewStore'
import {storedSettings} from "~/logic";

export interface JobAppResponse {
    id: string
    title: string
    company: string
    location: string
    description: string
    url: string
    date_applied: string
    date_posted?: string
    internal_id?: string
    source?: string
    reposted?: boolean
    files?: string[]
}

const jobs = ref<JobAppResponse[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedJobId = ref<string | null>(null)
const previewLoading = ref(false)

const queryBuilderJobs = inject('jobs', ref([]))
const queryBuilderLoading = inject('loading', ref(false))
const queryBuilderError = inject('error', ref(null))
const queryBuilderFetchJobs = inject<Ref<() => {}> | null>('fetchJobs', null)

// Watch for updates from QueryBuilder
watch([queryBuilderJobs, queryBuilderLoading, queryBuilderError],
    ([newJobs, newLoading, newError]) => {
        jobs.value = newJobs
        loading.value = newLoading
        error.value = newError
    },
    {immediate: true}
)

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (date.toString() === 'Invalid Date') {
        return dateString
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const selectJob = (jobId: string) => {
    console.log('Selected job:', jobId)
    selectedJobId.value = jobId
}

// Get the currently selected job
const selectedJob = computed<JobAppResponse | null>(() => {
    if (!selectedJobId.value) return null
    return jobs.value.find(job => job.id === selectedJobId.value) || null
})

// Days since application was submitted
const daysSinceApplied = computed(() => {
    if (!selectedJob.value) return ''

    const appliedDate = new Date(selectedJob.value.date_applied)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - appliedDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
})

// Function to handle file preview
const handleFilePreview = async (appId: string, fileName: string) => {
    try {
        previewLoading.value = true
        // Fetch the file from the backend
        const response = await axios.get(`${storedSettings.value.backendUrl}/files/${appId}/${fileName}`)

        if (response.data && response.data.url) {
            // Fetch the actual file from the provided URL
            const fileResponse = await fetch(response.data.url)

            if (!fileResponse.ok)
                error.value = `Failed to fetch file: ${fileResponse.statusText}`

            // Get the file blob
            const blob = await fileResponse.blob()

            // Create a File object from the blob
            const file = new File([blob], fileName, {type: blob.type})

            // Open the file preview
            openFilePreview(file)
        } else {
            error.value = 'Invalid response format from server'
        }
    } catch (err) {
        console.error('Error fetching file:', err)
        error.value = `Failed to load file preview: ${(err as Error).message}`
    } finally {
        previewLoading.value = false
    }
}

onMounted(() => {
    if (!queryBuilderFetchJobs) return
    if (queryBuilderJobs.value?.length === 0 && queryBuilderFetchJobs.value) {
        (queryBuilderFetchJobs.value)()
    }
})
</script>

<template>
  <div class="h-screen flex flex-col max-w-100pc mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow items-stretch">
      <!-- Left Panel: Job List -->
      <div class="job-list md:col-span-1 border rounded-md overflow-hidden h-full flex flex-col">
        <div class="bg-gray-100 dark:bg-gray-800 p-3 border-b flex justify-between items-center">
          <h2 class="font-semibold">Applications ({{ jobs.length || 0 }})</h2>
        </div>

        <div v-if="error" class="p-3 text-sm text-red-700 bg-red-50">
          <p>{{ error }}</p>
        </div>

        <div class="job-items overflow-y-auto max-h-[70vh]">
          <!-- Loading indicator inside job list -->
          <div v-if="loading" class="p-4 text-center text-gray-500">
            <div
              class="animate-spin inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full mb-2"></div>
            <p>Loading job applications...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="jobs.length === 0" class="p-4 text-center text-gray-500">
            <p>No job applications found</p>
          </div>

          <!-- Job list items -->
          <template v-else>
            <div
              v-for="job in jobs"
              :key="job.id"
              @click="selectJob(job.id)"
              class="job-item p-3 cursor-pointer border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': selectedJobId === job.id }"
            >
              <div class="font-medium text-base">{{ job.title }}</div>
              <div class="company-name text-sm">{{ job.company }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ job.location }}</div>
              <div class="flex justify-between items-center mt-1">
                <div class="text-xs text-gray-500">
                  Applied: {{ formatDate(job.date_applied) }}
                </div>
                <div v-if="job.source" class="source text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {{ job.source }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Right Panel: Job Details -->
      <div class="job-details md:col-span-2 border rounded-md">
        <div v-if="selectedJob" class="h-full flex flex-col">
          <!-- Job Header -->
          <div class="job-header p-4 border-b">
            <h2 class="text-xl font-bold">{{ selectedJob.title }}</h2>
            <div class="company-location flex items-center">
              <div class="font-medium">{{ selectedJob.company }}</div>
              <div class="mx-2">•</div>
              <div>{{ selectedJob.location }}</div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Applied {{ formatDate(selectedJob.date_applied) }} ({{ daysSinceApplied }})
            </div>
          </div>

          <!-- Job Details Content -->
          <div class="job-content p-4 overflow-y-auto flex-grow">
            <!-- Source & Links Section -->
            <div class="mb-6 flex flex-wrap gap-2">
              <div v-if="selectedJob.source" class="source px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {{ selectedJob.source }}
              </div>
              <a
                v-if="selectedJob.url"
                :href="selectedJob.url"
                target="_blank"
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-sm inline-flex items-center"
              >
                <span class="i-carbon-launch mr-1"></span>
                View Original Posting
              </a>
            </div>

            <!-- Internal ID -->
            <div v-if="selectedJob.internal_id" class="mb-4">
              <h3 class="font-medium text-sm text-gray-500">Internal ID</h3>
              <div>{{ selectedJob.internal_id }}</div>
            </div>

            <!-- Description Section -->
            <div class="mb-6">
              <h3 class="font-medium mb-2">Job Description</h3>
              <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ selectedJob.description }}
              </div>
            </div>

            <!-- Attached Files Section -->
            <div v-if="selectedJob.files && selectedJob.files.length > 0" class="mb-6">
              <h3 class="font-medium mb-2">Attached Files</h3>
              <ul class="list-disc pl-5">
                <li v-for="(file, index) in selectedJob.files" :key="index" class="mb-1">
                  <span class="i-carbon-document mr-1"></span>
                  <a
                    href="#"
                    class="text-blue-600 hover:underline"
                    @click.prevent="handleFilePreview(selectedJob.id, file)"
                  >
                    {{ file }}
                    <span v-if="previewLoading"
                          class="ml-1 inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Dates Section -->
            <div class="dates-section grid grid-cols-2 gap-4">
              <div>
                <h3 class="font-medium text-sm text-gray-500">Date Applied</h3>
                <div>{{ formatDate(selectedJob.date_applied) }}</div>
              </div>
              <div v-if="selectedJob.date_posted">
                <h3 class="font-medium text-sm text-gray-500">Date Posted</h3>
                <div>{{ formatDate(selectedJob.date_posted) }}</div>
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="job-footer p-3 border-t bg-gray-50 dark:bg-gray-800">
            <div class="flex justify-end gap-2">
              <a
                v-if="selectedJob.url"
                :href="selectedJob.url"
                target="_blank"
                class="btn !py-1 !px-3 text-sm"
              >
                View Original
              </a>
            </div>
          </div>
        </div>

        <!-- No job selected state -->
        <div v-else class="h-full flex items-center justify-center text-gray-500">
          <p>Select a job application to view details</p>
        </div>
      </div>
    </div>

    <!-- File Preview Modal -->
    <FilePreviewModal
      :file="filePreviewStore.currentFile"
      :visible="filePreviewStore.isOpen"
      @close="closeFilePreview"
      @download="downloadCurrentFile"
      @open-in-new-tab="openCurrentFileInNewTab"
    />
  </div>
</template>