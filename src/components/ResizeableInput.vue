<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';

const props = defineProps<{
  label: string;
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  emit('update:modelValue', textarea.value);
  resizeTextarea(textarea);
};

const resizeTextarea = (element: HTMLTextAreaElement) => {
  // Reset height to auto so it can shrink if needed
  element.style.height = 'auto';
  // Set height to scrollHeight to fit all content
  element.style.height = `${Math.min(element.scrollHeight, 700)}px`;
};

onMounted(() => {
  if (textareaRef.value) {
    resizeTextarea(textareaRef.value);
  }
});

// Watch for changes to modelValue prop
watch(() => props.modelValue, () => {
  if (textareaRef.value) {
    // Need to use nextTick or setTimeout to ensure the textarea content is updated
    setTimeout(() => {
      resizeTextarea(textareaRef.value!);
    }, 0);
  }
});
</script>

<template>
  <div class="pt-4">
    <label class="font-medium mb-1 px-1">{{ label }}</label>
    <textarea
        ref="textareaRef"
        :value="modelValue"
        class="box w-full min-h-[40px] overflow-auto"
        @input="handleInput"
        @change="handleInput"
    ></textarea>
  </div>
</template>