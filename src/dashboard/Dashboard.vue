<script setup lang="ts">
import {provide, ref} from 'vue';
import JobApplicationDashboard from "~/dashboard/JobApplicationDashboard.vue";
import QueryBuilder from "~/dashboard/QueryBuilder.vue";
import NotificationPopup from '~/components/NotificationPopup.vue';

const jobs = ref([]);
const loading = ref(false);
const error = ref(null);
const fetchJobs = ref<(() => {}) | null>(null);
const notification = ref({
    show: false,
    message: '',
    type: 'success'
});

// Provide child components
provide('jobs', jobs);
provide('loading', loading);
provide('error', error);
provide('fetchJobs', fetchJobs);
provide('showNotification', (message: string, type = 'error') => {
    notification.value = {
        show: true,
        message,
        type
    };
});
</script>

<template>
  <main class="px-4 py-10 text-gray-700 dark:text-gray-200">
    <NotificationPopup
      v-model:show="notification.show"
      :message="notification.message"
      :type="notification.type as ('warning' | 'error' | undefined | 'success')"
      :duration="5000"
    />

    <QueryBuilder
      @update:jobs="(newJobs) => jobs = newJobs"
      @update:loading="(newLoading) => loading = newLoading"
      @update:error="(newError) => error = newError"
      @update:fetchJobs="(fn) => fetchJobs = fn"
    />
    <JobApplicationDashboard/>
  </main>
</template>