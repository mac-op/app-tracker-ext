<script setup lang="ts">
import {ref} from 'vue'

const props = defineProps<{
  title: string
  defaultOpen: boolean | undefined
}>()

const isOpen = ref<boolean>(props.defaultOpen || false)

const toggleAccordion = () => isOpen.value = !isOpen.value
</script>

<template>
  <div class="w-full py-2">
    <button
        type="button"
        @click="toggleAccordion"
        class="accordion"
    >
      <span class="font-medium px-1">{{ title }}</span>
      <carbon-chevron-down
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'transform rotate-180': isOpen }"
      />
    </button>
    <div
        v-show="isOpen"
        class="w-full mt-5 bg-white"
    >
      <slot></slot>
    </div>
  </div>
</template>