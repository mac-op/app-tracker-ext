<script setup lang="ts">
import {ref} from 'vue';

// Event to emit when files are added
const emit = defineEmits<{
  (e: 'filesAdded', files: File[]): void
}>();

// Reference to file input element
const fileInputRef = ref<HTMLInputElement | null>(null);

// Handle file input change
function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const files = Array.from(input.files);
    emit('filesAdded', files);

    // Clear the input value to allow uploading the same file again
    input.value = '';
  }
}

// Trigger file input click when button is clicked
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}
</script>

<template>
  <div>
    <!-- Hidden file input -->
    <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        @change="handleFileUpload"
    />

    <!-- Upload button -->
    <button
        @click="triggerFileInput"
        class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md cursor-pointer text-sm font-medium transition-colors"
    >
      <carbon-upload class="w-4 h-4 mr-1.5"/>
      Upload Files
    </button>
  </div>
</template>