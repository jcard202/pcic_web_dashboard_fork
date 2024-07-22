<script lang="ts">
    import { Button, Input, Label, Modal, Select } from 'flowbite-svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
    import Alert from '../../../utils/widgets/alert.svelte';

    export let open: boolean = false;
    export let data: Record<string, any> = {};
    export let supabase: SupabaseClient;

    interface Region {
        id: string;
        region_name: string;
    }

    let regions: Region[] = [];
    const dispatch = createEventDispatcher();

    const allowedRoles = ['Agent', 'Regional_Admin', 'National_Admin'];

    let isLoading = true;
    let errorMessage = '';
    let photoFile: File | null = null;
    let isAuthenticated = false;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const DEFAULT_PROFILE_PIC = 'https://htmlstream.com/preview/unify-v2.6/assets/img-temp/400x450/img5.jpg';
    const MAX_RETRIES = 3;

    let showAlert = false;
    let alertMessage = '';
    let alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

    onMount(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
            isAuthenticated = true;
            console.log('User is authenticated:', user);
        } else {
            console.error('User is not authenticated:', error);
        }

        await fetchRegions();
        isLoading = false;
    });

    async function fetchRegions() {
        try {
            const { data: regionsData, error } = await supabase
                .from('regions')
                .select('id, region_name');

            if (error) throw error;

            regions = regionsData as Region[];
            console.log('Fetched regions:', regions);
        } catch (error) {
            console.error('Error fetching regions:', error);
            errorMessage = 'Failed to load regions: ' + (error instanceof Error ? error.message : String(error));
        }
    }

    async function uploadPhoto(file: File): Promise<string | null> {
        try {
            console.log('Attempting to upload file:', file.name, 'Size:', file.size);
            
            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
            }

            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('photo')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Supabase storage upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }

            if (!data) {
                throw new Error('Upload succeeded but no data returned');
            }

            console.log('File uploaded successfully, data:', data);

            const { data: urlData } = supabase.storage
                .from('photo')
                .getPublicUrl(data.path);

            console.log('Public URL:', urlData.publicUrl);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Error in uploadPhoto function:', error);
            throw error;
        }
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();

        if (!isAuthenticated) {
            showAlertMessage('You must be authenticated to perform this action', 'error');
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const userData = Object.fromEntries(formData.entries());

        console.log('User data being sent:', userData);

        if (!allowedRoles.includes(userData.role as string)) {
            showAlertMessage('Please select a valid role', 'error');
            return;
        }

        if (!userData.region_id) {
            showAlertMessage('Please select a region', 'error');
            return;
        }

        if (!userData.mobile_number) {
            showAlertMessage('Please enter a mobile number', 'error');
            return;
        }

        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                // Create auth user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: userData.email as string,
                    password: userData.password as string,
                    options: {
                        data: {
                            inspector_name: userData.inspector_name,
                            role: userData.role,
                            region_id: userData.region_id,
                            mobile_number: userData.mobile_number,
                        }
                    }
                });

                if (authError) throw authError;

                if (!authData.user) {
                    throw new Error('Failed to create auth user');
                }

                let photo_url = DEFAULT_PROFILE_PIC;
                if (photoFile) {
                    try {
                        photo_url = await uploadPhoto(photoFile) || DEFAULT_PROFILE_PIC;
                    } catch (uploadError) {
                        console.error('Failed to upload photo:', uploadError);
                        showAlertMessage('Failed to upload photo. Default profile picture will be used.', 'warning');
                    }
                }

                console.log('Preparing to insert user with photo_url:', photo_url);

                const userDataToInsert = {
                    inspector_name: userData.inspector_name as string,
                    email: userData.email as string,
                    role: userData.role as string,
                    region_id: userData.region_id as string,
                    mobile_number: userData.mobile_number as string,
                    photo_url: photo_url,
                    auth_user_id: authData.user.id
                };

                console.log('User data to insert:', userDataToInsert);

                const { data: userInsertData, error: insertError } = await supabase
                    .from('users')
                    .insert(userDataToInsert)
                    .select(`
                        *,
                        regions (
                            region_name
                        )
                    `)
                    .single();

                if (insertError) {
                    console.error('Error inserting user:', insertError);
                    throw insertError;
                }

                if (!userInsertData) {
                    throw new Error('Failed to insert user data');
                }

                console.log('User inserted:', userInsertData);

                dispatch('userAdded', userInsertData);
                open = false;
                showAlertMessage('User created successfully.', 'success');
                return; // Exit the function if successful
            } catch (error) {
                console.error(`Error creating user (attempt ${retries + 1}):`, error);
                retries++;
                if (retries >= MAX_RETRIES) {
                    errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
                    showAlertMessage(`Failed to create user after ${MAX_RETRIES} attempts. Please try again later.`, 'error');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                }
            }
        }
    }

    function handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            photoFile = input.files[0];
            console.log('File selected:', photoFile.name, 'Size:', photoFile.size);
            if (photoFile.size > MAX_FILE_SIZE) {
                showAlertMessage(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please choose a smaller file.`, 'error');
                input.value = ''; // Clear the input
                photoFile = null;
            }
        }
    }

    function showAlertMessage(message: string, type: 'success' | 'error' | 'warning' | 'info') {
        alertMessage = message;
        alertType = type;
        showAlert = true;
        setTimeout(() => {
            showAlert = false;
        }, 5000); // Hide alert after 5 seconds
    }
</script>

<Modal bind:open title={(data && Object.keys(data).length) ? 'Edit user' : 'Add new user'} size="md" class="m-4">
    <div class="space-y-6 p-0">
        {#if showAlert}
            <Alert message={alertMessage} type={alertType} />
        {/if}
        
        {#if isLoading}
            <p>Loading regions...</p>
        {:else if errorMessage}
            <p class="text-red-500">{errorMessage}</p>
        {:else}
            <form action="#" on:submit={handleSubmit}>
                <div class="grid grid-cols-6 gap-6">
                    <Label class="col-span-6 space-y-2">
                        <span>Full Name</span>
                        <Input name="inspector_name" class="border outline-none" placeholder="e.g. Bonnie Green" required />
                    </Label>
                    <Label class="col-span-6 space-y-2 sm:col-span-3">
                        <span>Email</span>
                        <Input name="email" type="email" class="border outline-none" placeholder="e.g. bonnie@flowbite.com" required />
                    </Label>
                    <Label class="col-span-6 space-y-2 sm:col-span-3">
                        <span>Password</span>
                        <Input name="password" type="password" class="border outline-none" placeholder="Password" required />
                    </Label>
                    <Label class="col-span-6 space-y-2 sm:col-span-3">
                        <span>Mobile Number</span>
                        <Input name="mobile_number" type="tel" class="border outline-none" placeholder="e.g. +1234567890" required />
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
                        <Select name="region_id" class="mt-2" required>
                            <option value="">Select a region</option>
                            {#each regions as region}
                                <option value={region.id}>{region.region_name}</option>
                            {/each}
                        </Select>
                    </Label>
                    <Label class="col-span-6 space-y-2">
                        <span>Photo (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)</span>
                        <Input type="file" on:change={handleFileInput} accept="image/*" />
                    </Label>
                </div>
                <div class="mt-6">
                    <Button type="submit">{(data && Object.keys(data).length) ? 'Save all' : 'Add user'}</Button>
                </div>
            </form>
        {/if}
    </div>
</Modal>