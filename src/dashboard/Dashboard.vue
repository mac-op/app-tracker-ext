<script setup lang="ts">
import {provide, ref} from 'vue';
import JobList from "~/dashboard/JobList.vue";
import QueryBuilder from "~/dashboard/QueryBuilder.vue";
import NotificationPopup from "~/components/NotificationPopup.vue";
import axios from 'axios';
import {settingsLoaded, storedSettings} from "~/logic";
import {showNotification} from "~/composables/useNotification";

export interface JobAppResponse {
    id: string
    title: string
    company: string
    location: string
    description: string
    url: string
    date_applied: string
    date_posted?: string
    internal_id?: string
    source?: string
    reposted?: boolean
    files?: string[]
}

// Central state management
const jobs = ref<JobAppResponse[]>([]);
const loading = ref(false);

// Define query types
export interface Filter {
    field: string
    operator: string
    value: string | number | boolean
}

export interface FilterGroup {
    filters: Filter[]
    subgroups: FilterGroup[]
    operator: 'and' | 'or'
}

export interface Query {
    where: FilterGroup
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    limit?: number
    page?: number
}

// Initialize query state
const query = ref<Query>({
    where: {
        filters: [{
            field: '',
            operator: '',
            value: ''
        }],
        subgroups: [],
        operator: 'and'
    },
    limit: 30,
    page: 1
});


// Fetch jobs function that will be passed to QueryBuilder
const fetchJobs = async (updatedQuery: Query) => {
    try {
        if (!settingsLoaded.value) {
            query.value = updatedQuery;
            return;
        }

        loading.value = true;

        const cleanGroup = (group: FilterGroup): FilterGroup => {
            group.filters = group.filters
                .filter(f => f.operator === 'is_empty' || f.operator === 'is_not_empty' || (f.value !== '' && f.field))
            group.subgroups = group.subgroups
                .map(sg => cleanGroup(sg))
                .filter(sg => sg.filters.length > 0 || sg.subgroups.length > 0);
            return group;
        };

        // Clean and update the query
        const cleanedQuery = {
            ...updatedQuery,
            where: cleanGroup(updatedQuery.where)
        };

        // Store the updated query
        query.value = cleanedQuery;

        if (!storedSettings.value.backendUrl) {
            showNotification('Backend URL is not set. Please configure it in settings.', 'error');
            return;
        }

        const response = await axios.post<{ results: JobAppResponse[] }>(
            `${storedSettings.value.backendUrl}/applications`,
            cleanedQuery
        );

        jobs.value = response.data.results ? response.data.results : [];
        if (jobs.value.length === 0) {
            showNotification('No job applications found matching your criteria.', 'warning');
        } else {
            showNotification(`Found ${response.data.results.length} job applications.`, 'success');
        }
    } catch (err) {
        console.error('Failed to fetch filtered job applications:', JSON.stringify(err));
        showNotification('Failed to load job applications.', 'error');
    } finally {
        loading.value = false;
    }
};

watch(settingsLoaded, (isLoaded) => {
    if (isLoaded) {
        fetchJobs(query.value);
    }
}, {immediate: true});


// Provide shared state to child components
provide('jobs', jobs);
provide('loading', loading);
provide('fetchJobs', fetchJobs);
provide('query', query);
</script>

<template>
  <main class="px-4 py-10 text-gray-700 dark:text-gray-200">
    <NotificationPopup ref="notification"/>

    <QueryBuilder
      :query="query"
      @update:query="(newQuery) => query = newQuery"
      @fetch="fetchJobs"
    />
    <JobList/>
  </main>
</template>