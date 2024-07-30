<script lang="ts">
	// ---------------------------------------- EXPORTs ---------------------------------------------------- //

	import type { Region } from '$lib/utils/report-generation/types';
	import type { Task, User } from '$lib/utils/types';
	import type { PageData } from './$types';

	import { selectedTable, showColumnModal } from '$lib/utils/report-generation/tableStore';
	import { Button, Checkbox, Input, Modal, Select, Toggle } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	import MainContainer from '$lib/utils/report-generation/components/MainContainer.svelte';
	import RegionTable from '$lib/utils/report-generation/components/RegionTable.svelte';
	import TaskTable from '$lib/utils/report-generation/components/TaskTable.svelte';
	import UserTable from '$lib/utils/report-generation/components/UserTable.svelte';
	import autoTable from 'jspdf-autotable';
	import * as XLSX from 'xlsx';
	import jsPDF from 'jspdf';

	import {
		CirclePlusOutline,
		CloseOutline,
		FilePdfOutline,
		FilterOutline,
		PlusOutline,
		SortOutline,
		TableColumnOutline
	} from 'flowbite-svelte-icons';

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
		userFilters,
		userOperators,
		userSelectedHeaders,
		userSortCriteria
	} from '$lib/utils/report-generation/userStore';

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
		taskFilters,
		taskOperators,
		taskSelectedHeaders,
		taskSortCriteria
	} from '$lib/utils/report-generation/taskStore';

	import {
		addRegionFilter,
		addRegionSortCriteria,
		applyRegionFilters,
		applyRegionSorting,
		clearRegionFilters,
		clearRegionSort,
		initializeRegionFilteredData,
		regionActiveHeaders,
		regionAllHeaders,
		regionFilters,
		regionOperators,
		regionSelectedHeaders,
		regionSortCriteria,
		removeRegionFilter,
		removeRegionSortCriteria,
		showRegionFilter,
		showRegionSorting
	} from '$lib/utils/report-generation/regionStore';

	// ----------------------------------------- Logic ----------------------------------------------------- //

	export let data: PageData;

	const { tasks, users, regions, userCurrentRegion } = data;

	onMount(() => {
		initializeTaskFilteredData(tasks);
		initializeUserFilteredData(users);
		initializeRegionFilteredData(regions);
	});

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

	const toggleRegionHeader = (header: string) => {
		$regionSelectedHeaders = $regionSelectedHeaders.includes(header)
			? $regionSelectedHeaders.filter((h) => h !== header)
			: [...$regionSelectedHeaders, header];
	};

	const updateRegionColumns = () => {
		$regionActiveHeaders = [...$regionSelectedHeaders];
		$showColumnModal = false;
	};

	const getStartOfWeek = (date: Date) => {
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(date.setDate(diff));
	};

	const getFormattedDate = (date: Date) => {
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
			.getDate()
			.toString()
			.padStart(2, '0')}`;
	};

	const getDataAndFileName = () => {
		let headers: string[] | undefined;
		let body: any[] = [];
		let fileName: string | undefined;

		switch ($selectedTable) {
			case 'users':
				headers = get(userActiveHeaders);
				body =
					users.length > 0
						? users.map((user: User) =>
								headers!.map((header) => user[header as keyof User] ?? 'N/A')
							)
						: headers.map(() => '');
				fileName = 'user_task_summary';
				break;
			case 'tasks':
				headers = get(taskActiveHeaders);
				body =
					tasks.length > 0
						? tasks.map((task: Task) =>
								headers!.map((header) => task[header as keyof Task] ?? 'N/A')
							)
						: headers.map(() => '');
				fileName = 'task_report';
				break;
			case 'regions':
				headers = get(regionActiveHeaders);
				body =
					regions.length > 0
						? regions.map((region: Region) =>
								headers!.map((header) => region[header as keyof Region] ?? 'N/A')
							)
						: headers.map(() => '');
				fileName = 'region_summary';
				break;
			default:
				throw new Error('Invalid table selection');
		}

		// Ensure headers and fileName are defined before returning
		if (!headers || !fileName) {
			throw new Error('Headers or fileName is not defined');
		}

		return { headers, body, fileName };
	};

	const generatePDF = () => {
		const doc = new jsPDF();
		const region = userCurrentRegion;
		const today = new Date();
		const startOfWeek = getStartOfWeek(new Date());
		const fromDate = getFormattedDate(startOfWeek);
		const toDate = getFormattedDate(today);

		// Set font sizes
		const titleFontSize = 18;
		const normalFontSize = 12;

		const { headers, body, fileName } = getDataAndFileName();

		// Add title
		doc.setFontSize(titleFontSize);
		doc.text(`${fileName.replace('_', ' ')}`, doc.internal.pageSize.width / 2, 15, {
			align: 'center'
		});

		// Add region (top left)
		doc.setFontSize(normalFontSize);
		doc.text(`${region}`, 14, 25);

		// Add date range (top right)
		const dateText = `Date From: ${fromDate} To: ${toDate}`;
		doc.text(dateText, doc.internal.pageSize.width - 14, 25, { align: 'right' });

		// Add table
		autoTable(doc, { head: [headers], body, startY: 35 });

		doc.save(`${fileName}.pdf`);
	};

	const generateExcel = () => {
		const { headers, body, fileName } = getDataAndFileName();

		const worksheet = XLSX.utils.json_to_sheet(
			body.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])))
		);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

		XLSX.writeFile(workbook, `${fileName}.xlsx`);
	};
</script>

<MainContainer let:HeaderContainer let:HeaderTwoContainer let:ButtonContainer>
	<div class="flex items-center justify-between">
		<HeaderContainer>
			<svelte-fragment slot="headingContent">
				{#if $selectedTable === 'users'}
					User Task Summary
				{:else if $selectedTable === 'tasks'}
					Task Report
				{:else if $selectedTable === 'regions'}
					Region Summary
				{/if}
			</svelte-fragment>
			<svelte-fragment slot="headingDescription">
				{#if $selectedTable === 'users'}
					This is a list of this week's users and tasks.
				{:else if $selectedTable === 'tasks'}
					This is a list of this week's tasks
				{:else if $selectedTable === 'regions'}
					Region Summary
				{/if}
			</svelte-fragment>
		</HeaderContainer>
		<div class="mb-4 flex items-center gap-2">
			<span class="text-xs text-white">Current page:</span>

			<Select
				bind:value={$selectedTable}
				class="w-48 text-xs"
				color="light"
				size="sm"
				placeholder=""
			>
				<option value="users">User Task Summary</option>
				<option value="tasks">Task Report</option>
				<option value="regions">Regions Summary</option>
			</Select>
		</div>
	</div>

	<HeaderTwoContainer>
		{#if $selectedTable === 'users'}
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
		{:else if $selectedTable === 'tasks'}
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
		{:else if $selectedTable === 'regions'}
			<ButtonContainer>
				<Button
					class="flex items-center gap-2 border-none text-xs"
					on:click={() => ($showRegionFilter = !$showRegionFilter)}
					color={$regionFilters.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<FilterOutline /> Filter
				</Button>
				{#if $showRegionFilter}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $regionFilters.length > 0}
							{#each $regionFilters as filter, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										id="header-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedHeader}
										placeholder="Select Column"
									>
										{#each $regionActiveHeaders as header}
											<option value={header}>{header}</option>
										{/each}
									</Select>
									<Select
										id="operator-select"
										class="rounded border border-white py-1 text-xs"
										bind:value={filter.selectedOperator}
										placeholder="Select Operator"
									>
										{#each regionOperators as { value, name }}
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
										on:click={() => removeRegionFilter(index)}
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
							<button on:click={addRegionFilter} class="flex items-center gap-2 text-xs text-white">
								<PlusOutline class="size-4" />Add filter
							</button>

							<div class="flex items-center gap-2">
								<button
									on:click={clearRegionFilters}
									class="{$regionFilters.length > 0 ? 'block' : 'hidden'} text-xs text-red-400"
								>
									Clear filter
								</button>
								<button
									on:click={() => {
										applyRegionFilters();
										$showRegionFilter = false;
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
					on:click={() => ($showRegionSorting = !$showRegionSorting)}
					color={$regionSortCriteria.length > 0 ? 'green' : 'light'}
					size="xs"
				>
					<SortOutline /> Sort
				</Button>
				{#if $showRegionSorting}
					<div
						transition:slide={{ axis: 'y', duration: 600 }}
						class="absolute top-12 z-20 w-[400px] rounded border border-white bg-gray-800 px-2 py-1"
					>
						{#if $regionSortCriteria.length > 0}
							{#each $regionSortCriteria as criteria, index}
								<div class="flex items-center gap-2 py-1">
									<Select
										class="rounded border border-white py-1 text-xs"
										bind:value={criteria.column}
										placeholder="Select Column"
									>
										{#each $regionActiveHeaders as header}
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
										on:click={() => removeRegionSortCriteria(index)}
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
								on:click={addRegionSortCriteria}
								class="flex items-center gap-2 text-xs text-white"
							>
								<PlusOutline class="size-4" />Pick a column to sort by
							</button>
							<div class="flex items-center gap-2">
								<button
									on:click={clearRegionSort}
									class="text-xs text-red-400 {$regionSortCriteria.length > 0 ? 'block' : 'hidden'}"
								>
									Clear sort
								</button>
								<button
									on:click={() => {
										applyRegionSorting();
										$showRegionSorting = false;
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
				<Button
					class="flex items-center gap-2 text-xs"
					color="light"
					size="xs"
					on:click={generatePDF}><FilePdfOutline /> Download PDF</Button
				>
				<Button
					class="flex items-center gap-2 text-xs"
					color="light"
					size="xs"
					on:click={generateExcel}><TableColumnOutline /> Download Excel</Button
				>
			</div>
		</svelte-fragment>
	</HeaderTwoContainer>

	<!-- Main Table here -->

	{#if $selectedTable === 'users'}
		<UserTable />
	{:else if $selectedTable === 'tasks'}
		<TaskTable />
	{:else if $selectedTable === 'regions'}
		<RegionTable />
	{/if}
</MainContainer>

<Modal bind:open={$showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#if $selectedTable === 'users'}
				{#each $userAllHeaders as header}
					<Checkbox
						checked={$userSelectedHeaders.includes(header)}
						on:change={() => toggleUserHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if $selectedTable === 'tasks'}
				{#each $taskAllHeaders as header}
					<Checkbox
						checked={$taskSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if $selectedTable === 'regions'}
				{#each $regionAllHeaders as header}
					<Checkbox
						checked={$regionSelectedHeaders.includes(header)}
						on:change={() => toggleRegionHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{/if}
		</div>

		<div class="flex justify-end">
			{#if $selectedTable === 'users'}
				<Button class="mt-4" size="xs" color="alternative" on:click={updateUserColumns}>
					Update Columns
				</Button>
			{:else if $selectedTable === 'tasks'}
				<Button class="mt-4" size="xs" color="alternative" on:click={updateColumns}>
					Update Columns
				</Button>
			{:else if $selectedTable === 'regions'}
				<Button class="mt-4" size="xs" color="alternative" on:click={updateRegionColumns}>
					Update Columns
				</Button>
			{/if}
		</div>
	</div>
</Modal>
