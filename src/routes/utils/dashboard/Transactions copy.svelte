<script lang="ts">
	import { onMount } from 'svelte';
	import TaskTimeline from './TaskTimeline.svelte';
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import * as XLSX from 'xlsx';
	import { FilePdfOutline, TableColumnOutline } from 'flowbite-svelte-icons';
	import TaskTable from '$lib/utils/report-generation/components/TaskTable.svelte';
	import RegionTable from '$lib/utils/report-generation/components/RegionTable.svelte';

	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Heading,
		Button,
		Checkbox,
		Modal,
		Select
	} from 'flowbite-svelte';

	import {
		initializeTaskFilteredData,
		taskActiveHeaders,
		taskAllHeaders,
		taskSelectedHeaders,
		taskSortCriteria
	} from '$lib/utils/report-generation/taskStore';

	import {
		initializeRegionFilteredData,
		regionActiveHeaders,
		regionAllHeaders,
		regionSelectedHeaders
	} from '$lib/utils/report-generation/regionStore';

	let showActivity = false;
	let selectedUserId: string | null = null;
	let inspectors: any[] = [];
	let isLoading = true;
	let dataError: string | null = null;

	// Dropdown states
	let selectedMonth = new Date().getMonth();
	let selectedDay = new Date().getDate();
	let selectedWeek = getCurrentWeekNumber(new Date());

	let monthOptions = Array.from({ length: 12 }, (_, i) => i);
	let dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
	let weekOptions: any[] = [];

	let showColumnModal = false;
	let userActiveHeaders = [
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

	export let data;
	$: ({ supabase } = data);

	let selectedTable: string = 'users';

	let userSelectedHeaders = [...userActiveHeaders];

	function getCurrentWeekNumber(date: Date) {
		const start = new Date(date.getFullYear(), date.getMonth(), 1);
		const diff =
			date.getTime() -
			start.getTime() +
			(start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
		const oneWeek = 604800000;
		return Math.floor(diff / oneWeek) + 1;
	}

	function getStartAndEndOfWeek(week: number, month: number, year: number) {
		const start = new Date(year, month, (week - 1) * 7 + 1);
		const end = new Date(year, month, (week - 1) * 7 + 7);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}

	function updateWeekOptions() {
		const selectedDate = new Date(new Date().getFullYear(), selectedMonth, selectedDay);
		selectedWeek = getCurrentWeekNumber(selectedDate);
		const totalWeeksInMonth = getCurrentWeekNumber(
			new Date(new Date().getFullYear(), selectedMonth + 1, 0)
		);
		// Get number of weeks in the month
		weekOptions = Array.from({ length: totalWeeksInMonth }, (_, i) => i + 1);
	}

	async function fetchInspectors() {
		isLoading = true;
		try {
			const { data: users, error: usersError } = await supabase
				.from('users')
				.select(
					`
                    id, 
                    inspector_name, 
                    mobile_number, 
                    is_online, 
                    email,
                    regions (
                        region_name
                    )
                `
				)
				.eq('role', 'Agent');

			if (usersError) {
				dataError = usersError.message;
				console.error('Error fetching users:', usersError);
				isLoading = false;
				return;
			}

			const { data: tasks, error: tasksError } = await supabase
				.from('tasks')
				.select('id, assignee, status, created_at');

			if (tasksError) {
				dataError = tasksError.message;
				console.error('Error fetching tasks:', tasksError);
				isLoading = false;
				return;
			}

			const today = new Date();
			const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(
				selectedWeek,
				selectedMonth,
				today.getFullYear()
			);

			/**
			 * BUG: Parameter 'user' implicitly has an 'any' type.
			 *
			 * For fix.
			 */
			inspectors = users.map((user) => {
				const userTasks = tasks.filter((task) => task.assignee === user.id);
				const totalDispatch = userTasks.length;
				const completed = userTasks.filter((task) => task.status === 'completed').length;
				const backlogs = userTasks.filter((task) => task.status === 'ongoing').length;

				const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
				const tasksByDay = weekDays.map((day, index) => {
					const dayStart = new Date(startOfWeek);
					dayStart.setDate(startOfWeek.getDate() + index);
					const dayEnd = new Date(dayStart);
					dayEnd.setHours(23, 59, 59, 999);

					return userTasks.filter((task) => {
						const taskDate = new Date(task.created_at);
						return taskDate >= dayStart && taskDate <= dayEnd && task.status === 'completed';
					}).length;
				});

				return {
					id: user.id,
					name: user.inspector_name,
					mobile: user.mobile_number,
					online: user.is_online,
					...tasksByDay.reduce((acc, count, index) => ({ ...acc, [weekDays[index]]: count }), {}),
					totalDispatch,
					completed,
					backlogs,
					email: user.email,
					region: user.regions?.region_name ?? 'N/A'
				};
			});
		} catch (error) {
			dataError = (error as Error).message;
			console.error('Error:', error);
		}
		isLoading = false;
	}

	function handleRowClick(userId: string) {
		selectedUserId = userId;
		showActivity = true;
	}

	function goBack() {
		showActivity = false;
		selectedUserId = null;
	}

	function handleMonthChange(event: Event) {
		selectedMonth = parseInt((event.target as HTMLSelectElement).value);
		// Update week options based on selected month and day
		updateWeekOptions();
		fetchInspectors();
	}

	function handleDayChange(event: Event) {
		selectedDay = parseInt((event.target as HTMLSelectElement).value);
		// Update week options based on selected month and day
		updateWeekOptions();
		fetchInspectors();
	}

	function handleWeekChange(event: Event) {
		selectedWeek = parseInt((event.target as HTMLSelectElement).value);
		const { start: startOfWeek } = getStartAndEndOfWeek(
			selectedWeek,
			selectedMonth,
			new Date().getFullYear()
		);
		// Adjust the selected day to the first day of the week
		selectedDay = startOfWeek.getDate();
		fetchInspectors();
	}

	// Toggles header selection
	const toggleHeader = (header: string) => {
		if (selectedTable == 'tasks') {
			$taskSelectedHeaders = $taskSelectedHeaders.includes(header)
				? $taskSelectedHeaders.filter((h) => h !== header)
				: [...$taskSelectedHeaders, header];
		} else if (selectedTable == 'regions') {
			$regionSelectedHeaders = $regionSelectedHeaders.includes(header)
				? $regionSelectedHeaders.filter((h) => h !== header)
				: [...$regionSelectedHeaders, header];
		} else {
			userSelectedHeaders = userSelectedHeaders.includes(header)
				? userSelectedHeaders.filter((h) => h !== header)
				: [...userSelectedHeaders, header];
		}
	};

	// Updates the active columns based on selected headers
	const updateColumns = () => {
		if (selectedTable == 'tasks') {
			$taskActiveHeaders = [...$taskSelectedHeaders];
			showColumnModal = false;
		} else if (selectedTable == 'regions') {
			$regionActiveHeaders = [...$regionSelectedHeaders];
			showColumnModal = false;
		} else {
			userActiveHeaders = [...userSelectedHeaders];
			showColumnModal = false;
		}
	};

	const mapInspectorData = (inspector: any, headers: string[]) => {
		const mappedData = headers.reduce(
			(acc, header) => {
				switch (header) {
					case 'Inspector Name':
						acc[header] = inspector.name ?? 'N/A';
						break;
					case 'Mobile Number':
						acc[header] = inspector.mobile ?? 'N/A';
						break;
					case 'Online':
						acc[header] = inspector.online ? '' : 'X';
						break;
					case 'Mon':
						acc[header] = inspector.Mon ?? 0;
						break;
					case 'Tue':
						acc[header] = inspector.Tue ?? 0;
						break;
					case 'Wed':
						acc[header] = inspector.Wed ?? 0;
						break;
					case 'Thu':
						acc[header] = inspector.Thu ?? 0;
						break;
					case 'Fri':
						acc[header] = inspector.Fri ?? 0;
						break;
					case 'Sat':
						acc[header] = inspector.Sat ?? 0;
						break;
					case 'Sun':
						acc[header] = inspector.Sun ?? 0;
						break;
					case 'Total Dispatch':
						acc[header] = inspector.totalDispatch ?? 0;
						break;
					case 'Total Completed':
						acc[header] = inspector.completed ?? 0;
						break;
					case 'Backlogs':
						acc[header] = inspector.backlogs ?? 0;
						break;
					case 'Email':
						acc[header] = inspector.email ?? 'N/A';
						break;
					case 'Region':
						acc[header] = inspector.region ?? 'N/A';
						break;
					default:
						acc[header] = 'N/A';
				}
				return acc;
			},
			{} as { [key: string]: any }
		);

		return mappedData;
	};

	const generatePDF = () => {
		const doc = new jsPDF({
			orientation: 'landscape',
			unit: 'pt',
			format: 'A4'
		});

		const headers = userActiveHeaders;
		const body = inspectors.map((inspector) =>
			headers.map((header) => mapInspectorData(inspector, headers)[header])
		);

		doc.setFontSize(18);
		doc.text('Inspectors Weekly Tasks', doc.internal.pageSize.width / 2, 25, {
			align: 'center'
		});

		autoTable(doc, {
			head: [headers],
			body,
			startY: 45,
			theme: 'grid',
			headStyles: {
				fillColor: [41, 128, 185],
				textColor: [255, 255, 255],
				fontSize: 10,
				halign: 'center'
			},
			bodyStyles: {
				fontSize: 8,
				halign: 'center'
			},
			columnStyles: {
				0: { cellWidth: 'auto' },
				1: { cellWidth: 'auto' }
			},
			styles: {
				overflow: 'linebreak',
				cellWidth: 'wrap'
			},
			margin: { top: 20 },
			didParseCell: function (data) {
				if (data.section === 'body' && data.column.index === 1) {
					data.cell.styles.cellWidth = 'auto';
				}
			},
			tableWidth: 'auto'
		});

		doc.save('inspectors_report.pdf');
	};

	const generateExcel = () => {
		const headers = userActiveHeaders;
		const body = inspectors.map((inspector) => mapInspectorData(inspector, headers));

		// Create worksheet
		const worksheet = XLSX.utils.json_to_sheet(body, { header: headers });
		// Adjust column widths
		const columnWidths = headers.map((header) => ({ wch: Math.max(header.length, 15) }));
		worksheet['!cols'] = columnWidths;

		// Create workbook and append the worksheet
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspectors Weekly Tasks');

		// Write the workbook to a file
		XLSX.writeFile(workbook, 'inspectors_report.xlsx');
	};

	onMount(() => {
		// Initialize week options
		updateWeekOptions();
		fetchInspectors();
	});

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
		'Backlogs',
		'Email',
		'Region'
	];

	const handleTableChange = async () => {
		if (selectedTable == 'tasks') {
			isLoading = true;
			const { data: taskData, error: taskError } = await supabase.rpc('get_task_data');
			initializeTaskFilteredData(taskData ?? []);
			isLoading = false;
		}
		if (selectedTable == 'regions') {
			isLoading = true;
			const { data: regionData, error: regionError } = await supabase.rpc('get_region_summary');
			initializeRegionFilteredData(regionData ?? []);
			isLoading = false;
		}
	};

	// Pagination
	$: if (inspectors.length > 0) {
		paginateInspectors();
	}

	let currentPage = 1;
	let itemsPerPage = 10;
	let paginatedInspectors: any[] = [];

	function paginateInspectors() {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedInspectors = inspectors.slice(startIndex, endIndex);
	}

	function handleNextPage() {
		if (currentPage * itemsPerPage < inspectors.length) {
			currentPage += 1;
			paginateInspectors();
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			currentPage -= 1;
			paginateInspectors();
		}
	}

	$: paginateInspectors();
</script>

<main class="relative h-full w-full overflow-y-auto">
	{#if showActivity && selectedUserId}
		<TaskTimeline userId={selectedUserId} on:back={goBack} />
	{:else}
		<div class="p-4">
			<Heading
				tag="h1"
				class="mb-7 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl"
			>
				Inspectors Weekly Tasks
			</Heading>

			<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
				{#if selectedTable === 'users'}
					<div class="flex items-center gap-6">
						<div class="flex items-center">
							<label for="monthSelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300"
								>Month:</label
							>
							<select
								id="monthSelect"
								on:change={handleMonthChange}
								bind:value={selectedMonth}
								class="w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
							>
								{#each monthOptions as month}
									<option value={month} selected={month === selectedMonth}>
										{new Date(0, month).toLocaleString('default', { month: 'long' })}
									</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center">
							<label for="daySelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300"
								>Day:</label
							>
							<select
								id="daySelect"
								on:change={handleDayChange}
								bind:value={selectedDay}
								class="w-18 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
							>
								{#each dayOptions as day}
									<option value={day} selected={day === selectedDay}>{day}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center">
							<label for="weekSelect" class="mr-2 text-sm text-gray-700 dark:text-gray-300"
								>Week:</label
							>
							<select
								id="weekSelect"
								on:change={handleWeekChange}
								bind:value={selectedWeek}
								class="w-28 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
							>
								{#each weekOptions as week}
									<option value={week} selected={week === selectedWeek}>Week {week}</option>
								{/each}
							</select>
						</div>
					</div>
				{/if}
				<!-- EXPANDER -->
				<div class="flex-1"></div>
				<div class="mb-4 flex items-center gap-2">
					<span class="text-right text-sm text-gray-700 dark:text-gray-300">Current:</span>
					<Select
						on:change={handleTableChange}
						bind:value={selectedTable}
						class="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-indigo-400"
						placeholder=""
					>
						<option value="users">User Task Summary</option>
						<option value="tasks">Task Summary</option>
						<option value="regions">Regions Summary</option>
					</Select>
				</div>
			</div>

			{#if selectedTable === 'users'}
				<div class="mb-4 flex justify-end space-x-4">
					<Button
						on:click={() => (showColumnModal = true)}
						color="blue"
						size="xs"
						class="flex items-center gap-2"
					>
						<FilePdfOutline /> Customize Columns
					</Button>
					<Button
						class="flex items-center gap-2 text-xs"
						color="red"
						size="xs"
						on:click={generatePDF}><FilePdfOutline /> Download PDF</Button
					>
					<Button
						class="flex items-center gap-2 text-xs"
						color="green"
						size="xs"
						on:click={generateExcel}><TableColumnOutline /> Download Excel</Button
					>
				</div>
			{/if}

			{#if dataError}
				<p class="text-red-500">{dataError}</p>
			{:else if isLoading}
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
					<img src="/images/pcic-spinner.gif" alt="Loading..." class="h-1/2 w-1/3" />
				</div>
			{:else if selectedTable === 'tasks'}
				<TaskTable />
			{:else if selectedTable === 'users'}
				<Table hoverable={true}>
					<TableHead class="border-b border-gray-300 bg-gray-50 dark:border-gray-700">
						{#each userActiveHeaders as header}
							<TableHeadCell
								class="whitespace-nowrap px-6 py-3 {header === 'Inspector Name' ||
								header === 'Mobile Number'
									? 'text-left'
									: 'text-center'} font-medium text-gray-700 dark:text-gray-300"
							>
								{header}
							</TableHeadCell>
						{/each}
					</TableHead>
					<TableBody>
						{#if paginatedInspectors.length > 0}
							{#each paginatedInspectors as inspector}
								<TableBodyRow
									on:click={() => handleRowClick(inspector.id)}
									class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									{#each userActiveHeaders as header}
										<TableBodyCell
											class="px-6 py-4 {header === 'Inspector Name' || header === 'Mobile Number'
												? 'text-left'
												: 'text-center'}"
										>
											{#if header === 'Online'}
												<span class="flex items-center justify-center">
													<span
														class={`h-3 w-3 rounded-full ${
															inspector.online ? 'bg-green-500' : 'bg-gray-500'
														} mr-2`}
													></span>
													<span
														class={`text-sm font-semibold ${
															inspector.online ? 'text-green-600' : 'text-gray-500'
														}`}
													>
														{inspector.online ? 'Online' : 'Offline'}
													</span>
												</span>
											{:else}
												{mapInspectorData(inspector, userActiveHeaders)[header]}
											{/if}
										</TableBodyCell>
									{/each}
								</TableBodyRow>
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell colspan={userActiveHeaders.length} class="text-center">
									No inspectors found.
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
			{:else if selectedTable === 'regions'}
				<RegionTable />
			{/if}
		</div>
	{/if}

	{#if selectedTable === 'users'}
		<div class="mx-4 mt-4 flex items-center justify-between">
			<Button color="blue" on:click={handlePreviousPage} disabled={currentPage === 1}>
				Previous
			</Button>
			<span>Page {currentPage} of {Math.ceil(inspectors.length / itemsPerPage)} </span>
			<Button
				color="blue"
				on:click={handleNextPage}
				disabled={currentPage * itemsPerPage >= inspectors.length}
			>
				Next
			</Button>
		</div>
	{/if}
</main>

<Modal bind:open={showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#if selectedTable == 'tasks'}
				{#each $taskAllHeaders as header}
					<Checkbox
						checked={$taskSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else if selectedTable == 'regions'}
				{#each $regionAllHeaders as header}
					<Checkbox
						checked={$regionSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{:else}
				{#each headers as header}
					<Checkbox
						checked={userSelectedHeaders.includes(header)}
						on:change={() => toggleHeader(header)}
					>
						{header}
					</Checkbox>
				{/each}
			{/if}
		</div>

		<div class="flex justify-end">
			<Button class="mt-4" size="xs" color="blue" on:click={updateColumns}>Update Columns</Button>
		</div>
	</div>
</Modal>
