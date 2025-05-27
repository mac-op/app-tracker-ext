<script setup lang="ts">
import FileUpload from './FileUpload.vue';
import FileCard from './FileCard.vue';
import FilePreviewModal from './FilePreviewModal.vue';
import {capturedFiles} from '~/sidepanel/file';
import {
  filePreviewStore,
  closeFilePreview,
  downloadCurrentFile,
  openCurrentFileInNewTab
} from '~/logic/filePreviewStore';

// Handle files added from file upload button
function handleFilesAdded(files: File[]) {
  // Directly add files to the capturedFiles array
  files.forEach(file => {
    console.log(`File added directly: ${file.name}, size: ${file.size} bytes`);
    capturedFiles.push(file);
  });
}

// Handle file removal
function removeFile(index: number) {
  capturedFiles.splice(index, 1);
}
</script>

<template>
  <div class="pt-5 pr-3">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-md font-medium">Captured Files ({{ capturedFiles.length }})</h3>
      <FileUpload @files-added="handleFilesAdded"/>
    </div>

    <!-- File cards grid -->
    <div v-if="capturedFiles.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      <FileCard
          v-for="(file, index) in capturedFiles"
          :key="index"
          :file="file"
          :index="index"
          @remove="removeFile"
      />
    </div>

    <!-- Empty state -->
    <div
        v-else
        class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center mt-3"
    >
      <carbon-document-blank class="w-12 h-12 text-gray-400 mx-auto mb-2"/>
      <p class="text-gray-500">No files have been captured yet</p>
      <p class="text-xs text-gray-400 mt-1">
        Files uploaded on websites will appear here automatically.
        <br>You can also manually upload files using the button above.
      </p>
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