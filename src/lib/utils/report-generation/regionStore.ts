import { derived, get, writable } from 'svelte/store';
import type { HeaderArray, Region, RegionFilter, RegionSortCriteria } from './types';

// Define the type for our headers

// Default headers for regions
export const regionDefaultHeaders = writable<HeaderArray>([
    'Region Name',
    'Total Agents',
    'Total Regional Admins',
    'Total Dispatch Tasks',
    'Total Ongoing Tasks',
    'Total Completed Tasks'
]);

// Optional headers for regions
export const regionOptionalHeaders = writable<HeaderArray>([
    'Region ID',
    'Region Code',
    'Total Users',
    'Total National Admins',
    'Total Tasks',
    'Total PPIR Tasks',
    'Total Unknown Tasks'
]);

// Create derived stores for the combined arrays
export const regionAllHeaders = derived(
    [regionDefaultHeaders, regionOptionalHeaders],
    ([$regionDefaultHeaders, $regionOptionalHeaders]) => [...$regionDefaultHeaders, ...$regionOptionalHeaders]
);

export const regionActiveHeaders = writable<HeaderArray>([]);
export const regionSelectedHeaders = writable<HeaderArray>([]);
export const originalRegionData = writable<Region[]>([]);
export const regionFilteredData = writable<Region[]>([]);

regionDefaultHeaders.subscribe(($regionDefaultHeaders) => {
    regionActiveHeaders.set([...$regionDefaultHeaders]);
    regionSelectedHeaders.set([...$regionDefaultHeaders]);
});

// Modal state
export const showRegionColumnModal = writable(false);
export const showRegionFilter = writable(false);

export const regionFilters = writable<RegionFilter[]>([]);

export const addRegionFilter = () => {
    regionFilters.update(f => [...f, { selectedHeader: '', selectedOperator: '', value: '' }]);
};

export const removeRegionFilter = (index: number) => {
    regionFilters.update(f => f.filter((_, i) => i !== index));
    applyRegionFilters(); // Re-apply remaining filters
};

export const clearRegionFilters = () => {
    regionFilters.set([]);
    regionFilteredData.set(get(originalRegionData)); // Reset to original data
};

export const applyRegionFilters = () => {
    const currentFilters = get(regionFilters);
    const originalData = get(originalRegionData);
    
    if (currentFilters.length === 0) {
        regionFilteredData.set(originalData);
        return;
    }

    const newFilteredData = originalData.filter((item: Region) => {
        return currentFilters.every((filter: RegionFilter) => {
            const itemValue = item[filter.selectedHeader];

            if (itemValue === null || itemValue === undefined) return false;

            // Ensure itemValue and filterValue are treated as strings for comparison
            const itemValueString = itemValue.toString().toLowerCase();
            const filterValue = filter.value.toLowerCase();

            switch (filter.selectedOperator) {
                case '==':
                    return itemValueString === filterValue;
                case '!=':
                    return itemValueString !== filterValue;
                case '>':
                    return parseFloat(itemValueString) > parseFloat(filterValue);
                case '<':
                    return parseFloat(itemValueString) < parseFloat(filterValue);
                case '>=':
                    return parseFloat(itemValueString) >= parseFloat(filterValue);
                case '<=':
                    return parseFloat(itemValueString) <= parseFloat(filterValue);
                case 'contains':
                    return itemValueString.includes(filterValue);
                default:
                    return true;
            }
        });
    });

    regionFilteredData.set(newFilteredData);
};

export const regionOperators = [
    { value: '==', name: 'Equals' },
    { value: '!=', name: 'Not Equals' },
    { value: '>', name: 'Greater Than' },
    { value: '<', name: 'Less Than' },
    { value: '>=', name: 'Greater Than or Equal' },
    { value: '<=', name: 'Less Than or Equal' },
    { value: 'contains', name: 'Contains' },
];

export const showRegionSorting = writable(false);
export const regionSortCriteria = writable<RegionSortCriteria[]>([]);

export const addRegionSortCriteria = () => {
    regionSortCriteria.update(sc => [...sc, { column: 'Region Name', ascending: true }]);
};

export const removeRegionSortCriteria = (index: number) => {
    regionSortCriteria.update(sc => sc.filter((_, i) => i !== index));
};

export const clearRegionSort = () => {
    regionSortCriteria.set([]);
};

export const applyRegionSorting = () => {
    const currentSortCriteria = get(regionSortCriteria);
    const currentData = get(regionFilteredData);

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

    regionFilteredData.set(sortedData);
};

export const initializeRegionFilteredData = (initialData: Region[]) => {
    originalRegionData.set(initialData);
    regionFilteredData.set(initialData);
};
