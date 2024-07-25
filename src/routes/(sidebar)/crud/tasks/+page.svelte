<!-- src/routes/(sidebar)/crud/tasks/+page.svelte -->
<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Drawer,
		Heading,
		Input,
		Label,
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
		ArrowDownOutline,
		ArrowsRepeatOutline,
		ArrowUpDownOutline,
		ArrowUpOutline,
		CogSolid,
		DotsVerticalOutline,
		EditOutline,
		ExclamationCircleSolid,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import { onMount, type ComponentType } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import MetaTag from '../../../utils/MetaTag.svelte';
	import Delete from './Delete.svelte';
	import Task from './Task.svelte';
	import Toast from '../../../utils/widgets/Toast.svelte';
	import { Modal } from 'flowbite-svelte';

	let isSyncing = false;

	let hidden: boolean = true; // modal control
	let drawerComponent: ComponentType = Task; // drawer component

	const toggle = (component: ComponentType) => {
		drawerComponent = component;
		hidden = !hidden;
	};

	const path: string = '/crud/tasks';
	const description: string = 'CRUD products examaple - PCIC Web Dashboard';
	const title: string = 'PCIC Web Dashboard - CRUD Products';
	const subtitle: string = 'CRUD Products';
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	let isLoading = true;

	export let data;

	let users: any[] = [];
	let tasks: any[] = [];
	let current_user: any = {};
	let selected_task: any = {};
	let modalType:string =  'clear_forms';
	/* 
	Modal Types 
		1. clear_forms
		2. delete_multiple
	*/
	

	let open: boolean = false;
	let confirm_delete:string = '';

	let filteredTasks: any[] = [];
	let sortings: any[] = [];
	let toastProps: { show: boolean; message: string; type: 'success' | 'error' } = {
		show: false,
		message: '',
		type: 'success'
	};

	let selectedTasks: any[] = [];

	$: ({ supabase } = data);

	onMount(async () => {
		current_user = (await supabase.auth.getUser()).data.user;
		await fetchUsers();
		await fetchTasks();
	});

	const handleConfirmDelete = (event:any) => {
		confirm_delete = event.target.value 
	}

	const showToast = (message: string, type: 'success' | 'error') => {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	};

	const selectTasks = (task: any) => {
		if (!selectedTasks.includes(task)) {
			selectedTasks.push(task);
			selectedTasks = selectedTasks;
		} else {
			selectedTasks = selectedTasks.filter((_task) => _task !== task);
		}
	};

	const selectAllTasks = () => {
		if (selectedTasks >= filteredTasks) {
			selectedTasks = [];
		} else {
			selectedTasks = filteredTasks;
		}
	};

	const getPriorityIndex = (priority: string) => {
		const priorityMap: { [key: string]: number } = {
			high: 3,
			medium: 2,
			low: 1,
			'normal priority': 1.5,
		};

		return priorityMap[priority.toLowerCase()];
	};

	const sortTasks = () => {
		for (const sort of sortings) {
			switch (sort) {
				case 'Task Name Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return a.task_number.localeCompare(b.task_number);
					});
					break;
				case 'Service Type Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return a.service_type.localeCompare(b.service_type);
					});
					break;
				case 'Priority Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return getPriorityIndex(a.priority) - getPriorityIndex(b.priority);
					});
					break;
				case 'Task Name Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return a.task_number.localeCompare(b.task_number);
					});
					break;
				case 'Service Type Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return a.service_type.localeCompare(b.service_type);
					});
					break;
				case 'Priority Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return getPriorityIndex(a.priority) - getPriorityIndex(b.priority);
					});
					break;
			}
		}
	};

	const filterBySearch = (event: any) => {
		const search = event.target.value.toLowerCase();
		if (search.trim() == '') {
			filteredTasks = tasks;
			sortTasks();
			return;
		}
		filteredTasks = tasks.filter(
			(task) =>
				task.task_number.toLowerCase().includes(search) ||
				task.users.inspector_name.toLowerCase().includes(search) ||
				task.service_type.toLowerCase().includes(search) ||
				task.service_group.toLowerCase().includes(search)
		);
		sortTasks();
	};

	const setStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'text-green-500';
			case 'ongoing':
				return 'text-blue-500';
			case 'for dispatch':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const setPriorityColor = (priority: string) => {
		switch (priority.toLowerCase()) {
			case 'high':
				return 'text-red-500';
			case 'medium':
				return 'text-orange-500';
			case 'low':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const clearPPICForm = async (taskID: string) => {
		const form_response = await supabase
			.from('ppir_forms')
			.update({
				ppir_att_1: null,
				ppir_att_2: null,
				ppir_att_3: null,
				ppir_att_4: null,
				ppir_area_act: null,
				ppir_dopds_act: null,
				ppir_doptp_act: null,
				ppir_svp_act: null,
				ppir_variety: null,
				ppir_stagecrop: null,
				ppir_remarks: null,
				ppir_name_insured: null,
				ppir_name_iuia: null,
				ppir_sig_insured: null,
				ppir_sig_iuia: null
			})
			.eq('task_id', taskID);
		const task_response = await supabase.from('tasks').update({
			'status': 'for dispatch'
		}).eq('id', taskID);
		if (form_response.error || task_response.error) {
			showToast('Error in resetting PPIR Form!', 'error');
			return;
		}
	
		await fetchTasks();

		showToast('Successfully reset PPIR Form!', 'success');
	};

	const markAsComplete = async (taskID: string) => {
		const { data, error } = await supabase
			.from('tasks')
			.update({
				status: 'completed'
			})
			.eq('id', taskID);

		if (error) {
			console.log(error);
			showToast('Error in marking task as completed!', 'error');
			return false;
		}
		// add toast
		await fetchTasks();
		showToast('Successfully marked as completed', 'success');
		console.log('For successfully marked as completed');
		return true;
	};

	const upsertTask = async (upsertData: any) => {
		const invalidData = Object.keys(upsertData).find(
			(key) => key != 'id' && (upsertData[key] == null || upsertData[key].trim() == '')
		);
		if (invalidData) {
			showToast(`${invalidData.toUpperCase().replaceAll('_', ' ')} is required!`, 'error');
			return false;
		}
		const { data: responseData, error } = await supabase
			.from('tasks')
			.upsert(upsertData)
			.select(
				`
                    *,
                    users (
                        id,inspector_name
                    )
                `
			)
			.order('task_number', { ascending: true });
		if (error) {
			console.log(error);
			showToast('Error in processing data!', 'error');
			return false;
		}
		await fetchTasks();
		if (upsertData.id != null) {
			showToast('Successfully updated task', 'success');
		} else {
			showToast('Successfully added task', 'success');
		}
		return true;
	};

	const deleteTask = async (rowId: string) => {
		try {
			// Assuming 'id' is the primary key
			const { data, error } = await supabase.from('tasks').delete().eq('id', rowId);

			if (error) {
				showToast('Error in deleting task!', 'error');
				console.error('Error deleting row:', error.message);
				return;
			}
			await fetchTasks();
			showToast('Successfully deleted task', 'success');
			// Optionally, update state or perform other actions after deletion
		} catch (error) {
			console.error('Error deleting row:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const { data, error } = await supabase
				.from('users')
				.select(
					`
                    *,
                    regions (
                        region_name
                    )
                `
				)
				.neq('auth_user_id', current_user.id)
				.order('created_at', { ascending: false });

			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			users = data;
			console.log('Fetched users:', users);
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const fetchTasks = async () => {
		try {
			const { data, error } = await supabase
				.from('tasks')
				.select(
					`
                    *,
					ppir_forms (*),
                    users (
                        id,inspector_name
                    )
                `
				)
				.order('task_number', { ascending: true });
			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			tasks = data;
			filteredTasks = tasks;
			sortTasks();
		} catch (error) {
			console.error('Error fetching tasks:', error);
		} finally {
			isLoading = false;
		}
	};

	/**
	 * Synchronizes with an FTP server.
	 *
	 * This function initiates a synchronization process with an FTP server by
	 * sending a request to the server and handling the response. Currently, the
	 * actual FTP request is commented out as the server setup is incomplete.
	 * The function handles potential errors and provides user feedback through
	 * toast notifications.
	 *
	 * @async
	 * @function syncWithFTP
	 *
	 * @returns {void}
	 *
	 * @example
	 * syncWithFTP();
	 *
	 * @description
	 * The function performs the following steps:
	 * 1. Sets `isSyncing` to `true` to indicate that the sync process is ongoing.
	 * 2. Attempts to fetch the FTP directory listing from a placeholder API endpoint.
	 *    - The actual fetch request is commented out due to the unavailability of the FTP server.
	 * 3. If the server response is successful, logs the FTP directory listing and shows a success toast notification.
	 * 4. If an error occurs, catches the error and shows an error toast notification.
	 * 5. Sets `isSyncing` to `false` once the process is complete, regardless of success or failure.
	 */
	async function syncWithFTP() {
		isSyncing = true;
		try {
			// ---------------------------------------------------------------------------------------------------- //
			// note: for now this is commented out because we don't have the FTP server yet (error in accounts)
			// code below can be uncommented once the FTP server is available
			//
			// const response = await fetch('/api/ftp', {
			//     method: 'POST',
			//     headers: { 'Content-Type': 'application/json' },
			//     body: JSON.stringify({ action: 'list', path: '/' })
			// });
			// const result = await response.json();
			// if (result.success) {
			//     console.log('FTP Directory listing:', result.data);
			//     showToast('Sync completed successfully!', 'success');
			// } else {
			//     throw new Error(result.error);
			// }
			// ---------------------------------------------------------------------------------------------------- //

			/**
			 * Synchronization Algorithm for CSV Data Import (gpt/claud's help optimal solution)
			 *
			 * This function implements a flexible approach for synchronizing CSV data,
			 * supporting both local file system and FTP server as data sources.
			 *
			 * Algorithm Overview:
			 * 1. Determine the data source (local or FTP)  (mar: local is for testing the folders csv file read -> static/sample_csv)
			 * 2. Retrieve a list of available CSV files from the selected source
			 * 3. For each CSV file:
			 *    a. Check if the file has already been processed (compare with database records) (mar: file_read.file_name)
			 *    b. If not processed, read the file content (mar: insert the file into file_read table and get the id for usage in tasks insert)
			 *    c. Parse the CSV data into structured records
			 *    d. For each record:
			 *       i.   Validate the data (e.g., check if assignee email exists in the users table) (mar: check if the assignee exists in the users table, else raise error and cancel the whole process and delete the inserted file_read record)
			 *       ii.  (if goods lang dito then) Insert a new task record into the database (mar: insert the task record with the file_read_id)
			 *       iii. Insert corresponding PPIR form data (mar: insert the ppir form data with the task_id)
			 *    e. Mark the file as processed in the database
			 * 4. Handle any errors that occur during the process
			 * 5. Provide feedback on the synchronization result (success or failure)
			 *
			 * The algorithm is designed to be idempotent, ensuring that files are not
			 * processed multiple times, and robust, with proper error handling and
			 * reporting mechanisms.
			 *
			 * Future Enhancements:
			 * - Implement parallel processing for improved performance with large datasets
			 * - Add support for incremental updates to handle partially modified files
			 * - Integrate a logging system for detailed synchronization history (mar: no need)
			 */

			showToast('Sync completed successfully!', 'success');
		} catch (error) {
			// Type assertion
			const message = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Sync failed:', message);
			showToast('Sync failed: ' + message, 'error');
		} finally {
			isSyncing = false;
		}
	}
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<div class="p-4">
		<Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/crud/tasks">Tasks</BreadcrumbItem>
			<BreadcrumbItem>List</BreadcrumbItem>
		</Breadcrumb>
		<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			Task Management
		</Heading>

		<Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
			<Input
				on:keyup={filterBySearch}
				placeholder="Search for task"
				class="me-6 w-80 border xl:w-96"
			/>
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

			<div slot="end" class="flex items-center justify-center space-x-2">
				<!-- mar sync -->
				<Button class="whitespace-nowrap" on:click={syncWithFTP} disabled={isSyncing}>
					{#if isSyncing}
						<span class="loader"></span>
					{:else}
						<ArrowsRepeatOutline size="sm" /> Sync
					{/if}
				</Button>

				<Button
					class="whitespace-nowrap"
					on:click={async () => {
						modalType = 'clear_forms';
						open = true;
					}}
					disabled={selectedTasks.length == 0}>Reset PPIC Forms</Button
				>

				<Button
					color='red'
					class="whitespace-nowrap"
					on:click={async () => {
						modalType = 'delete_multiple';
						open = true;
					}}
					disabled={selectedTasks.length == 0}>Delete Tasks</Button
				>

				<Button
					class="whitespace-nowrap"
					on:click={() => {
						selected_task = null;
						toggle(Task);
					}}>Add New Task</Button
				>
			</div>
		</Toolbar>
	</div>
	<Table>
		<TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
			<TableHeadCell class="w-4 p-4"
				><Checkbox
					on:click={selectAllTasks}
					checked={selectedTasks.length >= filteredTasks.length}
				/></TableHeadCell
			>
			{#each ['Task Name', 'Service Group', 'Service Type', 'Attempts', 'Priority', 'Status', 'Assignee', 'Actions'] as title}
				<TableHeadCell class="ps-4 font-normal">
					<div class="flex">
						{title}
						{#if ['Task Name', 'Service Type', 'Priority'].includes(title)}
							{#if !sortings.includes(title + ' Desc') && !sortings.includes(title + ' Asc')}
								<button
									on:click={() => {
										sortings.push(title + ' Desc');
										sortings = sortings;
										sortTasks();
									}}
								>
									<ArrowUpDownOutline class="ml-2 cursor-pointer  hover:text-green-400" size="sm" />
								</button>
							{:else if sortings.includes(title + ' Desc')}
								<button
									on:click={() => {
										sortings = sortings.filter((item) => item !== title + ' Desc');
										sortings.push(title + ' Asc');
										sortings = sortings;
										sortTasks();
									}}
								>
									<ArrowDownOutline
										class="ml-2 cursor-pointer text-green-500 hover:text-green-400"
										size="sm"
									/>
								</button>
							{:else}
								<button
									on:click={() => {
										sortings = sortings.filter((item) => item !== title + ' Asc');
										sortTasks();
									}}
								>
									<ArrowUpOutline
										class="ml-2 cursor-pointer text-green-500 hover:text-green-400"
										size="sm"
									/>
								</button>
							{/if}
						{/if}
					</div>
				</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each filteredTasks as task}
				<TableBodyRow class="text-base">
					<TableBodyCell on:click={() => selectTasks(task)} class="w-4 p-4"
						><Checkbox checked={selectedTasks.includes(task)} /></TableBodyCell
					>
					<TableBodyCell class="flex items-center space-x-6 whitespace-nowrap p-4">
						<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
							<div class="text-base font-semibold text-gray-900 dark:text-white">
								{task.task_number}
							</div>
							<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
								{task.task_type}
							</div>
						</div>
					</TableBodyCell>
					<TableBodyCell class="p-4 font-normal text-gray-500 dark:text-gray-400"
						>{task.service_group}</TableBodyCell
					>
					<TableBodyCell
						class="max-w-sm overflow-hidden truncate p-4 text-base font-normal text-gray-500 dark:text-gray-400 xl:max-w-xs"
						>{task.service_type}</TableBodyCell
					>
					<TableBodyCell class="p-4">{task.attempt_count}</TableBodyCell>
					<TableBodyCell
						class="p-4 font-normal dark:{setPriorityColor(task.priority)} {setPriorityColor(
							task.priority
						)}">{task.priority.toUpperCase()}</TableBodyCell
					>
					<TableBodyCell
						class="p-4 font-normal dark:{setStatusColor(task.status)} {setStatusColor(task.status)}"
						>{task.status.toUpperCase()}</TableBodyCell
					>
					<TableBodyCell class="p-4 font-normal text-gray-500 dark:text-gray-400"
						>{task.users.inspector_name.toUpperCase()}</TableBodyCell
					>
					<TableBodyCell class="space-x-2">
						<Button
							size="sm"
							class="gap-2 px-3"
							on:click={() => {
								selected_task = task;
								toggle(Task);
							}}
						>
							<EditOutline size="sm" /> Manage
						</Button>
						<Button
							color="red"
							size="sm"
							class="gap-2 px-3"
							on:click={() => {
								selected_task = task;
								toggle(Delete);
							}}
						>
							<TrashBinSolid size="sm" /> Delete item
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</main>

<Drawer
	activateClickOutside={false}
	placement="right"
	transitionType="fly"
	{transitionParams}
	bind:hidden
>
	<svelte:component
		this={drawerComponent}
		{users}
		{markAsComplete}
		{selected_task}
		{upsertTask}
		deleteTask={() => deleteTask(selected_task.id)}
		clearForm={clearPPICForm}
		bind:hidden
	/>
</Drawer>

<Modal bind:open size="sm">
	<ExclamationCircleSolid class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />

	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
		{
			modalType == 'clear_forms' ?
			"Are you sure you want reset PPIR forms of the selected tasks?" : 
			"Are you sure you want to permanently delete the selected tasks?"
		}
	</h3>
	{#if modalType == 'delete_multiple'}
		<Label class="space-y-2">
			<span>Type 'DELETE' to confirm deletion of selected tasks</span>
			<Input on:keyup={handleConfirmDelete} name="delete" class="border font-normal outline-none" placeholder="Type 'DELETE'"
			required />
		</Label>
	{/if}

	<div class="flex items-center justify-center">
		<Button
			color="red"
			class="mr-2"
			on:click={async () => {
				if(modalType == 'delete_multiple' && confirm_delete != 'DELETE'){
					showToast(`Please enter 'DELETE' to confirm task deletion!`, 'error');
					return;
				}
				for (const t of selectedTasks) {
					try {
						if(modalType == 'clear_forms'){
							await clearPPICForm(t.id);
							showToast(`Successfully cleared form of ${t.task_number}`, 'success');
						}else{
							await deleteTask(t.id);
							showToast(`Successfully deleted form of ${t.task_number}`, 'success');
						}
					} catch (e) {
						if(modalType == 'clear_forms'){
							showToast(`Failed to clear form of ${t.task_number}`, 'error');
						}else{
							showToast(`Failed to delete ${t.task_number}`, 'error');
						}
						return;
					}
				}
				if(modalType == 'clear_forms'){
					showToast(`Successfully cleared selected forms!`, 'success');
				}else{
					showToast(`Successfully deleted selected forms!`, 'success');
				}
				open = false;
			}}
			>Yes, I'm sure
		</Button>
		<Button color="alternative" on:click={() => (open = false)}>No, cancel</Button>
	</div>
</Modal>

<Toast {...toastProps} />
