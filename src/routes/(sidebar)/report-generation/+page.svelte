<script lang="ts">
	import MainContainer from '$lib/utils/report-generation/components/MainContainer.svelte';
	import {
		addTaskFilter,
		addTaskSortCriteria,
		applyTaskFilters,
		applyTaskSorting,
		clearTaskFilters,
		clearTaskSort,
		initializeTaskFilteredData,
		removeTaskFilter,
		removeTaskSortCriteria,
		showTaskFilter,
		showTaskSorting,
		taskActiveHeaders,
		taskAllHeaders,
		taskFilteredData,
		taskFilters,
		taskOperators,
		taskSelectedHeaders,
		taskSortCriteria
	} from '$lib/utils/report-generation/taskStore';

	import {
		addUserFilter,
		addUserSortCriteria,
		applyUserFilters,
		applyUserSorting,
		clearUserFilters,
		clearUserSort,
		initializeUserFilteredData,
		removeUserFilter,
		removeUserSortCriteria,
		showUserFilter,
		showUserSorting,
		userActiveHeaders,
		userAllHeaders,
		userFilteredData,
		userFilters,
		userOperators,
		userSelectedHeaders,
		userSortCriteria
	} from '$lib/utils/report-generation/userStore';

	import { Button, Checkbox, Input, Modal, Select, Toggle } from 'flowbite-svelte';

	import {
		CirclePlusOutline,
		CloseOutline,
		FilterOutline,
		PlusOutline,
		SortOutline
	} from 'flowbite-svelte-icons';

	import TaskTable from '$lib/utils/report-generation/components/TaskTable.svelte';
	import UserTable from '$lib/utils/report-generation/components/UserTable.svelte';
	import { selectedTable, showColumnModal } from '$lib/utils/report-generation/tableStore';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	const { tasks, users } = data;

	let selectedView = 'Tasks';

	onMount(() => {
		initializeTaskFilteredData(tasks);
		initializeUserFilteredData(users);
	});

	$: sortedTasks = $taskFilteredData;
	$: sortedUsers = $userFilteredData;

	const toggleHeader = (header: string) => {
		$taskSelectedHeaders = $taskSelectedHeaders.includes(header)
			? $taskSelectedHeaders.filter((h) => h !== header)
			: [...$taskSelectedHeaders, header];
	};

	const updateColumns = () => {
		$taskActiveHeaders = [...$taskSelectedHeaders];
		$showColumnModal = false;
	};

	const toggleUserHeader = (header: string) => {
		$userSelectedHeaders = $userSelectedHeaders.includes(header)
			? $userSelectedHeaders.filter((h) => h !== header)
			: [...$userSelectedHeaders, header];
	};

	const updateUserColumns = () => {
		$userActiveHeaders = [...$userSelectedHeaders];
		$showColumnModal = false;
	};

	// const currentRegion = '5';
	// function generatePDF() {
	// 	const doc = new jsPDF();

	// 	// Set font sizes
	// 	const titleFontSize = 18;
	// 	const normalFontSize = 12;

	// 	// Add title
	// 	doc.setFontSize(titleFontSize);
	// 	doc.text('Task Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });

	// 	// Add region (top left)
	// 	doc.setFontSize(normalFontSize);
	// 	doc.text(`Region: ${currentRegion || 'All'}`, 14, 25);

	// 	// Add date range (top right)
	// 	const fromDate = '2023-01-01'; // Dummy date, replace with actual start date
	// 	const toDate = '2023-12-31'; // Dummy date, replace with actual end date
	// 	const dateText = `Date From: ${fromDate} To: ${toDate}`;
	// 	doc.text(dateText, doc.internal.pageSize.width - 14, 25, { align: 'right' });

	// 	// Add tasks table
	// 	autoTable(doc, {
	// 		head: [activeHeaders],
	// 		body: filteredData.map((task) => activeHeaders.map((header) => task[header] ?? 'N/A')),
	// 		startY: 35
	// 	});

	// 	doc.save('task_report.pdf');
	// }

	// function generateExcel() {
	// 	const wb = XLSX.utils.book_new();

	// 	// Summary sheet
	// 	const totalTasks = filteredData.length;
	// 	const completedTasks = filteredData.filter((task) => task.status === 'Completed').length;
	// 	const ongoingTasks = filteredData.filter((task) => task.status === 'Ongoing').length;
	// 	const forDispatchTasks = filteredData.filter((task) => task.status === 'For Dispatch').length;

	// 	const summaryData = [
	// 		['Task Report'],

	// 		[''],
	// 		['Summary'],
	// 		['Total Tasks', totalTasks],
	// 		['Completed Tasks', completedTasks],
	// 		['Ongoing Tasks', ongoingTasks],
	// 		['For Dispatch Tasks', forDispatchTasks]
	// 	];
	// 	const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
	// 	XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

	// 	// Tasks sheet
	// 	const tasksWs = XLSX.utils.json_to_sheet(filteredData);
	// 	XLSX.utils.book_append_sheet(wb, tasksWs, 'Tasks');

	// 	// Generate Excel file
	// 	const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
	// 	saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'task_report.xlsx');
	// }
