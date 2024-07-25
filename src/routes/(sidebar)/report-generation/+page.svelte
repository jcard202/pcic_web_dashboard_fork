<script lang="ts">
	import MainContainer from '$lib/utils/report-generation/components/MainContainer.svelte';
	import {
		addFilter,
		addSortCriteria,
		applyFilters,
		applySorting,
		clearFilters,
		clearSort,
		filteredData,
		filters,
		initializeFilteredData,
		operators,
		removeFilter,
		removeSortCriteria,
		showColumnModal,
		showFilter,
		showSorting,
		sortCriteria,
		taskActiveHeaders,
		taskAllHeaders,
		taskSelectedHeaders
	} from '$lib/utils/report-generation/taskStore';
	import {
		Button,
		Checkbox,
		Input,
		Modal,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Toggle
	} from 'flowbite-svelte';
	import {
		ChevronDownOutline,
		ChevronUpOutline,
		CirclePlusOutline,
		CloseOutline,
		FilterOutline,
		PlusOutline,
		SortOutline
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	const { tasks } = data;

	onMount(() => {
		initializeFilteredData(tasks);
	});
	$: sortedTasks = $filteredData;

	const toggleHeader = (header: string) => {
		$taskSelectedHeaders = $taskSelectedHeaders.includes(header)
			? $taskSelectedHeaders.filter((h) => h !== header)
			: [...$taskSelectedHeaders, header];
	};

	const updateColumns = () => {
		$taskActiveHeaders = [...$taskSelectedHeaders];
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

<MainContainer let:HeaderContainer let:HeaderTwoContainer let:ButtonContainer>
	<HeaderContainer>
		<svelte-fragment slot="headingContent"> Report Generation </svelte-fragment>
		<svelte-fragment slot="headingDescription">This is a list of this week's tasks</svelte-fragment>
	</HeaderContainer>
	<HeaderTwoContainer>
		<ButtonContainer>
			<Button
				class="flex items-center gap-2 border-none text-xs"
				on:click={() => ($showFilter = !$showFilter)}
				color={$filters.length > 0 ? 'green' : 'light'}
				size="xs"
			>
				<FilterOutline /> Filter
			</Button>

			{#if $showFilter}
				<div
					transition:slide={{ axis: 'y', duration: 600 }}
					class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
				>
					{#if $filters.length > 0}
						{#each $filters as filter, index}
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
									{#each operators as { value, name }}
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
									on:click={() => removeFilter(index)}
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
						<button on:click={addFilter} class="flex items-center gap-2 text-xs text-white">
							<PlusOutline class="size-4" />Add filter
						</button>

						<div class="flex items-center gap-2">
							<button
								on:click={clearFilters}
								class="{$filters.length > 0 ? 'block' : 'hidden'} text-xs text-red-400"
							>
								Clear filter
							</button>
							<button
								on:click={() => {
									applyFilters();
									$showFilter = false;
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
				on:click={() => ($showSorting = !$showSorting)}
				color={$sortCriteria.length > 0 ? 'green' : 'light'}
				size="xs"
			>
				<SortOutline /> Sort
			</Button>

			{#if $showSorting}
				<div
					transition:slide={{ axis: 'y', duration: 600 }}
					class="absolute top-12 z-20 w-[400px] rounded border border-white bg-gray-800 px-2 py-1"
				>
					{#if $sortCriteria.length > 0}
						{#each $sortCriteria as criteria, index}
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
									on:click={() => removeSortCriteria(index)}
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
						<button on:click={addSortCriteria} class="flex items-center gap-2 text-xs text-white">
							<PlusOutline class="size-4" />Pick a column to sort by
						</button>
						<div class="flex items-center gap-2">
							<!-- svelte-ignore missing-declaration -->
							<button
								on:click={clearSort}
								class="text-xs text-red-400 {$sortCriteria.length > 0 ? 'block' : 'hidden'}"
							>
								Clear sort
							</button>
							<button
								on:click={() => {
									applySorting();
									$showSorting = false;
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
	<Table
		hoverable={true}
		noborder
		class="z-0 mt-6 min-w-full divide-y divide-gray-200 py-4 dark:divide-gray-600"
	>
		<TableHead class="bg-gray-50 dark:bg-gray-700">
			{#each $taskActiveHeaders as header}
				<th transition:slide={{ axis: 'x', duration: 600, delay: 100 }}>
					<TableHeadCell class="whitespace-nowrap p-4 font-normal">
						<div class="flex items-center justify-between">
							<span>{header}</span>
							{#if $sortCriteria.some((criteria) => criteria.column === header)}
								{#if $sortCriteria.find((criteria) => criteria.column === header)?.ascending}
									<ChevronUpOutline class="ml-1 size-6 text-green-500" />
								{:else}
									<ChevronDownOutline class="ml-1 size-6 text-orange-500" />
								{/if}
							{/if}
						</div>
					</TableHeadCell>
				</th>
			{/each}
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each sortedTasks as task (task.id)}
				<TableBodyRow class="font-normal">
					{#each $taskActiveHeaders as header}
						<td transition:fade={{ duration: 600, delay: 100 }}>
							<TableBodyCell>
								{task[header] ?? 'N/A'}
							</TableBodyCell>
						</td>
					{/each}
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</MainContainer>

<Modal bind:open={$showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#each $taskAllHeaders as header}
				<Checkbox
					checked={$taskSelectedHeaders.includes(header)}
					on:change={() => toggleHeader(header)}
				>
					{header}
				</Checkbox>
			{/each}
		</div>

		<div class="flex justify-end">
			<Button class="mt-4" size="xs" color="alternative" on:click={updateColumns}>
				Update Columns
			</Button>
		</div>
	</div>
</Modal>
