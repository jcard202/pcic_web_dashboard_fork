<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { CheckCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';

    export let show = false;
    export let message = '';
    export let type: 'success' | 'error' = 'success';

    function getIcon(type: 'success' | 'error') {
        return type === 'success' ? CheckCircleSolid : ExclamationCircleSolid;
    }

    function getColor(type: 'success' | 'error') {
        return type === 'success' ? 'green' : 'red';
    }
</script>

{#if show}
    <div 
        class="fixed top-20 right-5 z-50"
        in:fly="{{ y: -20, duration: 300 }}" 
        out:fade="{{ duration: 200 }}"
    >
        <div class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-{getColor(type)}-500 bg-{getColor(type)}-100 rounded-lg dark:bg-{getColor(type)}-800 dark:text-{getColor(type)}-200">
                <svelte:component this={getIcon(type)} class="w-5 h-5" />
            </div>
            <div class="ml-3 text-sm font-normal">{message}</div>
            <button 
                type="button" 
                class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" 
                aria-label="Close"
                on:click={() => show = false}
            >
                <span class="sr-only">Close</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    </div>
{/if}