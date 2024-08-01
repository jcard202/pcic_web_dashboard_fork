<script lang="ts">
	// ---------------------------------------- IMPORTs ---------------------------------------------------- //

	import {
		Button,
		Card,
		Checkbox,
		Dropdown,
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	import { ChevronDownOutline, ChevronLeftOutline } from 'flowbite-svelte-icons';

	import { ArrowDownOutline, ArrowUpOutline } from 'flowbite-svelte-icons';

	import StatusBadge from './StatusBadge.svelte';

	import PaginationComponent from './Pagination.svelte';

	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';
	import { supabase_content } from './../../../supabase';
	// Adjust the import path as needed

	// ---------------------------------------- EXPORTs ---------------------------------------------------- //

	export let dark: boolean = false;

	// ----------------------------------------- LOGIC ----------------------------------------------------- //

	// Pagination
	let currentPage = 1;
	const pageSizeOptions: (number | 'All')[] = [5, 10, 25, 50, 'All'];
	let selectedPageSize: number | 'All' = 5;
	let pageSize: number;
	let totalPages: number;
	let paginatedData: typeof data;
	let showPagination: boolean;

	// Data
	let data: any[] = [];
	let isLoading = true;

	$: {
		pageSize = selectedPageSize === 'All' ? data.length : (selectedPageSize as number);
		totalPages = Math.ceil(data.length / pageSize);

		// Ensure currentPage is within valid range
		currentPage = Math.max(1, Math.min(currentPage, totalPages));

		paginatedData =
			selectedPageSize === 'All'
				? data
				: data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

		// Determine whether to show pagination
		showPagination = totalPages > 1 && selectedPageSize !== 'All';
	}

	// Sorting
	let sortColumn: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	function sortData(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}

		data.sort((a, b) => {
			const indexMap: { [key: string]: number } = {
				'Inspector Name': 1,
				'Mobile Number': 2,
				Online: 3,
				Mon: 4,
				Tue: 5,
				Wed: 6,
				Thu: 7,
				Fri: 8,
				Sat: 9,
				Sun: 10,
				'Total Dispatch': 11,
				'Total Completed': 12,
				Backlogs: 13
			};

			const index = indexMap[column];
			let valueA = a[index];
			let valueB = b[index];

			if (typeof valueA === 'string') valueA = valueA.toLowerCase();
			if (typeof valueB === 'string') valueB = valueB.toLowerCase();

			if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
			if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		data = data; // Trigger reactivity
	}

	// Table headers
	const headers = [
		'Inspector Name',
		'Mobile Number',
		'Online',
		'Mon',
		'Tue',
		'Wed',
		'Thu',
		'Fri',
		'Sat',
		'Sun',
		'Total Dispatch',
		'Total Completed',
		'Backlogs'
	];

	async function fetchData() {
		isLoading = true;
		const { data: fetchedData, error } = await supabase_content.from('users').select(`
                id,
                inspector_name,
                mobile_number,
                is_online
            `);

		if (error) {
			console.error('Error fetching data:', error);
			isLoading = false;
			return;
		}

		// Transform the data to match your table structure
		data = fetchedData.map((user) => [
			user.id,
			user.inspector_name,
			user.mobile_number,
			user.is_online,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0 // Placeholder values for other columns
		]);

		isLoading = false;
	}

	onMount(() => {
		fetchData();
	});

	function handleRowClick(index: string) {
		goto(`#${index}`);
	}
</script>

<Card size="xl" class="max-w-none shadow-sm">
	<div class="items-center justify-between lg:flex">
		<div class="mb-4 mt-px lg:mb-0">
			<Heading tag="h3" class="-ml-0.25 mb-2 text-xl font-semibold dark:text-white">
				This Week's Tasks
			</Heading>
			<span class="text-base font-normal text-gray-500 dark:text-gray-400">
				This is a list of this week's tasks
			</span>
		</div>
		<div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0">
			<div class="flex items-center">
				<Button color="alternative" class="w-fit whitespace-nowrap px-4 py-2">
					Filter by status
					<ChevronDownOutline size="lg" />
				</Button>
				<Dropdown class="w-44 space-y-3 p-3 text-sm" placement="bottom-start">
					<li><Checkbox checked>For Dispatch (97)</Checkbox></li>
					<li><Checkbox class="accent-primary-600">In progress (56)</Checkbox></li>
					<li><Checkbox class="accent-primary-600">Completed (56)</Checkbox></li>
				</Dropdown>
			</div>
		</div>
	</div>

	<div class="mb-4 flex items-center justify-end">
		<label for="pageSize" class="mr-2">Show:</label>
		<select
			id="pageSize"
			bind:value={selectedPageSize}
			class="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
		>
			{#each pageSizeOptions as option}
				<option value={option}>{option === 'All' ? 'All' : `${option} rows`}</option>
			{/each}
		</select>
	</div>

	<div class="text-red-900">Export Button here</div>

	{#if isLoading}
		<p>Loading...</p>
	{:else}
		<Table
			hoverable={true}
			noborder
			striped
			class="mt-6 min-w-full divide-y divide-gray-200 dark:divide-gray-600"
		>
			<TableHead class="bg-gray-50 dark:bg-gray-700">
				{#each headers as header}
					<TableHeadCell class="whitespace-nowrap p-4 font-normal">
						<button class="flex items-center" on:click={() => sortData(header)}>
							{header}
							{#if sortColumn === header}
								{#if sortDirection === 'asc'}
									<ArrowUpOutline class="ml-1 h-4 w-4" />
								{:else}
									<ArrowDownOutline class="ml-1 h-4 w-4" />
								{/if}
							{/if}
						</button>
					</TableHeadCell>
				{/each}
			</TableHead>
			<TableBody>
				{#each paginatedData as [id, name, mobile, online, mon, tue, wed, thu, fri, sat, sun, totalDispatch, totalCompleted, backlogs]}
					<TableBodyRow on:click={() => handleRowClick(id)} class="cursor-pointer">
						<TableBodyCell class="px-4 font-normal">{name}</TableBodyCell>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400">
							{mobile}
						</TableBodyCell>
						<TableBodyCell class="px-4">
							<StatusBadge state={online ? 'online' : 'offline'} {dark} />
						</TableBodyCell>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{mon}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{tue}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{wed}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{thu}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{fri}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{sat}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{sun}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{totalDispatch}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{totalCompleted}</TableBodyCell
						>
						<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
							>{backlogs}</TableBodyCell
						>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
	<div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6">
		<a
			href="#top"
			class="inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700 sm:text-sm"
		>
			<ChevronLeftOutline size="lg" /> Tasks report
		</a>
		{#if showPagination}
			<PaginationComponent bind:currentPage {totalPages} {pageSize} totalItems={data.length} />
		{/if}
	</div>
</Card>
