<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {openFilePreview} from '~/logic/filePreviewStore';

const props = defineProps<{
  file: File
  index: number
}>();

const emit = defineEmits<{
  (e: 'remove', index: number): void
}>();

// File URL for preview thumbnail
const fileUrl = ref('');

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '';
}

function getFileIcon(type: string): string {
  const fileType = type.split('/')[0];
  const fileSubtype = type.split('/')[1];

  if (fileType === 'image') return 'carbon-image';
  if (type === 'application/pdf') return 'carbon-document-pdf';
  if (fileType === 'text') return 'carbon-document-text';
  if (fileSubtype?.includes('excel') || fileSubtype?.includes('sheet')) return 'carbon-document-excel';
  if (fileSubtype?.includes('word') || fileSubtype?.includes('document')) return 'carbon-document-word';

  return 'carbon-document';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Function to preview file
function previewFile() {
  openFilePreview(props.file);
}

onMounted(() => {
  // Create object URL for thumbnail preview only
  fileUrl.value = URL.createObjectURL(props.file);
});

onUnmounted(() => {
  // Clean up the object URL
  if (fileUrl.value) {
    URL.revokeObjectURL(fileUrl.value);
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Preview area - make it clickable to view file -->
    <div
        class="h-32 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
        @click="previewFile"
    >
      <!-- Image preview for image files -->
      <img
          v-if="file.type.startsWith('image/')"
          :src="fileUrl"
          :alt="file.name"
          class="max-h-full max-w-full object-contain"
      />

      <!-- PDF preview -->
      <div v-else-if="file.type === 'application/pdf'" class="text-center">
        <carbon-document-pdf class="w-16 h-16 text-red-500 mx-auto"/>
        <span class="text-xs text-gray-500">PDF Document</span>
      </div>

      <!-- Default document icon for other files -->
      <div v-else class="text-center">
        <component :is="getFileIcon(file.type)" class="w-16 h-16 text-blue-400 mx-auto"/>
        <span class="text-xs text-gray-500">{{ file.type.split('/')[1]?.toUpperCase() || 'Document' }}</span>
      </div>
    </div>

    <!-- File info -->
    <div class="p-3">
      <div
          class="truncate text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600"
          :title="file.name"
          @click="previewFile"
      >
        {{ file.name }}
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
        <span class="text-xs text-gray-500">{{ getFileExtension(file.name) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-gray-50 px-3 py-2 flex justify-between border-t border-gray-200">
      <button
          @click="previewFile"
          class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
      >
        <carbon-view class="w-3.5 h-3.5 mr-1"/>
        View
      </button>
      <button
          @click="emit('remove', index)"
          class="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
      >
        <carbon-trash-can class="w-3.5 h-3.5 mr-1"/>
        Remove
      </button>
    </div>
  </div>
</template>