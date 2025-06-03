<script setup lang="ts">
import {watch, ref, onMounted, onUnmounted, computed} from 'vue';

const props = defineProps<{
    file: File | null;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'download'): void;
    (e: 'openInNewTab'): void;
}>();

const fileUrl = ref('');
const isImage = computed(() => props.file?.type.startsWith('image/'));
const isPdf = computed(() => props.file?.type === 'application/pdf');
const isText = computed(() => props.file?.type.startsWith('text/'));

// For text files
const textContent = ref('');

// Handle closing with escape key
function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && props.visible) {
        emit('close');
    }
}

// Handle file content based on type
function handleFileContent() {
    if (!props.file) return;

    // Clear previous content
    textContent.value = '';

    // Create object URL for binary files
    fileUrl.value = URL.createObjectURL(props.file);

    // For text files, also load the content
    if (isText.value) {
        const reader = new FileReader();
        reader.onload = (e) => {
            textContent.value = e.target?.result as string || '';
        };
        reader.readAsText(props.file);
    }
}

// Handle modal click background to close
function handleBackgroundClick(event: MouseEvent) {
    // Only close if clicking directly on the background (not its children)
    if ((event.target as HTMLElement).classList.contains('modal-background')) {
        emit('close');
    }
}

// Open in new tab
function openInNewTab() {
    emit('openInNewTab');
}

// Download file
function downloadFile() {
    emit('download');
}

// Watch for changes to the file prop
watch(() => props.file, (newFile) => {
    if (newFile) {
        handleFileContent();
    }
}, {immediate: true});

// Add event listeners
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
});

// Clean up
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    if (fileUrl.value) {
        URL.revokeObjectURL(fileUrl.value);
    }
});
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible && file"
        class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center modal-background"
        @click="handleBackgroundClick"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b">
            <h3 class="font-medium text-gray-800 truncate max-w-lg" :title="file?.name">
              {{ props.file?.name }}
            </h3>
            <div class="flex items-center space-x-2">
              <!-- Download button -->
              <button
                @click="downloadFile"
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                title="Download"
              >
                <carbon-download class="w-5 h-5"/>
              </button>

              <!-- Open in new tab button -->
              <button
                @click="openInNewTab"
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                title="Open in new tab"
              >
                <carbon-launch class="w-5 h-5"/>
              </button>

              <!-- Close button -->
              <button
                @click="emit('close')"
                class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                title="Close"
              >
                <carbon-close class="w-5 h-5"/>
              </button>
            </div>
          </div>

          <!-- Content area -->
          <div
            class="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100"
            :class="{ 'h-[70vh]': isPdf }"
          >
            <!-- Image preview -->
            <img
              v-if="isImage"
              :src="fileUrl"
              :alt="file?.name"
              class="max-w-full max-h-full object-contain"
            />

            <!-- PDF preview -->
            <div v-else-if="isPdf" class="w-full h-full min-h-screen-lg flex flex-col">
              <iframe
                :src="fileUrl"
                class="w-full flex-grow border-0 overflow-hidden"
              />
            </div>

            <!-- Text preview -->
            <pre
              v-else-if="isText"
              class="w-full h-full p-4 bg-white border rounded overflow-auto text-sm font-mono"
            >{{ textContent }}</pre>

            <!-- Fallback for unsupported file types -->
            <div v-else class="text-center p-8">
              <div class="bg-gray-50 p-8 rounded-lg inline-block mb-4">
                <component
                  :is="file?.type === 'application/pdf' ? 'carbon-document-pdf' : 'carbon-document'"
                  class="w-24 h-24 text-gray-400"
                />
              </div>
              <p class="text-gray-700">Preview not available for this file type</p>
              <p class="text-gray-500 text-sm mt-1">{{ file?.type }}</p>
              <button
                @click="downloadFile"
                class="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-sm inline-flex items-center"
              >
                <carbon-download class="w-4 h-4 mr-2"/>
                Download File
              </button>
            </div>
          </div>

          <!-- Footer with file info -->
          <div class="border-t p-3 bg-gray-50 text-sm text-gray-600 flex justify-between items-center">
            <div>
              Type: <span class="font-medium">{{ file?.type || 'Unknown' }}</span>
            </div>
            <div>
              Size: <span class="font-medium">{{ file ? Math.round(file.size / 1024) + ' KB' : 'Unknown' }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
