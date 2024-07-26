import { derived, get, writable } from 'svelte/store';
import type { HeaderArray, Task, TaskFilter, TaskSortCriteria } from './types';

// Define the type for our headers

// Create writable stores for the base arrays with explicit typing
export const taskDefaultHeaders = writable<HeaderArray>([
    'Region',
    'Task Number',
    'Agent',
    'Farmer Name',
    'Insurance ID',
    'PPI Assignment ID',
    'Task Status',
]);

export const taskOptionalHeaders = writable<HeaderArray>([
    'Inspector', 
    'Service Group', 
    'Service Type', 
    'Assignee',
    'Assignment ID', 
    'Address', 
    'Farmer Type',
    'Mobile No', 
    'Group Name', 
    'Group Address', 
    'Lender Name', 
    'Lender Address',
    'CIC No', 
    'Farm Location', 
    'Name Insured', 
    'Name IUIA'
]);

// Create derived stores for the combined arrays
export const taskActiveHeaders = writable<HeaderArray>([]);
export const taskSelectedHeaders = writable<HeaderArray>([]);
export const originalTaskData = writable<Task[]>([]);

export const taskAllHeaders = derived<[typeof taskDefaultHeaders, typeof taskOptionalHeaders], HeaderArray>(
    [taskDefaultHeaders, taskOptionalHeaders],
    ([$taskDefaultHeaders, $taskOptionalHeaders]) => [...$taskDefaultHeaders, ...$taskOptionalHeaders]
);

// Initialize taskActiveHeaders and taskSelectedHeaders
taskDefaultHeaders.subscribe(($taskDefaultHeaders) => {
    taskActiveHeaders.set([...$taskDefaultHeaders]);
    taskSelectedHeaders.set([...$taskDefaultHeaders]);
});

// Modal state
export const showTaskColumnModal = writable(false);

export const showTaskFilter = writable(false);

export const taskFilters = writable<TaskFilter[]>([]);
export const taskFilteredData = writable<Task[]>([]);

export const addTaskFilter = () => {
    taskFilters.update(f => [...f, { selectedHeader: '', selectedOperator: '', value: '' }]);
};
export const removeTaskFilter = (index: number) => {
    taskFilters.update(f => f.filter((_, i) => i !== index));
    applyTaskFilters(); // Re-apply remaining filters
};

export const clearTaskFilters = () => {
    taskFilters.set([]);
    taskFilteredData.set(get(originalTaskData)); // Reset to original data
};

export const applyTaskFilters = () => {
    const currentFilters = get(taskFilters);
    const originalData = get(originalTaskData);
    
    if (currentFilters.length === 0) {
        taskFilteredData.set(originalData);
        return;
    }

    const newFilteredData = originalData.filter((item: Task) => {
        return currentFilters.every((filter: TaskFilter) => {
            const itemValue = item[filter.selectedHeader];

            if (itemValue === null || itemValue === undefined) return false;
            const filterValue = filter.value;

            switch (filter.selectedOperator) {
                case '==':
                    return itemValue.toString().toLowerCase() === filterValue.toLowerCase();
                case '!=':
                    return itemValue.toString().toLowerCase() !== filterValue.toLowerCase();
                case '>':
                    return parseFloat(itemValue) > parseFloat(filterValue);
                case '<':
                    return parseFloat(itemValue) < parseFloat(filterValue);
                case '>=':
                    return parseFloat(itemValue) >= parseFloat(filterValue);
                case '<=':
                    return parseFloat(itemValue) <= parseFloat(filterValue);
                case 'contains':
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                default:
                    return true;
            }
        });
    });

    taskFilteredData.set(newFilteredData);
};

export const taskOperators = [
    { value: '==', name: 'Equals' },
    { value: '!=', name: 'Not Equals' },
    { value: '>', name: 'Greater Than' },
    { value: '<', name: 'Less Than' },
    { value: '>=', name: 'Greater Than or Equal' },
    { value: '<=', name: 'Less Than or Equal' },
    { value: 'contains', name: 'Contains' },
];

export const showTaskSorting = writable(false);
export const taskSortCriteria = writable<TaskSortCriteria[]>([]);

export const addTaskSortCriteria = () => {
    taskSortCriteria.update(sc => [...sc, { column: 'Region', ascending: true }]);
};

export const removeTaskSortCriteria = (index: number) => {
    taskSortCriteria.update(sc => sc.filter((_, i) => i !== index));
};

export const clearTaskSort = () => {
    taskSortCriteria.set([]);
};

export const applyTaskSorting = () => {
    const currentSortCriteria = get(taskSortCriteria);
    const currentData = get(taskFilteredData);

    const sortedData = [...currentData].sort((a, b) => {
        for (const criteria of currentSortCriteria) {
            const aValue = a[criteria.column];
            const bValue = b[criteria.column];

            if (aValue == null && bValue == null) continue;
            if (aValue == null) return criteria.ascending ? -1 : 1;
            if (bValue == null) return criteria.ascending ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const compareResult = aValue.localeCompare(bValue);
                if (compareResult !== 0) {
                    return criteria.ascending ? compareResult : -compareResult;
                }
            } else {
                if (aValue < bValue) return criteria.ascending ? -1 : 1;
                if (aValue > bValue) return criteria.ascending ? 1 : -1;
            }
        }
        return 0;
    });

    taskFilteredData.set(sortedData);
};

export const initializeTaskFilteredData = (initialData: Task[]) => {
    originalTaskData.set(initialData);
    taskFilteredData.set(initialData);
};

// Pagination related stores
export const currentPage = writable(1);
export const pageSize = writable(10);

export const paginatedTasks = derived(
    [taskFilteredData, currentPage, pageSize],
    ([$taskFilteredData, $currentPage, $pageSize]) => {
        const start = ($currentPage - 1) * $pageSize;
        const end = start + $pageSize;
        return $taskFilteredData.slice(start, end);
    }
);

export const totalPages = derived(
    [taskFilteredData, pageSize],
    ([$taskFilteredData, $pageSize]) => {
        return Math.ceil($taskFilteredData.length / $pageSize);
    }
);


