<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue'

export interface SelectOption {
    value: string
    label: string
}

const props = defineProps<{
    options: SelectOption[]
    modelValue?: string
    placeholder?: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedOption = ref<string | undefined>(props.modelValue)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => isOpen.value = !isOpen.value

const selectOption = (option: SelectOption): void => {
    selectedOption.value = option.value
    emit('update:modelValue', option.value)
    isOpen.value = false
}

const handleClickOutside = (event: MouseEvent): void => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const getSelectedLabel = (): string => {
    const option = props.options.find(opt => opt.value === selectedOption.value)
    return option ? option.label : props.placeholder || 'Select an option'
}
</script>

<template>
  <div ref="dropdownRef" class="relative w-full">
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md
        shadow-sm text-left text-gray-700 cursor-pointer hover:border-teal-500 focus:border-teal-500
        focus:outline-none flex items-center justify-between"
    >
      <span>{{ getSelectedLabel() }}</span>
      <carbon-chevron-down
        class="w-4 h-4 transition-transform duration-150"
        :class="{ 'transform rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
    >
      <div
        v-for="option in options"
        :key="option.value.toString()"
        @click="selectOption(option)"
        class="px-4 py-2 cursor-pointer hover:bg-teal-500 hover:text-white"
        :class="{ 'bg-teal-500 text-white': option.value === selectedOption }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>