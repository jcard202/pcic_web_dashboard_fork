<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Avatar,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Input,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Toolbar,
		ToolbarButton
	} from 'flowbite-svelte';
	import {
		CogSolid,
		DotsVerticalOutline,
		DownloadSolid,
		EditOutline,
		ExclamationCircleSolid,
		PlusOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import { imagesPath } from '../../../utils/variables';
	import User from './User.svelte';
	import Delete from './Delete.svelte';
	import Toast from '../../../utils/widgets/Toast.svelte';
	import MetaTag from '../../../utils/MetaTag.svelte';

	export let data;
	$: ({ supabase } = data);

	let openUser = false;
	let openDelete = false;
	let userToDelete = '';

	let current_user: any = {};
	let users: any[] = [];
	let filteredUsers: any[] = []; // To hold the filtered users
	let isLoading = true;
	let searchQuery = ''; // To hold the search input value
	let selectedRole = ''; // To hold the selected role filter
	let selectedRegion = ''; // To hold the selected region filter
	const path = '/crud/users';
	const description = 'CRUD users example - PCIC Web Dashboard';
	const title = 'PCIC Web Dashboard - CRUD Users';
	const subtitle = 'CRUD Users';

	let toastProps = { show: false, message: '', type: 'success' | 'error' };

	let supabaseReady = false;

	onMount(async () => {
		if (supabase) {
			supabaseReady = true;
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user) {
				console.log('Component mounted, user authenticated');
				await fetchUsers();
			} else {
				console.error('No authenticated user found');
				// Handle unauthenticated state (e.g., redirect to login)
			}
		} else {
			console.error('Supabase client is not available');
		}
	});

	async function fetchUsers() {
		try {
			console.log('Fetching users...');
			const { data: fetchedUsers, error } = await supabase
				.from('users')
				.select(
					`   
                    *,
                    regions (
                        region_name
                    )
                `
				)
				.order('created_at', { ascending: false });

			if (error) throw error;

			console.log('Fetched users data:', fetchedUsers);
			users = fetchedUsers || [];
			filterUsers(); // Filter users based on the search query

			if (users.length === 0) {
				console.log('No users found in the database.');
			}
		} catch (error) {
			console.error('Error fetching users:', error);
			showToast(
				'Error fetching users: ' + (error instanceof Error ? error.message : String(error)),
				'error'
			);
		} finally {
			isLoading = false;
		}
	}

	// Function to filter users based on searchQuery, selectedRole, and selectedRegion
	function filterUsers() {
		filteredUsers = users.filter(
			(user) =>
				user.inspector_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				(selectedRole === '' || user.role === selectedRole) &&
				(selectedRegion === '' || user.regions?.region_name === selectedRegion)
		);
	}

	function handleUserAdded(event: CustomEvent) {
		users = [event.detail, ...users];
		filterUsers(); // Re-filter users after adding a new one
		showToast('User added successfully', 'success');
	}

	function handleUserUpdated(event: CustomEvent) {
		const updatedUser = event.detail;
		users = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
		filterUsers(); // Re-filter users after updating one
		showToast('User updated successfully', 'success');
	}

	function handleUserDeleted(event: CustomEvent) {
		const deletedUserId = event.detail;
		users = users.filter((user) => user.id !== deletedUserId);
		filterUsers(); // Re-filter users after deleting one
		showToast('User deleted successfully', 'success');
	}

	function showToast(message: string, type: 'success' | 'error') {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	}

	function getStatusColor(is_online: boolean) {
		return is_online ? 'green' : 'gray';
	}

	function getStatusText(is_online: boolean) {
		return is_online ? 'Online' : 'Offline';
	}

	function handleOpenUser() {
		if (supabaseReady) {
			current_user = null;
			openUser = true;
		} else {
			console.error('Supabase client is not ready');
			showToast('Unable to open user form. Please try again later.', 'error');
		}
	}
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<Toast {...toastProps} />

	<div class="p-4">
		<!-- Breadcrumb Navigation -->
		<Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/crud/users">Users</BreadcrumbItem>
			<BreadcrumbItem>List</BreadcrumbItem>
		</Breadcrumb>

		<!-- Page Heading -->
		<Heading tag="h1" class="mb-4 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			All Agents
		</Heading>

		<!-- Toolbar with Search, Filters, and Add Button -->
		<div class="flex flex-wrap items-center justify-between gap-4 py-4">
			<!-- Search and Filters -->
			<div class="flex flex-1 items-center gap-4">
				<Input
					placeholder="Search for users"
					class="w-full max-w-lg rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
					bind:value={searchQuery}
					on:input={filterUsers}
				/>
				<Select
					placeholder="Filter by role"
					class="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
					bind:value={selectedRole}
					on:change={filterUsers}
				>
					<option value="">All Roles</option>
					<option value="Agent">Agent</option>
					<option value="Regional_Admin">Regional Admin</option>
					<option value="National_Admin">National Admin</option>
				</Select>
				<Select
					placeholder="Filter by region"
					class="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
					bind:value={selectedRegion}
					on:change={filterUsers}
				>
					<option value="">All Regions</option>
					{#each users as user}
						{#if user.regions?.region_name}
							<option value={user.regions.region_name}>{user.regions.region_name}</option>
						{/if}
					{/each}
				</Select>
			</div>

			<!-- Add User Button -->
			<Button
				size="sm"
				class="flex items-center gap-2 whitespace-nowrap rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
				on:click={handleOpenUser}
			>
				<PlusOutline size="sm" />Add user
			</Button>
		</div>

		<!-- Conditional Rendering for Loading, No Users, or User Table -->
		{#if isLoading}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
				<img src="/images/pcic-spinner.gif" alt="Loading..." class="h-24 w-24" />
			</div>
		{:else if filteredUsers.length === 0}
			<p class="text-gray-700 dark:text-gray-300">
				No users found. Add some users to see them here.
			</p>
		{:else}
			<Table>
				<TableHead
					class="border-y border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700"
				>
					<TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
					{#each ['Name', 'Status', 'Date Added', 'Role', 'Region', 'Actions'] as title}
						<TableHeadCell class="p-4 font-medium text-gray-900 dark:text-gray-300">
							{title}
						</TableHeadCell>
					{/each}
				</TableHead>
				<TableBody>
					{#each filteredUsers as user}
						<TableBodyRow class="text-base hover:bg-gray-100 dark:hover:bg-gray-800">
							<TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
							<TableBodyCell class="mr-12 flex items-center space-x-6 whitespace-nowrap p-4">
								<Avatar
									src={user.photo_url || imagesPath('default-avatar.png', 'users')}
									alt="User avatar"
									class="h-10 w-10 rounded-full"
								/>
								<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
									<div class="text-base font-semibold text-gray-900 dark:text-white">
										{user.inspector_name}
									</div>
									<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
										{user.email}
									</div>
								</div>
							</TableBodyCell>
							<TableBodyCell class="p-4">
								<span class="flex items-center">
									<span
										class={`h-2.5 w-2.5 rounded-full bg-${getStatusColor(user.is_online)}-500 mr-2`}
									></span>
									<span class={`text-sm font-medium text-${getStatusColor(user.is_online)}-500`}>
										{getStatusText(user.is_online)}
									</span>
								</span>
							</TableBodyCell>
							<TableBodyCell class="p-4">
								{new Date(user.created_at).toLocaleDateString()}
							</TableBodyCell>
							<TableBodyCell class="p-4">{user.role}</TableBodyCell>
							<TableBodyCell class="p-4">{user.regions?.region_name || 'N/A'}</TableBodyCell>
							<TableBodyCell class="space-x-2 p-4">
								<Button
									size="sm"
									class="gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
									on:click={() => {
										current_user = user;
										openUser = true;
									}}
								>
									<EditOutline size="sm" /> Edit user
								</Button>
								<Button
									color="red"
									size="sm"
									class="gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
									on:click={() => {
										userToDelete = user.id;
										openDelete = true;
									}}
								>
									<TrashBinSolid size="sm" /> Delete user
								</Button>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		{/if}
	</div>
</main>

<!-- Modals -->
<User
	bind:open={openUser}
	{current_user}
	selectedRegionId={current_user?.region_id}
	{data}
	on:userAdded={handleUserAdded}
	on:userUpdated={handleUserUpdated}
/>
<Delete bind:open={openDelete} userId={userToDelete} {data} on:userDeleted={handleUserDeleted} />
