<script setup lang="ts">
import {provide, ref} from 'vue';
import JobApplicationDashboard from "~/dashboard/JobApplicationDashboard.vue";
import QueryBuilder from "~/dashboard/QueryBuilder.vue";

// Create refs to share between components
const jobs = ref([]);
const loading = ref(false);
const error = ref(null);
const fetchJobs = ref<(() => {}) | null>(null);

// Provide these values to child components
provide('jobs', jobs);
provide('loading', loading);
provide('error', error);
provide('fetchJobs', fetchJobs); // Add this line
</script>

<template>
  <main class="px-4 py-10 text-gray-700 dark:text-gray-200">
    <QueryBuilder
      @update:jobs="(newJobs) => jobs = newJobs"
      @update:loading="(newLoading) => loading = newLoading"
      @update:error="(newError) => error = newError"
      @update:fetchJobs="(fn) => fetchJobs = fn"
    />
    <JobApplicationDashboard/>
  </main>
</template>