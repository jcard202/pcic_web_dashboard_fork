<script lang="ts">
	import { Button, Input, Label, Modal, Select } from 'flowbite-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import Alert from '../../../utils/widgets/alert.svelte';

	export let open: boolean = false;
	export let data: any;

	$: ({ supabase } = data);

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
	const DEFAULT_PROFILE_PIC =
		'https://htmlstream.com/preview/unify-v2.6/assets/img-temp/400x450/img5.jpg';

	let showAlert = false;
	let alertMessage = '';
	let alertType: 'success' | 'error' | 'warning' | 'info' = 'info';

	export let selectedRegionId: string | null;
	export let current_user: any = null;
  	let selectedRole = '';

	  $: {
    if (current_user) {
      selectedRole = current_user.role;
    } else {
      selectedRole = '';
    }
  }

  let loggedInUser: any = null;
  
  let showErrorModal = false;

	onMount(async () => {
	
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (user) {
			isAuthenticated = true;
			console.log('User is authenticated:', user);
		} else {
			console.error('User is not authenticated:', error);
		}
		await fetchRegions();
		isLoading = false;

		if (user) {
      isAuthenticated = true;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        loggedInUser = userData;
      }
    }
	});

	function getAllowedRoles() {
    if (!loggedInUser) return [];
    
    switch (loggedInUser.role) {
      case 'National_Admin':
        return ['Agent', 'Regional_Admin', 'National_Admin'];
      case 'Regional_Admin':
        return ['Agent'];
      default:
        return [];
    }
  }

  function handleRoleChange(event: { target: { value: string; }; }) {
    selectedRole = event.target.value;
    if (current_user) {
      current_user.role = selectedRole;
    }
  }

	async function fetchRegions() {
		try {
			console.log('Fetching regions...');
			const { data: regionsData, error } = await supabase.from('regions').select('id, region_name');

			if (error) {
				console.error('Supabase error when fetching regions:', error);
				throw error;
			}

			console.log('Raw regions data:', regionsData);

			regions = regionsData as Region[];
			console.log('Processed regions:', regions);

			if (regions.length === 0) {
				console.warn(
					'No regions fetched from the database. Please check if the regions table has data.'
				);
			}
		} catch (error) {
			console.error('Error fetching regions:', error);
			errorMessage =
				'Failed to load regions: ' + (error instanceof Error ? error.message : String(error));
		}
	}

	async function uploadPhoto(file: File): Promise<string | null> {
		try {
			console.log('Attempting to upload file:', file.name, 'Size:', file.size);

			if (file.size > MAX_FILE_SIZE) {
				throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
			}

			const fileName = `${Date.now()}-${file.name}`;
			const { data, error } = await supabase.storage.from('photo').upload(fileName, file, {
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

			const { data: urlData } = supabase.storage.from('photo').getPublicUrl(data.path);

			console.log('Public URL:', urlData.publicUrl);

			return urlData.publicUrl;
		} catch (error) {
			console.error('Error in uploadPhoto function:', error);
			throw error;
		}
	}

	async function formLoad(event: Event) {
		const formData = new FormData(event.target as HTMLFormElement);
		formData.append('email', data.email);
		formData.append('inspector_name', data.inspector_name);
		formData.append('role', data.role);
		formData.append('mobile_number', data.mobile_number);
		selectedRegionId = data.region_id;
		alert();
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!isAuthenticated) {
			showAlertMessage('You must be authenticated to perform this action', 'error');
			return;
		}

		console.log('Selected Region ID before submission:', selectedRegionId);

		if (!selectedRegionId) {
			showAlertMessage('Please select a region', 'error');
			return;
		}

		const formData = new FormData(event.target as HTMLFormElement);
		const userData: Record<string, string> = {};
		formData.forEach((value, key) => {
			userData[key] = value.toString();
		});

		console.log('User data being sent:', userData);

		if (!allowedRoles.includes(userData.role)) {
			showAlertMessage('Please select a valid role', 'error');
			return;
		}

		if (!userData.mobile_number) {
			showAlertMessage('Please enter a mobile number', 'error');
			return;
		}

		try {
			let userDataToInsert;
			if (!current_user) {
				// Check if user already exists
				const { data: existingUser, error: existingUserError } = await supabase
					.from('users')
					.select('email')
					.eq('email', userData.email)
					.single();

				if (existingUserError && existingUserError.code !== 'PGRST116') {
					throw existingUserError;
				}

				if (existingUser) {
					showAlertMessage('A user with this email already exists', 'error');
					return;
				}
				let photo_url = DEFAULT_PROFILE_PIC;
				if (photoFile) {
					try {
						photo_url = (await uploadPhoto(photoFile)) || DEFAULT_PROFILE_PIC;
					} catch (uploadError) {
						console.error('Failed to upload photo:', uploadError);
						showAlertMessage(
							'Failed to upload photo. Default profile picture will be used.',
							'warning'
						);
					}
				}

				console.log('Preparing to insert user with photo_url:', photo_url);
				// Then, create the auth user without signing in
				const { data: authData, error: authError } = await supabase.auth.admin.createUser({
					email: userData.email,
					password: userData.password
				});
				console.log('DATAAAAA', authData);
				if (authError) {
					console.error('Error creating auth user:', authError);
					throw authError;
				}
				userDataToInsert = {
					id: authData.user.id,
					inspector_name: userData.inspector_name,
					email: userData.email,
					role: userData.role,
					auth_user_id: authData.user.id,
					region_id: selectedRegionId,
					mobile_number: userData.mobile_number,
					photo_url: photo_url
				};
			} else {
				let photo_url = current_user.photo_url;
				if (photoFile) {
					try {
						photo_url = (await uploadPhoto(photoFile)) || DEFAULT_PROFILE_PIC;
					} catch (uploadError) {
						console.error('Failed to upload photo:', uploadError);
						showAlertMessage(
							'Failed to upload photo. Default profile picture will be used.',
							'warning'
						);
					}
				}
				userDataToInsert = {
					id: current_user.id,
					inspector_name: userData.inspector_name,
					email: userData.email,
					role: userData.role,
					region_id: selectedRegionId,
					mobile_number: userData.mobile_number,
					photo_url: photo_url
				};
			}

			console.log('User data to insert:', userDataToInsert);

			// First, insert the user into your database
			const { data: userInsertData, error: insertError } = await supabase
				.from('users')
				.upsert(userDataToInsert)
				.select(
					`
                    *,
                    regions (
                        region_name
                    )
                `
				)
				.single();

			if (insertError) {
				console.error('Error inserting user:', insertError);
				throw insertError;
			}

			if (!userInsertData) {
				throw new Error('Failed to insert user data');
			}

			console.log('User inserted:', userInsertData);

			if (!current_user) {
				dispatch('userAdded', userInsertData);
			} else {
				dispatch('userUpdated', userInsertData);
			}
			open = false;
			showAlertMessage('User created successfully.', 'success');
		} catch (error) {
			handleError(error);

		}
	}

	function closeErrorModal() {
    showErrorModal = false;
  }

  let hasError = false;


  function handleError(error: any) {
		console.error('Error creating user:', error);
		errorMessage = "Failed to create user. Please try again later.";
		hasError = true;
	}

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			photoFile = input.files[0];
			console.log('File selected:', photoFile.name, 'Size:', photoFile.size);
			if (photoFile.size > MAX_FILE_SIZE) {
				showAlertMessage(
					`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB. Please choose a smaller file.`,
					'error'
				);
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

	function restrictToNumbers(event: { target: any; }) {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Optionally, limit the length to 11 digits (adjust as needed)
    if (input.value.length > 11) {
      input.value = input.value.slice(0, 11);
    }
  }

  function refreshPage() {
    showErrorModal = false;
    window.location.reload();
  }
</script>

<Modal bind:open title={current_user ? 'Edit user' : 'Add new user'} size="md" class="m-4">
	<div class="space-y-6 p-0">
		{#if hasError}
			<div class="text-center">
				<img src="/no-user.png" alt="Error" class="mx-auto mb-4 h-1/2 w-1/2" />
				<Alert type="error" message={errorMessage} />
				<Button class="mt-4" color="red" on:click={refreshPage}>Try Again</Button>
			</div>
		{:else if isLoading}
			<p>Loading regions...</p>
		{:else}
			<form action="#" on:submit={handleSubmit}>
				<div class="grid grid-cols-6 gap-6">
					<Label class="col-span-6 space-y-2">
						<span>Full Name</span>
						<Input
							name="inspector_name"
							class="border outline-none"
							placeholder="e.g. Agent Name"
							value={current_user?.inspector_name}
							required
						/>
					</Label>
					<Label class="col-span-6 space-y-2 sm:col-span-3">
						<span>Email</span>
						<Input
							name="email"
							type="email"
							class="border outline-none"
							placeholder="e.g. agent@email.com"
							value={current_user?.email}
							required
						/>
					</Label>
					<Label class="col-span-6 space-y-2 sm:col-span-3">
						<span>Password</span>
						{#if current_user}
							<Input
								name="password"
								type="password"
								class="border outline-none"
								placeholder="Change password"
							/>
						{:else}
							<Input
								name="password"
								type="password"
								class="border outline-none"
								placeholder="Password"
								required
							/>
						{/if}
					</Label>
					<Label class="col-span-6 space-y-2 sm:col-span-3">
						<span>Mobile Number</span>
						<Input
						  name="mobile_number"
						  type="tel"
						  class="border outline-none"
						  placeholder="e.g. 09472728018"
						  value={current_user?.mobile_number}
						  required
						  pattern="[0-9]*"
						  inputmode="numeric"
						  on:input={restrictToNumbers}
						  maxlength="11"
						/>
					</Label>
					<Label class="col-span-6 space-y-2 sm:col-span-3">
						<span>Role</span>
						<Select 
						  name="role" 
						  class="mt-2" 
						  bind:value={selectedRole}
						  on:change={handleRoleChange}
						  required
						  disabled={!getAllowedRoles().length}
						>
						  <option value="">Select a role</option>
						  {#each getAllowedRoles() as role}
							<option value={role}>{role.replace('_', ' ')}</option>
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
						{#if current_user}
							<span>Change Photo (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)</span>
						{:else}
							<span>Photo (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)</span>
						{/if}
						<Input type="file" on:change={handleFileInput} accept="image/*" />
					</Label>
				</div>
				<div class="mt-6 flex justify-center">
					<Button type="submit">{current_user ? 'Save all' : 'Add user'}</Button>
				</div>
			</form>
		{/if}
	</div>
</Modal>