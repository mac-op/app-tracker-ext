<script setup lang="ts">
import {ref, reactive} from 'vue'
import axios from 'axios'
import {storedSettings} from "~/logic"
import {JobAppResponse} from "~/dashboard/JobApplicationDashboard.vue"
import FilterGroup from "~/dashboard/FilterGroup.vue" // Import the new component

interface Filter {
    field: string
    operator: string
    value: string | number | boolean
}

interface FilterGroup {
    filters: Filter[]
    subgroups: FilterGroup[]
    operator: 'and' | 'or'
}

interface Query {
    where: FilterGroup
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    limit?: number
    page?: number
}

const fieldOptions = [
    {value: 'id', label: 'ID'},
    {value: 'title', label: 'Job Title'},
    {value: 'company', label: 'Company'},
    {value: 'description', label: 'Description'},
    {value: 'location', label: 'Location'},
    {value: 'date_applied', label: 'Date Applied'},
    {value: 'date_posted', label: 'Date Posted'},
    {value: 'source', label: 'Source'}
]

const operatorOptions = [
    {value: '=', label: 'Equals'},
    {value: '!=', label: 'Not Equals'},
    {value: 'contains', label: 'Contains'},
    {value: 'not_contains', label: 'Not Contains'},
    {value: '>', label: 'Greater Than'},
    {value: '<', label: 'Less Than'},
    {value: '>=', label: 'Greater Than or Equals'},
    {value: '<=', label: 'Less Than or Equals'},
    {value: 'is_empty', label: 'Is Empty'},
    {value: 'is_not_empty', label: 'Is Not Empty'}
]

// Initialize query state
const query = reactive<Query>({
    where: {
        filters: [],
        subgroups: [],
        operator: 'and'
    },
    limit: 30,
    page: 1
})

const jobs = ref<JobAppResponse[] | null>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Emit events for parent components
const emit = defineEmits(['update:jobs', 'update:loading', 'update:error', 'update:fetchJobs'])

const addFilter = (group: FilterGroup) => {
    group.filters.push({
        field: fieldOptions[0].value,
        operator: operatorOptions[0].value,
        value: ''
    })
}

const removeFilter = (group: FilterGroup, index: number) => {
    group.filters.splice(index, 1)
}

const addSubgroup = (group: FilterGroup) => {
    group.subgroups.push({
        filters: [{
            field: fieldOptions[0].value,
            operator: operatorOptions[0].value,
            value: ''
        }],
        subgroups: [],
        operator: 'and'
    })
}

const removeSubgroup = (group: FilterGroup, index: number) => {
    if (!group || !group.subgroups) {
        console.error('Invalid group or subgroups is undefined', group);
        return;
    }

    group.subgroups.splice(index, 1)
}

// Toggle the operator of the specified group
const toggleOperator = (group: FilterGroup) => {
    group.operator = group.operator === 'and' ? 'or' : 'and'
}

// Function to fetch filtered jobs
const fetchJobs = async () => {
    try {
        loading.value = true
        error.value = null
        emit('update:loading', true)
        emit('update:error', null)

        const cleanGroup = (group: FilterGroup): FilterGroup => {
            group.filters = group.filters.filter(f => f.value !== '')
                .map(f => {
                    if (f.operator === 'is_empty' || f.operator === 'is_not_empty') {
                        return {
                            field: f.field,
                            operator: f.operator === 'is_empty' ? '=' : '!=',
                            value: 'NULL'
                        }
                    }
                    return f
                })
            group.subgroups = group.subgroups
                .map(sg => cleanGroup(sg))
                .filter(sg => sg.filters.length > 0 || sg.subgroups.length > 0)
            return group
        }

        query.where = cleanGroup(query.where)

        const response = await axios.post<{ results: JobAppResponse[] }>(
            `${storedSettings.value.backendUrl}/applications`,
            query
        )
        jobs.value = response.data.results
        emit('update:jobs', response.data.results)
    } catch (err) {
        console.error('Failed to fetch filtered job applications:', err)
        error.value = 'Failed to load job applications. Please try again later.'
        emit('update:error', 'Failed to load job applications. Please try again later.')
    } finally {
        loading.value = false
        emit('update:loading', false)
    }
}

// Reset all filters
const resetFilters = () => {
    query.where.filters = [{
        field: fieldOptions[0].value,
        operator: operatorOptions[0].value,
        value: ''
    }]
    query.where.subgroups = []
    query.sort_by = undefined
    query.sort_order = undefined
    query.limit = 10
    query.page = 1
}

// Initialize with an empty filter if none exists
if (query.where.filters.length === 0) {
    addFilter(query.where)
}

// Expose the fetchJobs function
emit('update:fetchJobs', fetchJobs)

// Make available to parent components
defineExpose({jobs, loading, error, fetchJobs})
</script>

<template>
  <div class="max-w-100pc mx-auto mb-6 border rounded-md p-4 bg-white dark:bg-gray-900">
    <h2 class="text-xl font-bold mb-4">Filter Applications</h2>

    <!-- Use the recursive FilterGroup component -->
    <FilterGroup
      :group="query.where"
      :level="0"
      :field-options="fieldOptions"
      :operator-options="operatorOptions"
      @add-filter="addFilter"
      @remove-filter="removeFilter"
      @add-subgroup="addSubgroup"
      @remove-subgroup="removeSubgroup"
      @toggle-operator="toggleOperator"
    />

    <!-- Sort and pagination options -->
    <div class="flex flex-wrap gap-4 mt-4 p-3 border rounded-md">
      <div class="sort-section flex flex-row items-center gap-4">
        <label class="text-sm font-medium whitespace-nowrap">Sort by:</label>
        <Dropdown
          v-model="query.sort_by"
          :options="fieldOptions"
          placeholder="Select"
          class="ml-3 min-w-sm"
        />

        <Dropdown
          v-model="query.sort_order"
          :disabled="!query.sort_by"
          :options="[
              {value: 'asc', label: 'Ascending'},
              {value: 'desc', label: 'Descending'}
          ]"
        >
        </Dropdown>
      </div>

      <div class="pagination-section flex items-center gap-2 ml-10">
        <label class="text-sm font-medium">Limit:</label>
        <input
          v-model="query.limit"
          class="box"
        />

        <label class="text-sm font-medium ml-2">Page:</label>
        <input
          v-model.number="query.page"
          min="1"
          class="box max-w-15 pr-0"
        />
      </div>
    </div>

    <div class="action-buttons flex gap-2 mt-4 justify-end">
      <button
        @click="resetFilters"
        class="px-3 py-1.5 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md"
      >
        Reset Filters
      </button>

      <button
        @click="fetchJobs"
        class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md flex items-center"
        :disabled="loading"
      >
        <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-1"></span>
        <span v-else class="i-carbon-search mr-1"></span>
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
}
</style>