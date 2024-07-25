import { writable } from 'svelte/store';

export const selectedTable = writable('tasks');
export const showColumnModal = writable(false);