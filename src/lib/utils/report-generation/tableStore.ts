import { writable } from 'svelte/store';

export const selectedTable = writable('users');
export const showColumnModal = writable(false);