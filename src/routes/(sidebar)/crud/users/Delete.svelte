<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
    import { createEventDispatcher } from 'svelte';

    export let open: boolean = false;
    export let userId: string;
    export let data;

    const dispatch = createEventDispatcher();
    let isDeleting = false;
    let errorMessage = '';

    $: ({ supabase } = data);

    async function deleteUser() {
        if (isDeleting) return;
        isDeleting = true;
        errorMessage = '';
        console.log('Attempting to delete user with ID:', userId);
        try {
            // First, delete the user from the authentication system
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            if (authError) throw authError;

            // Then, delete the user from the 'users' table
            const { data, error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId)
                .select();

            if (error) throw error;

            console.log('Delete response:', data);

            if (data && data.length > 0) {
                dispatch('userDeleted', userId);
                open = false;
            } else {
                errorMessage = 'User not found or already deleted from the users table.';
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            errorMessage = 'Failed to delete user: ' + (error instanceof Error ? error.message : String(error));
        } finally {
            isDeleting = false;
        }
    }
</script>

<Modal bind:open size="sm">
    <div class="text-center">
        <ExclamationCircleOutline class="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this user?
        </h3>
        {#if errorMessage}
            <p class="mb-5 text-red-500">{errorMessage}</p>
        {/if}
        <div class="flex justify-center gap-4">
            <Button color="red" on:click={deleteUser} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : "Yes, I'm sure"}
            </Button>
            <Button color="alternative" on:click={() => (open = false)} disabled={isDeleting}>
                No, cancel
            </Button>
        </div>
    </div>
</Modal>