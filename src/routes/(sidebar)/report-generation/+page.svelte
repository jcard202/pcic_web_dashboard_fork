<script lang="ts">
	import { defaultHeaders, optionalHeaders } from '$lib/utils/arraysAndObj';
	import type { SortCriteria, TaskData } from '$lib/utils/types';
	import saveAs from 'file-saver';
	import {
		Button,
		Card,
		Checkbox,
		Heading,
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
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import { fade, slide } from 'svelte/transition';
	import * as XLSX from 'xlsx';
	import type { PageData } from './$types';

	export let data: PageData;

	let activeHeaders: string[] = [...defaultHeaders];
	let selectedHeaders: string[] = [...defaultHeaders];
	let allHeaders: string[] = [...defaultHeaders, ...optionalHeaders];
	let currentRegion = 'Region 5';

	let showColumnModal = false;
	let showFilter = false;
	let showSorting = false;

	function toggleHeader(header: string) {
		if (selectedHeaders.includes(header)) {
			selectedHeaders = selectedHeaders.filter((h) => h !== header);
		} else {
			selectedHeaders = [...selectedHeaders, header];
		}
	}

	function updateColumns() {
		activeHeaders = [...selectedHeaders];
		showColumnModal = false;
	}
	let startDate: Date = new Date();
	let endDate: Date = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

	function formatDateForInput(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	function setDate(event: Event): Date {
		const target = event.target as HTMLInputElement;
		return target.value ? new Date(target.value) : new Date();
	}

	// Weekly filtered data and summary

	$: startDateString = formatDateForInput(startDate);
	$: endDateString = formatDateForInput(endDate);
	$: weeklyFilteredData = filterTasksByDateRange(data.tasks, startDate, endDate);
	$: weeklySummary = calculateSummary(weeklyFilteredData);

	function filterTasksByDateRange(tasks: TaskData[], start: Date, end: Date): TaskData[] {
		return tasks.filter((task) => {
			if (!task['Date Added']) return false;
			const taskDate = new Date(task['Date Added']);
			return !isNaN(taskDate.getTime()) && taskDate >= start && taskDate <= end;
		});
	}

	function calculateSummary(tasks: TaskData[]) {
		return {
			totalTasks: tasks.length,
			completedTasks: tasks.filter((t) => t['Task Status'] === 'completed').length,
			ongoingTasks: tasks.filter((t) => t['Task Status'] === 'ongoing').length,
			forDispatchTasks: tasks.filter((t) => t['Task Status'] === 'for dispatch').length
		};
	}

	function generateWeeklyReport() {
		// This function can be used to generate a more detailed report if needed
		return {
			summary: weeklySummary,
			tasksByRegion: groupTasksByCategory(weeklyFilteredData, 'Region'),
			tasksByStatus: groupTasksByCategory(weeklyFilteredData, 'Task Status'),
			tasksByAssignee: groupTasksByCategory(weeklyFilteredData, 'Agent')
		};
	}

	function groupTasksByCategory(tasks: TaskData[], category: keyof TaskData) {
		return tasks.reduce(
			(acc, task) => {
				const key = task[category] as string;
				if (!acc[key]) acc[key] = [];
				acc[key].push(task);
				return acc;
			},
			{} as Record<string, TaskData[]>
		);
	}

	function generateWeeklyPDF() {
		const doc = new jsPDF();
		const report = generateWeeklyReport();

		doc.setFontSize(18);
		doc.text('Weekly Task Report', 14, 15);
		doc.setFontSize(12);
		doc.text(`Region: ${currentRegion}`, 14, 25);
		doc.text(
			`Date Range: ${formatDateForInput(startDate)} to ${formatDateForInput(endDate)}`,
			14,
			32
		);

		// Add summary
		doc.setFontSize(14);
		doc.text('Summary:', 14, 42);
		doc.setFontSize(12);
		doc.text(`Total Tasks: ${report.summary.totalTasks}`, 20, 52);
		doc.text(`Completed Tasks: ${report.summary.completedTasks}`, 20, 59);
		doc.text(`Ongoing Tasks: ${report.summary.ongoingTasks}`, 20, 66);
		doc.text(`For Dispatch Tasks: ${report.summary.forDispatchTasks}`, 20, 73);

		// Add tasks table
		autoTable(doc, {
			head: [activeHeaders],
			body: weeklyFilteredData.map((task) => activeHeaders.map((header) => task[header] ?? 'N/A')),
			startY: 80
		});

		doc.save('weekly_task_report.pdf');
	}

	function generateWeeklyExcel() {
		const report = generateWeeklyReport();
		const wb = XLSX.utils.book_new();

		// Summary sheet
		const summaryData = [
			['Weekly Task Report'],
			[`Region: ${currentRegion}`],
			[`Date Range: ${formatDateForInput(startDate)} to ${formatDateForInput(endDate)}`],
			[''],
			['Summary'],
			['Total Tasks', report.summary.totalTasks],
			['Completed Tasks', report.summary.completedTasks],
			['Ongoing Tasks', report.summary.ongoingTasks],
			['For Dispatch Tasks', report.summary.forDispatchTasks]
		];
		const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

		// Tasks sheet
		const tasksWs = XLSX.utils.json_to_sheet(weeklyFilteredData);
		XLSX.utils.book_append_sheet(wb, tasksWs, 'Tasks');

		// Generate Excel file
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		saveAs(
			new Blob([excelBuffer], { type: 'application/octet-stream' }),
			'weekly_task_report.xlsx'
		);
	}
	let filters: { selectedHeader: string; selectedOperator: string; value: string }[] = [];
	let filteredData = data.tasks;

	let operators = [
		{ value: '==', name: 'is equal to' },
		{ value: '!=', name: 'is not equal to' },
		{ value: '>', name: 'is greater than' },
		{ value: '<', name: 'is less than' },
		{ value: '>=', name: 'is greater than or equal to' },
		{ value: '<=', name: 'is less than or equal to' },
		{ value: 'contains', name: 'contains' }
	];

	function addFilter() {
		filters = [...filters, { selectedHeader: '', selectedOperator: '', value: '' }];
	}

	function removeFilter(index: number) {
		filters = filters.filter((_, i) => i !== index);
		applyFilters();
		showFilter = true;
	}

	function clearFilters() {
		filters = [];
		filteredData = [...data.tasks];
		if (sortCriteria.length > 0) {
			applySorting();
		} else {
			applyFilters();
		}
		showFilter = true;
	}

	let sortCriteria: SortCriteria[] = [];

	function addSortCriteria() {
		sortCriteria = [...sortCriteria, { column: '', ascending: true }];
	}

	function removeSortCriteria(index: number) {
		sortCriteria = sortCriteria.filter((_, i) => i !== index);
		applySorting();
		showSorting = true;
	}

	function applySorting() {
		filteredData = [...filteredData].sort((a, b) => {
			for (const criteria of sortCriteria) {
				const aValue = a[criteria.column as keyof TaskData];
				const bValue = b[criteria.column as keyof TaskData];

				if (aValue == null && bValue == null) continue;
				if (aValue == null) return criteria.ascending ? -1 : 1;
				if (bValue == null) return criteria.ascending ? 1 : -1;

				if (typeof aValue === 'string' && typeof bValue === 'string') {
					const compareResult = aValue.localeCompare(bValue);
					if (compareResult !== 0) {
						return criteria.ascending ? compareResult : -compareResult;
					}
				} else {
					if (aValue < bValue) return criteria.ascending ? -1 : 1;
					if (aValue > bValue) return criteria.ascending ? 1 : -1;
				}
			}
			return 0;
		});
		showSorting = false;
	}

	function clearSort() {
		sortCriteria = [];
		filteredData = [...data.tasks];
		applyFilters();
		showSorting = false;
	}

	function applyFilters() {
		filteredData = data.tasks.filter((task) => {
			return filters.every((filter) => {
				const taskValue = (task as any)[filter.selectedHeader];

				if (taskValue === null || taskValue === undefined) return false;
				const filterValue = filter.value;

				switch (filter.selectedOperator) {
					case '==':
						return taskValue.toString().toLowerCase() === filterValue.toLowerCase();
					case '!=':
						return taskValue.toString().toLowerCase() !== filterValue.toLowerCase();
					case '>':
						return taskValue > filterValue;
					case '<':
						return taskValue < filterValue;
					case '>=':
						return taskValue >= filterValue;
					case '<=':
						return taskValue <= filterValue;
					case 'contains':
						return taskValue.toString().toLowerCase().includes(filterValue.toLowerCase());
					default:
						return true;
				}
			});
		});

		if (sortCriteria.length > 0) {
			applySorting();
		}
	}
</script>

<main class="p-4">
	<div class="mt-px space-y-4">
		<Card size="xl" class="max-w-full shadow-sm ">
			<div class="mb-4 mt-px lg:mb-0">
				<Heading tag="h3" class="-ml-0.25 mb-2 text-xl font-semibold dark:text-white">
					Report Generation
				</Heading>
				<span class="text-base font-normal text-gray-500 dark:text-gray-400">
					This is a list of this week's tasks
				</span>
			</div>

			<!-- Date Range Selection -->
			<div class="mb-4 flex items-center space-x-4">
				<Input
					type="date"
					bind:value={startDateString}
					on:change={(e) => (startDate = setDate(e))}
					label="Start Date"
				/>
				<Input
					type="date"
					bind:value={endDateString}
					on:change={(e) => (endDate = setDate(e))}
					label="End Date"
				/>
			</div>

			<!-- Weekly Summary Display -->
			<div class="mb-4">
				<h4 class="text-lg font-semibold">Weekly Summary</h4>
				<p>Total Tasks: {weeklySummary.totalTasks}</p>
				<p>Completed Tasks: {weeklySummary.completedTasks}</p>
				<p>Ongoing Tasks: {weeklySummary.ongoingTasks}</p>
				<p>For Dispatch Tasks: {weeklySummary.forDispatchTasks}</p>
			</div>

			<div class="my-2 flex justify-between px-4 py-1">
				<div class="flex items-center gap-2">
					<div class="relative">
						<Button
							class="flex items-center gap-2 border-none text-xs "
							on:click={() => {
								showFilter = !showFilter;
							}}
							color={filters.length > 0 ? 'green' : 'light'}
							size="xs"><FilterOutline /> Filter</Button
						>

						{#if showFilter}
							<div
								transition:slide={{ axis: 'y', duration: 600 }}
								class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
							>
								{#if filters.length > 0}
									{#each filters as filter, index}
										<div class="flex items-center gap-2 py-1">
											<Select
												id="header-select"
												class="rounded border border-white py-1 text-xs"
												bind:value={filter.selectedHeader}
												placeholder="Select Column"
											>
												{#each activeHeaders as header}
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
												color="light"><CloseOutline /></Button
											>
										</div>
									{/each}
								{:else}
									<h2 class="text-sm">No Filters applied to the table.</h2>
								{/if}

								<hr class="my-2" />
								<div class="flex items-center justify-between py-1">
									<button on:click={addFilter} class="flex items-center gap-2 text-xs text-white"
										><PlusOutline class="size-4" />Add filter</button
									>

									<div class="flex items-center gap-2">
										<button
											on:click={clearFilters}
											class="{filters.length > 0 ? 'block' : 'hidden'} text-xs text-red-400"
											>Clear filter</button
										>
										<button
											on:click={() => {
												applyFilters(), (showFilter = false);
											}}
											class="flex items-center gap-2 text-xs text-white">Apply filter</button
										>
									</div>
								</div>
							</div>
						{/if}
					</div>
					<div class="relative">
						<Button
							class="flex items-center gap-2 border-none text-xs"
							on:click={() => {
								showSorting = !showSorting;
							}}
							color={sortCriteria.length > 0 ? 'green' : 'light'}
							size="xs"><SortOutline /> Sort</Button
						>

						{#if showSorting}
							<div
								transition:slide={{ axis: 'y', duration: 600 }}
								class="absolute top-12 z-20 w-[400px] rounded border border-white bg-gray-800 px-2 py-1"
							>
								{#if sortCriteria.length > 0}
									{#each sortCriteria as criteria, index}
										<div class="flex items-center gap-2 py-1">
											<Select
												class="rounded border border-white py-1 text-xs"
												bind:value={criteria.column}
												placeholder="Select Column"
											>
												{#each activeHeaders as header}
													<option value={header}>{header}</option>
												{/each}
											</Select>
											<div class="flex items-center">
												<Toggle color="green" bind:checked={criteria.ascending} class="mr-2" />
												<span class="text-xs text-white"
													>{criteria.ascending ? 'Ascending' : 'Descending'}</span
												>
											</div>
											<Button
												class="flex size-6 items-center justify-center border-none text-xs"
												on:click={() => removeSortCriteria(index)}
												size="xs"
												color="light"><CloseOutline /></Button
											>
										</div>
									{/each}
								{:else}
									<h2 class="text-sm">No sorting criteria applied to the table.</h2>
								{/if}

								<hr class="my-2" />
								<div class="flex items-center justify-between py-1">
									<button
										on:click={addSortCriteria}
										class="flex items-center gap-2 text-xs text-white"
										><PlusOutline class="size-4" />Pick a column to sort by</button
									>
									<div class="flex items-center gap-2">
										<button
											on:click={clearSort}
											class="text-xs text-red-400 {sortCriteria.length > 0 ? 'block' : 'hidden'}"
											>Clear sort</button
										>
										<button
											on:click={() => {
												applySorting(), (showSorting = false);
											}}
											class=" text-xs text-white">Apply sort</button
										>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div class="mx-3 h-7 divide-x border border-white"></div>
					<Button
						on:click={() => (showColumnModal = true)}
						color="light"
						size="xs"
						class="flex items-center gap-2 text-xs"
					>
						<CirclePlusOutline /> Customize Columns
					</Button>
				</div>
				<div class="flex justify-center gap-2 py-2">
					<Button class="text-xs" on:click={generateWeeklyPDF} color="light" size="xs"
						>Download PDF</Button
					>
					<Button class="text-xs" on:click={generateWeeklyExcel} color="light" size="xs"
						>Download Excel</Button
					>
				</div>
			</div>

			<Table
				hoverable={true}
				noborder
				class="z-0 mt-6 min-w-full divide-y divide-gray-200 py-4 dark:divide-gray-600"
			>
				<TableHead class="bg-gray-50 dark:bg-gray-700">
					{#each activeHeaders as header}
						<th transition:slide={{ axis: 'x', duration: 600, delay: 100 }}>
							<TableHeadCell class="whitespace-nowrap p-4 font-normal">
								<div class="flex items-center justify-between">
									<span>{header}</span>
									{#if sortCriteria.some((criteria) => criteria.column === header)}
										{#if sortCriteria.find((criteria) => criteria.column === header)?.ascending}
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
					{#each weeklyFilteredData as task}
						<TableBodyRow class="font-normal">
							{#each activeHeaders as header}
								<td transition:fade={{ duration: 600, delay: 100 }}>
									<TableBodyCell>
										{task[header] ?? 'N/A'}
									</TableBodyCell>
								</td>
							{/each}
						</TableBodyRow>
					{/each}
				</TableBody>
				<div class="h-12">Pagination here</div>
			</Table>
		</Card>
	</div>
</main>

<Modal bind:open={showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#each allHeaders as header}
				<Checkbox checked={selectedHeaders.includes(header)} on:change={() => toggleHeader(header)}>
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

<!-- For back up -->
<!-- <div class="relative">
						<Button
							class="flex items-center gap-2 border-none text-xs"
							on:click={() => (showFilter = !showFilter)}
							color="light"
							size="xs"><FilterOutline /> Filter</Button
						>

						{#if showFilter}
							<div
								transition:slide={{ axis: 'y', duration: 600 }}
								class="absolute top-12 z-20 w-[500px] rounded border border-white bg-gray-800 px-2 py-1"
							>
								{#if addFilter}
						
									<div class="flex items-center gap-2 py-1">
										<Select
											id="countries"
											class="rounded border border-white py-1 text-xs "
											bind:value={selectedHeader}
											placeholder=""
										>
											{#each activeHeaders as header}
												<option value={header}>{header}</option>
											{/each}
										</Select>
										<Select
											id="operators"
											class="rounded border border-white py-1 text-xs"
											bind:value={selectedOperator}
											placeholder="Operator"
										>
											{#each operators as { value, name }}
												<option {value}>{name}</option>
											{/each}
										</Select>
										<Input
											class=" rounded  bg-[#1f2937] py-1 text-xs"
											type="text"
											id="value"
											placeholder="value"
											required
											color="base"
										/>
									
										<Button
											class="flex size-6 items-center gap-2 border-none text-xs"
											on:click={() => (addFilter = false)}
											size="xs"
											color="light"><CloseOutline /></Button
										>
									</div>
								{:else}
									<h2 class="text-sm">No Filters applied to the table.</h2>
								{/if}

								<hr class="my-2" />
								<div class="flex items-center justify-between py-1">
									<button
										on:click={() => (addFilter = true)}
										class="flex items-center gap-2 text-xs text-white"
										><PlusOutline class="size-4" />Add filter</button
									>
									<button class="flex items-center gap-2 text-xs text-white">Apply filter</button>
								</div>
							</div>
						{/if}
					</div> -->

<!-- <Table
				hoverable={true}
				noborder
				class="z-0 mt-6 min-w-full divide-y divide-gray-200 py-4 dark:divide-gray-600"
			>
				<TableHead class="bg-gray-50 dark:bg-gray-700">
					{#each activeHeaders as header}
						<th transition:slide={{ axis: 'x', duration: 600, delay: 100 }}>
							<TableHeadCell class="whitespace-nowrap p-4 font-normal">
								<div class="flex items-center justify-between">
									<span>{header}</span>
									{#if sortCriteria.some((criteria) => criteria.column === header)}
										{#if sortCriteria.find((criteria) => criteria.column === header)?.ascending}
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
					{#each filteredData as user}
						<TableBodyRow class="font-normal">
							{#each activeHeaders as header}
								<td transition:fade={{ duration: 600, delay: 100 }}>
									<TableBodyCell>
										{user[header] ?? 'N/A'}
									</TableBodyCell>
								</td>
							{/each}
						</TableBodyRow>
					{/each}
				</TableBody>
				<div class="h-12">Pagination here</div>
			</Table> -->
