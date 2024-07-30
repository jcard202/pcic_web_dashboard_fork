<script lang="ts">
    import { Button, Input, Label, Modal, Select } from 'flowbite-svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { SupabaseClient } from '@supabase/supabase-js';
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
    let photoPreview: string | null = null;
    let isAuthenticated = false;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const DEFAULT_PROFILE_PIC = 'https://htmlstream.com/preview/unify-v2.6/assets/img-temp/400x450/img5.jpg';

    let showAlert = false;
    let alertMessage = '';
    let alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

    let selectedRegionId: string = '';

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
            console.log('Fetching regions...');
            const { data: regionsData, error } = await supabase
                .from('regions')
                .select('id, region_name');

            if (error) {
                console.error('Supabase error when fetching regions:', error);
                throw error;
            }

            regions = regionsData as Region[];
        } catch (error) {
            console.error('Error fetching regions:', error);
            errorMessage = 'Failed to load regions: ' + (error instanceof Error ? error.message : String(error));
        }
    }

    async function uploadPhoto(file: File): Promise<string | null> {
        try {
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
                throw new Error(`Upload failed: ${error.message}`);
            }

            const { data: urlData } = supabase.storage
                .from('photo')
                .getPublicUrl(data.path);

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

        if (!selectedRegionId) {
            showAlertMessage('Please select a region', 'error');
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const userData: Record<string, string> = {};
        formData.forEach((value, key) => {
            userData[key] = value.toString();
        });

        if (!allowedRoles.includes(userData.role)) {
            showAlertMessage('Please select a valid role', 'error');
            return;
        }

        if (!userData.mobile_number) {
            showAlertMessage('Please enter a mobile number', 'error');
            return;
        }

        let uid: string | null = null;

        try {
            // Attempt to create the auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        inspector_name: userData.inspector_name,
                        role: userData.role,
                        region_id: selectedRegionId,
                        mobile_number: userData.mobile_number,
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('User already registered')) {
                    // The user already exists in the authentication system
                    showAlertMessage('This email is already registered. Please use a different email or sign in.', 'error');
                } else {
                    console.error('Error creating auth user:', authError);
                    showAlertMessage('Failed to create user account. Please try again.', 'error');
                }
                return;
            }

            if (authData.user) {
                uid = authData.user.id;
            }

        } catch (error) {
            console.error('Error during sign up:', error);
            showAlertMessage('Failed to create user. Please try again later.', 'error');
            return;
        }

        if (!uid) {
            showAlertMessage('Could not retrieve user ID after sign up.', 'error');
            return;
        }

        // Check if the user already exists in the users table
        try {
            const { data: existingUser, error: existingUserError } = await supabase
                .from('users')
                .select('*')
                .eq('id', uid)
                .single();

            if (existingUserError && existingUserError.code !== 'PGRST116') {
                console.error('Error checking for existing user by UID:', existingUserError);
                showAlertMessage('Error checking for existing user. Please try again.', 'error');
                return;
            }

            if (existingUser) {
                showAlertMessage('A user with this UID already exists in the users table.', 'error');
                return;
            }

        } catch (error) {
            console.error('Error checking for existing user:', error);
            showAlertMessage('Error occurred while verifying user existence. Please try again.', 'error');
            return;
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

        const userDataToInsert = {
            id: uid,
            auth_user_id: uid,
            inspector_name: userData.inspector_name,
            email: userData.email,
            role: userData.role,
            region_id: selectedRegionId,
            mobile_number: userData.mobile_number,
            photo_url: photo_url
        };

        try {
            // Insert the user into your database
            const { data: userInsertData, error: insertError } = await supabase
                .from('users')
                .insert(userDataToInsert)
                .select('*, regions (region_name)')
                .single();

            if (insertError) {
                console.error('Error inserting user:', insertError);
                showAlertMessage('Failed to insert user data. Please try again later.', 'error');
                return;
            }

            console.log('User inserted:', userInsertData);

            // Sign out the user
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                console.error('Error signing out:', signOutError);
            }

            dispatch('userAdded', userInsertData);
            open = false;
            showAlertMessage('User created successfully. Please log in with your new account.', 'success');

        } catch (error) {
            console.error('Error creating user:', error);
            showAlertMessage(`Failed to create user. Please try again later.`, 'error');
        }
    }

    function handleFileInput(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            photoFile = input.files[0];
            if (photoFile.size > MAX_FILE_SIZE) {
                showAlertMessage(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please choose a smaller file.`, 'error');
                input.value = '';
                photoFile = null;
                photoPreview = null;
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview = e.target?.result as string;
                };
                reader.readAsDataURL(photoFile);
            }
        } else {
            photoFile = null;
            photoPreview = null;
        }
    }

    function showAlertMessage(message: string, type: 'success' | 'error' | 'warning' | 'info') {
        alertMessage = message;
        alertType = type;
        showAlert = true;
        setTimeout(() => {
            showAlert = false;
        }, 5000);
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
                        <Select name="region_id" class="mt-2" required bind:value={selectedRegionId}>
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
                    {#if photoPreview}
                        <div class="col-span-6">
                            <!-- svelte-ignore a11y-img-redundant-alt -->
                            <img src={photoPreview} alt="Selected photo preview" class="max-w-full h-auto" />
                        </div>
                    {/if}
                </div>
                <div class="mt-6">
                    <Button type="submit">{(data && Object.keys(data).length) ? 'Save all' : 'Add user'}</Button>
                </div>
            </form>
        {/if}
    </div>
</Modal>
