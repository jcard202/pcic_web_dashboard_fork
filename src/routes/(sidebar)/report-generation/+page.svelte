<script lang="ts">
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import * as XLSX from 'xlsx';

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
		TableHeadCell
	} from 'flowbite-svelte';
	import {
		CirclePlusOutline,
		CloseOutline,
		FilterOutline,
		PlusOutline,
		SortOutline
	} from 'flowbite-svelte-icons';
	import { fade, slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;

	let activeHeaders: string[] = [...data.defaultHeaders];
	let selectedHeaders: string[] = [...data.defaultHeaders];
	let showColumnModal = false;
	let showFilter = false;
	let addFilter = false;
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

	function generatePDF() {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [activeHeaders],
			body: data.users.map((user) => activeHeaders.map((header) => user[header] ?? 'N/A'))
		});
		doc.save('weekly_report.pdf');
	}

	function generateExcel() {
		const ws = XLSX.utils.json_to_sheet(
			data.users.map((user) => {
				const row: { [key: string]: string | number | boolean | null } = {};
				activeHeaders.forEach((header) => {
					row[header] = user[header] ?? 'N/A';
				});
				return row;
			})
		);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'weekly_report.xlsx');
	}

	let selectedHeader = '';
	let selectedOperator = '';

	let operators = [
		{ value: '==', name: 'is equal to' },
		{ value: '!=', name: 'is not equal to' },
		{ value: '>', name: 'is greater than' },
		{ value: '<', name: 'is less than' },
		{ value: '>=', name: 'is greater than or equal to' },
		{ value: '<=', name: 'is less than or equal to' },
		{ value: 'contains', name: 'contains' }
	];
</script>

<!-- <Table>
	<TableHead>
		{#each activeHeaders as header}
			<th transition:slide={{ axis: 'x', duration: 600, delay: 100 }}>
				<TableHeadCell>
					{header}
				</TableHeadCell>
			</th>
		{/each}
	</TableHead>

	<TableBody tableBodyClass="divide-y">
		{#each data.users as user}
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
</Table>

 -->

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
			<div class="my-2 flex justify-between px-4 py-1">
				<div class="flex items-center gap-2">
					<div class="relative">
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
									<!-- content here -->
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
										<!-- <div class=""></div> -->
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
					</div>

					<Button
						class="flex items-center gap-2 border-none text-xs"
						on:click={() => (showColumnModal = true)}
						color="light"
						size="xs"><SortOutline /> Sort</Button
					>
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
					<Button class="text-xs" on:click={generatePDF} color="light" size="xs"
						>Download PDF</Button
					>
					<Button class="text-xs" on:click={generateExcel} color="light" size="xs"
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
								{header}
							</TableHeadCell>
						</th>
					{/each}
				</TableHead>
				<TableBody tableBodyClass="divide-y">
					{#each data.users as user}
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
			</Table>
		</Card>
	</div>
</main>

<Modal bind:open={showColumnModal} size="lg" autoclose={false}>
	<div class="py-4">
		<h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

		<div class="grid grid-cols-3 gap-2">
			{#each data.allHeaders as header}
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
