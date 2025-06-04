<script setup lang="ts">
import {Filter, FilterGroup} from "~/dashboard/Dashboard.vue";

const props = defineProps({
    group: {
        type: Object as () => FilterGroup,
        required: true
    },
    level: {
        type: Number,
        default: 0
    },
    fieldOptions: {
        type: Array as () => { value: string, label: string }[],
        required: true
    },
    operatorOptions: {
        type: Array as () => { value: string, label: string }[],
        required: true
    }
});

const emit = defineEmits(['add-filter', 'remove-filter', 'add-subgroup', 'remove-subgroup', 'toggle-operator', 'remove-this-group']);

const levelColors = [
    {
        border: 'border-indigo-500', andBg: 'bg-indigo-50', orBg: 'bg-amber-50',
        andText: 'text-indigo-800', orText: 'text-amber-800',
        darkAndBg: 'dark:bg-indigo-900/30', darkOrBg: 'dark:bg-amber-900/30'
    },
    {
        border: 'border-teal-500', andBg: 'bg-teal-50', orBg: 'bg-orange-50',
        andText: 'text-teal-800', orText: 'text-orange-800',
        darkAndBg: 'dark:bg-teal-900/30', darkOrBg: 'dark:bg-orange-900/30'
    },
    {
        border: 'border-violet-500', andBg: 'bg-violet-50', orBg: 'bg-yellow-50',
        andText: 'text-violet-800', orText: 'text-yellow-800',
        darkAndBg: 'dark:bg-violet-900/30', darkOrBg: 'dark:bg-yellow-900/30'
    },
    {
        border: 'border-pink-500', andBg: 'bg-pink-50', orBg: 'bg-lime-50',
        andText: 'text-pink-800', orText: 'text-lime-800',
        darkAndBg: 'dark:bg-pink-900/30', darkOrBg: 'dark:bg-lime-900/30'
    },
    {
        border: 'border-blue-500', andBg: 'bg-blue-50', orBg: 'bg-red-50',
        andText: 'text-blue-800', orText: 'text-red-800',
        darkAndBg: 'dark:bg-blue-900/30', darkOrBg: 'dark:bg-red-900/30'
    }
];

const getLevelColors = () => {
    const colorIndex = props.level % levelColors.length;
    return levelColors[colorIndex];
};

const getBorderStyle = () => {
    const width = Math.min(props.level + 2, 5);  // Increase border width with nesting (max 5px)
    return {'border-left-width': `${width}px`};
};

const getBgColorClass = () => {
    const colors = getLevelColors();
    return props.group.operator === 'and'
        ? `${colors.andBg} ${colors.darkAndBg}`
        : `${colors.orBg} ${colors.darkOrBg}`;
};

const getOperatorTextClass = () => {
    const colors = getLevelColors();
    return props.group.operator === 'and'
        ? colors.andText
        : colors.orText;
};

// Get the border color class
// const getBorderColorClass = () => {
//     const colors = getLevelColors();
//     return colors.border;
// };

// Handler functions that emit events to parent
const addFilter = () => emit('add-filter', props.group);
const removeFilter = (index: number) => emit('remove-filter', props.group, index);
const addSubgroup = () => emit('add-subgroup', props.group);
// const removeSubgroup = (index: number) => emit('remove-subgroup', props.group, index);
const toggleOperator = () => emit('toggle-operator', props.group);
</script>

<template>
  <div
    class="p-3 rounded-md my-2 "
    :class="[getBgColorClass(), props.level > 0 ? 'ml-4' : '']"
    :style="getBorderStyle()"
  >
    <!-- Group operator toggle -->
    <div class="flex items-center mb-2">
      <div class="text-sm font-medium mr-2">Match:</div>
      <button
        @click="toggleOperator"
        :class="{
          'px-2 py-1 text-xs rounded-md font-medium border': true,
          [getOperatorTextClass()]: true,
          'border-indigo-400': group.operator === 'and',
          'border-amber-400': group.operator === 'or'
        }"
      >
        {{ group.operator === 'and' ? 'ALL (AND)' : 'ANY (OR)' }}
      </button>

      <span v-if="level > 0" class="icon-btn pl-5 " @click="$emit('remove-this-group')">
          <carbon-trash-can/>
        </span>
    </div>

    <!-- Filters in this group -->
    <div
      v-for="(filter, index) in group.filters"
      :key="`filter-${level}-${index}`"
      class="filter-row flex items-center gap-2 mb-2"
    >
      <Dropdown
        v-model="filter.field"
        :options="fieldOptions"
        placeholder="Select field"
        class="max-w-md"
      />

      <Dropdown
        v-model="filter.operator"
        :options="operatorOptions"
        class="max-w-md"
      />

      <input
        v-model="filter.value"
        :disabled="filter.operator === 'is_empty' || filter.operator === 'is_not_empty'"
        class="box w-full min-h-[40px] overflow-hidden"
      />

      <span class="icon-btn" @click="removeFilter(index)">
          <carbon-trash-can/>
        </span>

    </div>

    <div v-for="(subgroup, subIndex) in group.subgroups" :key="`subgroup-${level}-${subIndex}`">
      <FilterMenu
        :group="subgroup"
        :level="level + 1"
        :field-options="fieldOptions"
        :operator-options="operatorOptions"
        @add-filter="$emit('add-filter', $event)"
        @remove-filter="(group:Filter, index:number) => $emit('remove-filter', group, index)"
        @add-subgroup="$emit('add-subgroup', $event)"
        @remove-subgroup="(nestedGroup:FilterGroup, nestedIndex:number) => $emit('remove-subgroup', nestedGroup, nestedIndex)"
        @toggle-operator="$emit('toggle-operator', $event)"
        @remove-this-group="$emit('remove-subgroup', group, subIndex)"
      />
    </div>

    <div class="filter-actions flex gap-2 mt-3">
      <button
        @click="addFilter"
        class="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50 rounded-md flex items-center"
      >
        <span class="i-carbon-add mr-1"></span> Add Filter
      </button>

      <button
        @click="addSubgroup"
        class="text-sm px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/50 rounded-md flex items-center"
      >
        <span class="i-carbon-folder-add mr-1"></span> Add Subgroup
      </button>
    </div>
  </div>
</template>