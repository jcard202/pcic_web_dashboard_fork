<script lang="ts">
    import { Button, CloseButton, Heading, Modal } from 'flowbite-svelte';
    import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
    import { supabase_content } from '../../../../supabase';  // Adjust this import path as necessary
    import { createEventDispatcher } from 'svelte';

    export let open: boolean = false; // modal control
    export let userId: string; // The ID of the user to be deleted

    const dispatch = createEventDispatcher();

    async function deleteUser() {
        try {
            const { data, error } = await supabase_content
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            console.log('User deleted successfully');
            dispatch('userDeleted', userId);
            open = false;
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    }
</script>

<Modal bind:open size="sm">
    <ExclamationCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />

    <h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
        Are you sure you want to delete this user?
    </h3>

    <div class="flex items-center justify-center">
        <Button color="red" class="mr-2" on:click={deleteUser}>Yes, I'm sure</Button>
        <Button color="alternative" on:click={() => (open = false)}>No, cancel</Button>
    </div>
</Modal>