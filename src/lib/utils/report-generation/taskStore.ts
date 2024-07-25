import { derived, get, writable } from 'svelte/store';
import type { Filter, HeaderArray, SortCriteria, Task } from './types';

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

// taskAllHeaders is derived from taskDefaultHeaders and taskOptionalHeaders
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
export const showColumnModal = writable(false);

export const showFilter = writable(false);

export const filters = writable<Filter[]>([]);
export const filteredData = writable<Task[]>([]);


export const addFilter = () => {
    filters.update(f => [...f, { selectedHeader: '', selectedOperator: '', value: '' }]);
};

export const removeFilter = (index: number) => {
    filters.update(f => f.filter((_, i) => i !== index));
};

export const clearFilters = () => {
    filters.set([]);
    filteredData.set([]); // Reset to original data
};

export const applyFilters = () => {
    const currentFilters = get(filters);
    const currentData = get(filteredData);
    
    const newFilteredData = currentData.filter((item: Task) => {
        return currentFilters.every((filter: Filter) => {
            const itemValue = item[filter.selectedHeader];

            if (itemValue === null || itemValue === undefined) return false;
            const filterValue = filter.value;

            switch (filter.selectedOperator) {
                case '==':
                    return itemValue.toString().toLowerCase() === filterValue.toLowerCase();
                case '!=':
                    return itemValue.toString().toLowerCase() !== filterValue.toLowerCase();
                case '>':
                    return itemValue > filterValue;
                case '<':
                    return itemValue < filterValue;
                case '>=':
                    return itemValue >= filterValue;
                case '<=':
                    return itemValue <= filterValue;
                case 'contains':
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                default:
                    return true;
            }
        });
    });

    filteredData.set(newFilteredData);
};


export const operators = [
    { value: '==', name: 'Equals' },
    { value: '!=', name: 'Not Equals' },
    { value: '>', name: 'Greater Than' },
    { value: '<', name: 'Less Than' },
    { value: '>=', name: 'Greater Than or Equal' },
    { value: '<=', name: 'Less Than or Equal' },
    { value: 'contains', name: 'Contains' },
];


export const showSorting = writable(false);
export const sortCriteria = writable<SortCriteria[]>([]);

export const addSortCriteria = () => {
    sortCriteria.update(sc => [...sc, { column: 'Region', ascending: true }]);
};

export const removeSortCriteria = (index: number) => {
    sortCriteria.update(sc => sc.filter((_, i) => i !== index));
};

export const clearSort = () => {
    sortCriteria.set([]);
};
export const applySorting = () => {
    const currentSortCriteria = get(sortCriteria);
    const currentData = get(filteredData);

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

    filteredData.set(sortedData);
};


export const initializeFilteredData = (initialData: Task[]) => {
    filteredData.set(initialData);
};
