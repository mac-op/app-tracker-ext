<script setup lang="ts">

defineProps<{
  label: string;
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  emit('update:modelValue', textarea.value);
};

</script>

<template>
  <div class="pt-4">
    <label class="font-medium mb-1 px-1">{{ label }}</label>
    <input
        :value="modelValue"
        class="box w-full min-h-[40px] overflow-hidden"
        @input="handleInput"
        @change="handleInput"
    >
  </div>
</template>