</script>

<div class="mb-4">
	<Select bind:value={$selectedTable} class="w-48">
		<option value="tasks">Task Report</option>
		<option value="users">User Task Summary</option>
	</Select>
</div>

<MainContainer let:HeaderContainer let:HeaderTwoContainer let:ButtonContainer>
	<HeaderContainer>
		<svelte-fragment slot="headingContent">
			{#if $selectedTable === 'tasks'}
				Task Report
			{:else if $selectedTable === 'users'}
				User Task Summary
			{:else if $selectedTable === 'regions'}
				Region Summary
			{/if}
		</svelte-fragment>
		<svelte-fragment slot="headingDescription">
			{#if $selectedTable === 'tasks'}
				This is a list of this week's tasks
			{:else if $selectedTable === 'users'}
				This is a list of this week's users and tasks.
			{:else if $selectedTable === 'regions'}
				Region Summary
			{/if}
		</svelte-fragment>
	</HeaderContainer>
	<HeaderTwoContainer>
		{#if $selectedTable === 'tasks'}
			<ButtonContainer>
				<Button
					class="flex items-center gap-2 border-none text-xs"
					on:click={() => ($showTaskFilter = !$showTaskFilter)}
					color={$taskFilters.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<FilterOutline /> Filter
				</Button>

				{#if $showTaskFilter}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $taskFilters.length > 0}
							{#each $taskFilters as filter, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										id="header-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedHeader}
										placeholder="Select Column"
									>
										{#each $taskActiveHeaders as header}
											<option value={header}>{header}</option>
										{/each}
									</Select>
									<Select
										id="operator-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedOperator}
										placeholder="Select Operator"
									>
										{#each taskOperators as { value, name }}
											<option {value}>{name}</option>
										{/each}
									</Select>
									<Input
										class="rounded bg-[#1f2937] py-1 text-xs"
										type="text"
										bind:value={filter.value}
										placeholder="Value"
										required
										color="base"
									/>
									<Button
										class="flex size-6 items-center gap-2 border-none text-xs"
										on:click={() => removeTaskFilter(index)}
										size="xs"
										color="light"
									>
										<CloseOutline />
									</Button>
								</div>
							{/each}
						{:else}
							<h2 class="text-sm">No Filters applied to the table.</h2>
						{/if}

						<hr class="my-2" />
						<div class="flex items-center justify-between py-1">
							<button on:click={addTaskFilter} class="flex items-center gap-2 text-xs text-white">
								<PlusOutline class="size-4" />Add filter
							</button>

							<div class="flex items-center gap-2">
								<button
									on:click={clearTaskFilters}
									class="{$taskFilters.length > 0 ? 'block' : 'hidden'} text-xs text-red-400"
								>
									Clear filter
								</button>
								<button
									on:click={() => {
										applyTaskFilters();
										$showTaskFilter = false;
									}}
									class="flex items-center gap-2 text-xs text-white"
								>
									Apply filter
								</button>
							</div>
						</div>
					</div>
				{/if}
			</ButtonContainer>
			<ButtonContainer>
				<Button
					class="flex items-center gap-2 border-none text-xs"
					on:click={() => ($showTaskSorting = !$showTaskSorting)}
					color={$taskSortCriteria.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<SortOutline /> Sort
				</Button>

				{#if $showTaskSorting}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[400px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $taskSortCriteria.length > 0}
							{#each $taskSortCriteria as criteria, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										class="rounded border border-white py-1 text-xs"
										bind:value={criteria.column}
										placeholder="Select Column"
									>
										{#each $taskActiveHeaders as header}
											<option value={header}>{header}</option>
										{/each}
									</Select>
									<div class="flex items-center">
										<Toggle color="green" bind:checked={criteria.ascending} class="mr-2" />
										<span class="text-xs text-white">
											{criteria.ascending ? 'Ascending' : 'Descending'}
										</span>
									</div>
									<Button
										class="flex size-6 items-center justify-center border-none text-xs"
										on:click={() => removeTaskSortCriteria(index)}
										size="xs"
										color="light"
									>
										<CloseOutline />
									</Button>
								</div>
							{/each}
						{:else}
							<h2 class="text-sm">No sorting criteria applied to the table.</h2>
						{/if}

						<hr class="my-2" />
						<div class="flex items-center justify-between py-1">
							<button
								on:click={addTaskSortCriteria}
								class="flex items-center gap-2 text-xs text-white"
							>
								<PlusOutline class="size-4" />Pick a column to sort by
							</button>
							<div class="flex items-center gap-2">
								<!-- svelte-ignore missing-declaration -->
								<button
									on:click={clearTaskSort}
									class="text-xs text-red-400 {$taskSortCriteria.length > 0 ? 'block' : 'hidden'}"
								>
									Clear sort
								</button>
								<button
									on:click={() => {
										applyTaskSorting();
										$showTaskSorting = false;
									}}
									class="text-xs text-white"
								>
									Apply sort
								</button>
							</div>
						</div>
					</div>
				{/if}
			</ButtonContainer>
		{:else if $selectedTable === 'users'}
			<ButtonContainer>
				<Button
					class="flex items-center gap-2 border-none text-xs"
					on:click={() => ($showUserFilter = !$showUserFilter)}
					color={$userFilters.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<FilterOutline /> Filter
				</Button>

				{#if $showUserFilter}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $userFilters.length > 0}
							{#each $userFilters as filter, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										id="header-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedHeader}
										placeholder="Select Column"
									>
										{#each $userActiveHeaders as header}
											<option value={header}>{header}</option>
										{/each}
									</Select>
									<Select
										id="operator-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedOperator}
										placeholder="Select Operator"
									>
										{#each userOperators as { value, name }}
											<option {value}>{name}</option>
										{/each}
									</Select>
									<Input
										class="rounded bg-[#1f2937] py-1 text-xs"
										type="text"
										bind:value={filter.value}
										placeholder="Value"
										required
										color="base"
									/>
									<Button
										class="flex size-6 items-center gap-2 border-none text-xs"
										on:click={() => removeUserFilter(index)}
										size="xs"
										color="light"
									>
										<CloseOutline />
									</Button>
								</div>
							{/each}
						{:else}
							<h2 class="text-sm">No Filters applied to the table.</h2>
						{/if}

						<hr class="my-2" />
						<div class="flex items-center justify-between py-1">
							<button on:click={addUserFilter} class="flex items-center gap-2 text-xs text-white">
								<PlusOutline class="size-4" />Add filter
							</button>

							<div class="flex items-center gap-2">
								<button
									on:click={clearUserFilters}
									class="{$userFilters.length > 0 ? 'block' : 'hidden'} text-xs text-red-400"
								>
									Clear filter
								</button>
								<button
									on:click={() => {
										applyUserFilters();
										$showUserFilter = false;
									}}
									class="flex items-center gap-2 text-xs text-white"
								>
									Apply filter
								</button>
							</div>
						</div>
					</div>
				{/if}
			</ButtonContainer>
			<ButtonContainer>
				<Button
					class="flex items-center gap-2 border-none text-xs"
					on:click={() => ($showUserSorting = !$showUserSorting)}
					color={$userSortCriteria.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<SortOutline /> Sort
				</Button>

				{#if $showUserSorting}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[400px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $userSortCriteria.length > 0}
							{#each $userSortCriteria as criteria, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										class="rounded border border-white py-1 text-xs"
										bind:value={criteria.column}
										placeholder="Select Column"
									>
										{#each $userActiveHeaders as header}
											<option value={header}>{header}</option>
										{/each}
									</Select>
									<div class="flex items-center">
										<Toggle color="green" bind:checked={criteria.ascending} class="mr-2" />
										<span class="text-xs text-white">
											{criteria.ascending ? 'Ascending' : 'Descending'}
										</span>
									</div>
									<Button
										class="flex size-6 items-center justify-center border-none text-xs"
										on:click={() => removeUserSortCriteria(index)}
										size="xs"
										color="light"
									>
										<CloseOutline />
									</Button>
								</div>
							{/each}
						{:else}
							<h2 class="text-sm">No sorting criteria applied to the table.</h2>
						{/if}

						<hr class="my-2" />
						<div class="flex items-center justify-between py-1">
							<button
								on:click={addUserSortCriteria}
								class="flex items-center gap-2 text-xs text-white"
							>
								<PlusOutline class="size-4" />Pick a column to sort by
							</button>
							<div class="flex items-center gap-2">
								<!-- svelte-ignore missing-declaration -->
								<button
									on:click={clearUserSort}
									class="text-xs text-red-400 {$userSortCriteria.length > 0 ? 'block' : 'hidden'}"
								>
									Clear sort
								</button>
								<button
									on:click={() => {
										applyUserSorting();
										$showUserSorting = false;
									}}
									class="text-xs text-white"
								>
									Apply sort
								</button>
							</div>
						</div>
					</div>
				{/if}
			</ButtonContainer>
		{:else if $selectedTable === 'regions'}
			Region Summary
		{/if}

		<div class="mx-3 h-7 divide-x border border-white"></div>
		<Button
			on:click={() => ($showColumnModal = true)}
			color="light"
			size="xs"
			class="flex items-center gap-2 text-xs"
		>
			<CirclePlusOutline /> Customize Columns
		</Button>
		<svelte-fragment slot="rightMostContent">
			<div class="flex justify-center gap-2 py-2">
				<!-- <Button class="text-xs" on:click={generatePDF} color="light" size="xs"
					>Download PDF</Button
				>
				<Button class="text-xs" on:click={generateExcel} color="light" size="xs"
					>Download Excel</Button
				> -->
			</div>
		</svelte-fragment>
	</HeaderTwoContainer>

	<!-- Main Table here -->

	{#if $selectedTable === 'tasks'}
		<TaskTable {sortedTasks} />
	{:else if $selectedTable === 'users'}
		<UserTable {sortedUsers} />
	{/if}
</MainContainer>

<Modal bind:open={$showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#if $selectedTable === 'tasks'}
				{#each $taskAllHeaders as header}
					<Checkbox
						checked={$taskSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if $selectedTable === 'users'}
				{#each $userAllHeaders as header}
					<Checkbox
						checked={$userSelectedHeaders.includes(header)}
						on:change={() => toggleUserHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if $selectedTable === 'regions'}
				<p>s</p>
			{/if}
		</div>

		<div class="flex justify-end">
			{#if $selectedTable === 'tasks'}
				<Button class="mt-4" size="xs" color="alternative" on:click={updateColumns}>
					Update Columns
				</Button>
			{:else if $selectedTable === 'users'}
				<Button class="mt-4" size="xs" color="alternative" on:click={updateUserColumns}>
					Update Columns
				</Button>
			{:else if $selectedTable === 'regions'}
				<p>s</p>
			{/if}
		</div>
	</div>
</Modal>
