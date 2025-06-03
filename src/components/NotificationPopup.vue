<script setup lang="ts">
import {ref, watch} from 'vue';

interface Props {
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning';
    duration?: number;
    position?: 'top' | 'bottom';
}

const props = withDefaults(defineProps<Props>(), {
    type: 'success',
    duration: 3000,
    position: 'top'
});

const emit = defineEmits(['update:show']);

const isVisible = ref(props.show);

watch(() => props.show, (newValue) => {
    isVisible.value = newValue;
    if (newValue && props.duration > 0) {
        setTimeout(() => {
            isVisible.value = false;
            emit('update:show', false);
        }, props.duration);
    }
});

const getNotificationClass = () => {
    const baseClasses = 'fixed left-1/2 transform -translate-x-1/2 pl-6 pr-4 py-3 rounded shadow-lg z-50 transition-linear duration-300 ease-in-out items-center flex-col';
    const positionClass = props.position === 'top' ? 'top-4' : 'bottom-4';

    const typeClasses = {
        success: 'bg-green-100 text-green-800 border-l-4 border-green-500',
        error: 'bg-red-100 text-red-800 border-l-4 border-red-500',
        warning: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
    }[props.type];

    return `${baseClasses} ${positionClass} ${typeClasses} ${isVisible.value ? 'opacity-100' : 'opacity-0'}`;
};
</script>

<template>
  <div
    v-show="isVisible"
    :class="getNotificationClass()"
  >
    <div class="flex justify-between items-center w-full">
      <div>
        <slot>{{ message }}</slot>
      </div>
      <button class="ml-3 flex-shrink-0" @click="() => emit('update:show', false)">
        <carbon-close/>
      </button>
    </div>
  </div>
</template>