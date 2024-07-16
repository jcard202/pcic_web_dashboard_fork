<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase_content } from '../../../../supabase';  // Adjust this import path as necessary
	import {
		Avatar,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Indicator,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Toolbar,
		ToolbarButton,
		ToolbarGroup
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
	import MetaTag from '../../../utils/MetaTag.svelte';

	const BYPASS_AUTH = true; // Set this to false when you want to enforce authentication

	let openUser: boolean = false; // modal control
	let openDelete: boolean = false; // modal control

	let current_user: any = {};
	let users: any[] = [];
	let isLoading = true;
	const path: string = '/crud/users';
	const description: string = 'CRUD users example - PCIC Web Dashboard';
	const title: string = 'PCIC Web Dashboard - CRUD Users';
	const subtitle: string = 'CRUD Users';

	async function fetchUsers() {
		try {
			const { data, error } = await supabase_content
				.from('users')
				.select(`
					id,
					display_name,
					created_at,
					email,
					role,
					region_id,
					regions(region_name)
				`)
				.order('created_at', { ascending: false });

			if (error) {
				throw error;
			} else {
				users = data;
			}
		} catch (error) {
			console.error('Error fetching users:', JSON.stringify(error, null, 2));
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		if (BYPASS_AUTH) {
			await fetchUsers();
		} else {
			const { data: { session } } = await supabase_content.auth.getSession();
			if (session) {
				await fetchUsers();
			} else {
				console.error('User not authenticated');
				// Redirect to login or handle unauthenticated state
				// For example: goto('/login');
			}
		}
	});
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<div class="p-4">
		<Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/crud/users">Users</BreadcrumbItem>
			<BreadcrumbItem>List</BreadcrumbItem>
		</Breadcrumb>
		<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			All Agents
		</Heading>

		<Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
			<Input placeholder="Search for users" class="me-4 w-80 border xl:w-96" />
			<div class="border-l border-gray-100 pl-2 dark:border-gray-700">
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<CogSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<TrashBinSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<ExclamationCircleSolid size="lg" />
				</ToolbarButton>
				<ToolbarButton
					color="dark"
					class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
				>
					<DotsVerticalOutline size="lg" />
				</ToolbarButton>
			</div>

			<div slot="end" class="flex items-center space-x-2">
				<Button
					size="sm"
					class="gap-2 whitespace-nowrap px-3"
					on:click={() => ((current_user = {}), (openUser = true))}
				>
					<PlusOutline size="sm" />Add user
				</Button>
				<Button size="sm" color="alternative" class="gap-2 px-3">
					<DownloadSolid size="md" class="-ml-1" />Export
				</Button>
			</div>
		</Toolbar>
	</div>
	{#if isLoading}
		<p>Loading...</p>
	{:else}
		<Table>
			<TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
				<TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
				{#each ['Name', 'Date Added', 'Position', 'Region', 'Actions'] as title}
					<TableHeadCell class="p-4 font-medium">{title}</TableHeadCell>
				{/each}
			</TableHead>
			<TableBody>
				{#each users as user}
					<TableBodyRow class="text-base">
						<TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
						<TableBodyCell class="mr-12 flex items-center space-x-6 whitespace-nowrap p-4">
							<Avatar src={imagesPath(user.avatar, 'users')} />
							<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
								<div class="text-base font-semibold text-gray-900 dark:text-white">{user.display_name}</div>
								<div class="text-sm font-normal text-gray-500 dark:text-gray-400">{user.email}</div>
							</div>
						</TableBodyCell>
						<TableBodyCell class="p-4">
							{new Date(user.created_at).toLocaleDateString()}
						</TableBodyCell>
						<TableBodyCell class="p-4">{user.role}</TableBodyCell>
						<TableBodyCell class="p-4">{user.regions?.region_name || 'N/A'}</TableBodyCell>
						<TableBodyCell class="space-x-2 p-4">
							<Button
								size="sm"
								class="gap-2 px-3"
								on:click={() => ((current_user = user), (openUser = true))}
							>
								<EditOutline size="sm" /> Edit user
							</Button>
							<Button
								color="red"
								size="sm"
								class="gap-2 px-3"
								on:click={() => ((current_user = user), (openDelete = true))}
							>
								<TrashBinSolid size="sm" /> Delete user
							</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
</main>

<!-- Modals -->
<User bind:open={openUser} data={current_user} />
<Delete bind:open={openDelete} />
