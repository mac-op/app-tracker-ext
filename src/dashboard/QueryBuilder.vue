<script setup lang="ts">
import {inject, ref, reactive} from 'vue'
import {FilterGroup, Query} from "~/dashboard/Dashboard.vue"
import FilterMenu from "~/dashboard/FilterMenu.vue";

// Define props and emits
const props = defineProps({
    query: {
        type: Object as () => Query,
        required: true
    }
});

const emit = defineEmits(['update:query', 'fetch']);

// Field and operator options
const fieldOptions = [
    {value: 'id', label: 'ID'},
    {value: 'title', label: 'Job Title'},
    {value: 'company', label: 'Company'},
    {value: 'description', label: 'Description'},
    {value: 'location', label: 'Location'},
    {value: 'date_applied', label: 'Date Applied'},
    {value: 'date_posted', label: 'Date Posted'},
    {value: 'source', label: 'Source'}
];

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
];

// Local reactive copy of the query
const localQuery = reactive<Query>(JSON.parse(JSON.stringify(props.query)));

// Get the loading state from parent
const loading = inject('loading', ref(false));

const addFilter = (group: FilterGroup) => {
    group.filters.push({
        field: '',
        operator: '=',
        value: ''
    });
    emit('update:query', localQuery);
};

const removeFilter = (group: FilterGroup, index: number) => {
    group.filters.splice(index, 1);
    emit('update:query', localQuery);
};

const addSubgroup = (group: FilterGroup) => {
    group.subgroups.push({
        filters: [{
            field: '',
            operator: '=',
            value: ''
        }],
        subgroups: [],
        operator: 'and'
    });
    emit('update:query', localQuery);
};

const removeSubgroup = (group: FilterGroup, index: number) => {
    if (!group || !group.subgroups) {
        console.error('Invalid group or subgroups is undefined', group);
        return;
    }

    group.subgroups.splice(index, 1);
    emit('update:query', localQuery);
};

const toggleOperator = (group: FilterGroup) => {
    group.operator = group.operator === 'and' ? 'or' : 'and';
    emit('update:query', localQuery);
};

const resetFilters = () => {
    localQuery.where.filters = [{
        field: fieldOptions[0].value,
        operator: operatorOptions[0].value,
        value: ''
    }];
    localQuery.where.subgroups = [];
    localQuery.sort_by = undefined;
    localQuery.sort_order = undefined;
    localQuery.limit = 10;
    localQuery.page = 1;

    emit('update:query', localQuery);
};

// Initialize with an empty filter if none exists
if (localQuery.where.filters.length === 0) {
    addFilter(localQuery.where);
}

const handleSearch = () => {
    emit('fetch', localQuery);
};
</script>

<template>
  <div class="max-w-100pc mx-auto mb-6 border rounded-md p-4 bg-white dark:bg-gray-900">
    <h2 class="text-xl font-bold mb-4">Filter Applications</h2>

    <!-- Use the recursive FilterMenu component -->
    <FilterMenu
      :group="localQuery.where"
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
          v-model="localQuery.sort_by"
          :options="fieldOptions"
          placeholder="Select"
          class="ml-3 min-w-sm"
          @update:modelValue="emit('update:query', localQuery)"
        />

        <Dropdown
          v-model="localQuery.sort_order"
          :disabled="!localQuery.sort_by"
          :options="[
              {value: 'asc', label: 'Ascending'},
              {value: 'desc', label: 'Descending'}
          ]"
          @update:modelValue="emit('update:query', localQuery)"
        >
        </Dropdown>
      </div>

      <div class="pagination-section flex items-center gap-2 ml-10">
        <label class="text-sm font-medium">Limit:</label>
        <input
          v-model="localQuery.limit"
          class="box"
          @input="emit('update:query', localQuery)"
        />

        <label class="text-sm font-medium ml-2">Page:</label>
        <input
          v-model.number="localQuery.page"
          min="1"
          class="box max-w-15 pr-0"
          @input="emit('update:query', localQuery)"
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
        @click="handleSearch"
        class="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md flex items-center"
        :disabled="loading"
      >
        <span v-if="loading" class="i-carbon-circle-dash animate-spin mr-1"></span>
        <span v-else class="i-carbon-search mr-1"></span>
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
}
</style>