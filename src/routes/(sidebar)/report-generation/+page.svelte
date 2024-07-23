<script lang="ts">
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import * as XLSX from 'xlsx';

	import saveAs from 'file-saver';
	import {
		Button,
		Checkbox,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { fade, slide } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;

	let activeHeaders: string[] = [...data.defaultHeaders];
	let selectedHeaders: string[] = [...data.defaultHeaders];
	let showColumnModal = false;

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
		doc.save('table_data.pdf');
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
		saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'table_data.xlsx');
	}
</script>

<Table>
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
			<TableBodyRow>
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

<div class="flex justify-center py-2">
	<Button on:click={() => (showColumnModal = true)} color="light" size="xs">
		Customize Columns
	</Button>
</div>

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

<div class="flex justify-center space-x-2 py-2">
	<Button on:click={() => (showColumnModal = true)} color="light" size="xs">
		Customize Columns
	</Button>
	<Button on:click={generatePDF} color="light" size="xs">Download PDF</Button>
	<Button on:click={generateExcel} color="light" size="xs">Download Excel</Button>
</div>
<!-- <Table class="border border-white">
	<TableHead>
		{#each activeHeaders as header}
		<TableHeadCell>
			{header}
			</TableHeadCell>
			{/each}
			</TableHead>
			
			<TableBody tableBodyClass="divide-y">
				{#each activeHeaders as header}
				<TableBodyRow>
					
				{#each activeHeaders as header}
				<TableBodyCell>
					
				{header}
				</TableBodyCell>
				{/each}
				</TableBodyRow>
				{/each}
				</TableBody>
				</Table>
				<div class="flex justify-center border border-white py-2">
					<Button on:click={() => (showColumnModal = true)} color="light" size="xs">
						Customize Columns
						</Button>
						</div>
						
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
		// function generatePDF() {
		// 	const doc = new jsPDF();
		
		// 	autoTable(doc, {
		// 		head: [
		// 			[
		// 				'Inspector Name',
		// 				'Mobile Number',
		// 				'Total Dispatch',
		// 				'Total Ongoing',
		// 				'Total Completed',
		// 				'Backlogs'
		// 			]
		// 		],
		// 		body: users.map((user) => [
		// 			user.inspector_name,
		// 			user.mobile_number || 'N/A',
		// 			user.total_dispatch,
		// 			user.total_ongoing,
		// 			user.total_completed,
		// 			'N/A'
		// 		])
		// 	});
		
		// 	doc.save('Standard_Report.pdf');
		// }
	
</Modal> -->
