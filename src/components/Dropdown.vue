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
const highlightedIndex = ref<number>(-1)
const buttonRef = ref<HTMLButtonElement | null>(null)

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        const currentIndex = props.options.findIndex(opt => opt.value === selectedOption.value)
        highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
    }
}

const selectOption = (option: SelectOption): void => {
    selectedOption.value = option.value
    emit('update:modelValue', option.value)
    isOpen.value = false
    buttonRef.value?.focus()
}

const handleClickOutside = (event: MouseEvent): void => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

const handleKeyDown = (event: KeyboardEvent): void => {
    if (!isOpen.value && event.target !== buttonRef.value) {
        return
    }

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault()
            if (!isOpen.value) {
                toggleDropdown()
            } else {
                highlightedIndex.value = (highlightedIndex.value + 1) % props.options.length
                scrollToHighlighted()
            }
            break
        case 'ArrowUp':
            event.preventDefault()
            if (isOpen.value) {
                highlightedIndex.value = (highlightedIndex.value - 1 + props.options.length) % props.options.length
                scrollToHighlighted()
            }
            break
        case 'Enter':
        case ' ': // Space key
            if (event.target === buttonRef.value && !isOpen.value) {
                event.preventDefault()
                toggleDropdown()
            } else if (isOpen.value) {
                event.preventDefault()
                if (highlightedIndex.value >= 0 && highlightedIndex.value < props.options.length) {
                    selectOption(props.options[highlightedIndex.value])
                }
            }
            break
        case 'Escape':
            if (isOpen.value) {
                event.preventDefault()
                isOpen.value = false
                buttonRef.value?.focus()
            }
            break
        case 'Tab':
            if (isOpen.value) {
                isOpen.value = false
            }
            break
    }
}

const scrollToHighlighted = () => {
    if (isOpen.value && dropdownRef.value) {
        const menuItems = dropdownRef.value.querySelectorAll('.dropdown-item')
        if (menuItems[highlightedIndex.value]) {
            menuItems[highlightedIndex.value].scrollIntoView({ block: 'nearest' })
        }
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
      ref="buttonRef"
      type="button"
      @click="toggleDropdown"
      @keydown="handleKeyDown"
      class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md
        shadow-sm text-left text-gray-700 cursor-pointer hover:border-teal-500 focus:border-teal-500
        focus:outline-none flex items-center justify-between"
      tabindex="0"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <span>{{ getSelectedLabel() }}</span>
      <carbon-chevron-down
        class="w-4 h-4 transition-transform duration-150"
        :class="{ 'transform rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-auto max-h-60"
      role="listbox"
      @keydown="handleKeyDown"
    >
      <div
        v-for="(option, index) in options"
        :key="option.value.toString()"
        @click="selectOption(option)"
        class="px-4 py-2 cursor-pointer hover:bg-teal-500 hover:text-white dropdown-item"
        :class="{
          'bg-teal-500 text-white': option.value === selectedOption,
          'bg-teal-100': index === highlightedIndex && option.value !== selectedOption
        }"
        role="option"
        :aria-selected="option.value === selectedOption"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>