<script setup lang="ts">
import {notificationService} from '~/composables/useNotification';

// Helper function to get notification class based on type
const getNotificationClass = (type: string) => {
    const typeClasses = {
        success: 'bg-green-100 text-green-800 border-l-4 border-green-500',
        error: 'bg-red-100 text-red-800 border-l-4 border-red-500',
        warning: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500'
    };

    return typeClasses[type as keyof typeof typeClasses] || typeClasses.success;
};
</script>

<template>
  <div class="fixed left-1/2 transform -translate-x-1/2 top-4 z-50 flex flex-col gap-2">
    <transition-group name="notification">
      <div
        v-for="notification in notificationService.notifications.value"
        :key="notification.id"
        :class="['pl-6 pr-4 py-3 rounded shadow-lg flex items-center justify-between', getNotificationClass(notification.type)]"
      >
        <div>{{ notification.message }}</div>
        <button class="ml-3 flex-shrink-0" @click="() => notificationService.remove(notification.id)">
          <carbon-close/>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateY(-15px) translateX(-50%);
}

.notification-leave-to {
    opacity: 0;
    transform: translateY(-15px) translateX(-50%);
}
</style>
