<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
    import { supabase_content } from '../../../../supabase';
    import { createEventDispatcher } from 'svelte';

    export let open: boolean = false;
    export let userId: string;

    const dispatch = createEventDispatcher();

    async function deleteUser() {
        try {
            const { error } = await supabase_content
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            dispatch('userDeleted', userId);
            open = false;
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    }
</script>

<Modal bind:open size="sm">
    <div class="text-center">
        <ExclamationCircleOutline class="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this user?
        </h3>
        <div class="flex justify-center gap-4">
            <Button color="red" on:click={deleteUser}>
                Yes, I'm sure
            </Button>
            <Button color="alternative" on:click={() => (open = false)}>
                No, cancel
            </Button>
        </div>
    </div>
</Modal>