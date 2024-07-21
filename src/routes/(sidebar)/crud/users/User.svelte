<script lang="ts">
    import { Button, Input, Label, Modal, Select } from 'flowbite-svelte';
    import { supabase_content } from '../../../../supabase';
    import { onMount, createEventDispatcher } from 'svelte';
    import type { PostgrestError } from '@supabase/supabase-js';

    export let open: boolean = false; // modal control
    export let data: Record<string, any> = {};

    interface Region {
        id: number;
        region_name: string;
    }

    let regions: Region[] = [];
    const dispatch = createEventDispatcher();

    const allowedRoles = ['Agent', 'Regional_Admin', 'National_Admin'];

    onMount(async () => {
        await fetchRegions();
    });

    async function fetchRegions() {
        const { data: regionsData, error } = await supabase_content
            .from('regions')
            .select('id, region_name');

        if (error) {
            console.error('Error fetching regions:', error);
        } else {
            regions = regionsData as Region[];
        }
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const userData = Object.fromEntries(formData.entries());

        console.log('User data being sent:', userData);

        if (!allowedRoles.includes(userData.role as string)) {
            alert('Please select a valid role');
            return;
        }

        const createUser = async (retryCount = 0) => {
            if (retryCount > 5) {
                throw new Error('Max retries reached. Please try again later.');
            }

            try {
                // Step 1: Create user in Supabase Auth
                const { data: authData, error: authError } = await supabase_content.auth.signUp({
                    email: userData.email as string,
                    password: userData.password as string,
                });

                if (authError) throw authError;

                if (!authData.user) {
                    throw new Error('User creation failed');
                }

                // Step 2: Insert user data into 'users' table
                const upsertData: Record<string, any> = {
                    inspector_name: userData.inspector_name as string,
                    email: userData.email as string,
                    role: userData.role as string,
                    auth_user_id: authData.user.id,
                };

                if (userData.region_id) {
                    upsertData.region_id = userData.region_id as string;
                }

                const { data: responseData, error: dbError } = await supabase_content
                    .from('users')
                    .upsert(upsertData)
                    .select(`
                        *,
                        regions (
                            region_name
                        )
                    `);

                if (dbError) throw dbError;

                console.log('Upsert response:', responseData);

                if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                    dispatch('userAdded', responseData[0]);
                    open = false;
                } else {
                    throw new Error('No data returned from upsert operation');
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.message.includes('429')) {
                        console.error('Rate limit exceeded, retrying...');
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                        return createUser(retryCount + 1);
                    }
                    throw error;
                } else {
                    throw new Error('An unknown error occurred');
                }
            }
        };

        try {
            await createUser();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error updating user:', error.message);
                alert(`Error: ${error.message}`);
            } else if (typeof error === 'object' && error !== null && 'details' in error && 'hint' in error) {
                const pgError = error as PostgrestError;
                console.error('Error updating user:', pgError.message);
                if (pgError.message.includes('invalid input value for enum user_role_enum')) {
                    alert('Invalid role selected. Please choose a valid role.');
                } else {
                    alert(`Error: ${pgError.message}`);
                }
            } else {
                console.error('An unknown error occurred:', error);
                alert('An unknown error occurred. Please try again.');
            }
        }
    }
</script>

<Modal
    bind:open
    title={Object.keys(data).length ? 'Edit user' : 'Add new user'}
    size="md"
    class="m-4"
>
    <div class="space-y-6 p-0">
        <form action="#" on:submit={handleSubmit}>
            <div class="grid grid-cols-6 gap-6">
                <Label class="col-span-6 space-y-2">
                    <span>Full Name</span>
                    <Input name="inspector_name" class="border outline-none" placeholder="e.g. Bonnie Green" required />
                </Label>
                <Label class="col-span-6 space-y-2 sm:col-span-3">
                    <span>Email</span>
                    <Input
                        name="email"
                        type="email"
                        class="border outline-none"
                        placeholder="e.g. bonnie@flowbite.com"
                        required
                    />
                </Label>
                <Label class="col-span-6 space-y-2 sm:col-span-3">
                    <span>Password</span>
                    <Input
                        name="password"
                        type="password"
                        class="border outline-none"
                        placeholder="Your password"
                        required
                    />
                </Label>
                <Label class="col-span-6 space-y-2 sm:col-span-3">
                    <span>Role</span>
                    <Select name="role" class="mt-2" required>
                        <option value="">Select a role</option>
                        {#each allowedRoles as role}
                            <option value={role}>{role}</option>
                        {/each}
                    </Select>
                </Label>
                <Label class="col-span-6 space-y-2">
                    <span>Region</span>
                    <Select name="region_id" class="mt-2">
                        <option value="">Select a region</option>
                        {#each regions as region}
                            <option value={region.id}>{region.region_name}</option>
                        {/each}
                    </Select>
                </Label>
            </div>
            <div class="mt-6">
                <Button type="submit">{Object.keys(data).length ? 'Save all' : 'Add user'}</Button>
            </div>
        </form>
    </div>
</Modal>
