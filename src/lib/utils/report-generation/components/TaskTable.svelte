<script lang="ts">
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { fade, slide } from 'svelte/transition';
	import {
		currentPage,
		paginatedTasks,
		taskActiveHeaders,
		taskSelectedHeaders, // Import this to update when a column is removed
		taskSortCriteria,
		totalPages
	} from '../taskStore';

	let draggingIndex = -1;
	let draggingHeader = '';
	let dragging = false;
	let dropdownOpenIndex: number | null = null;

	const handleDragStart = (event: DragEvent, header: string, index: number) => {
		const dataTransfer = event.dataTransfer;
		if (dataTransfer) {
			draggingIndex = index;
			draggingHeader = header;
			dragging = true;
			dataTransfer.effectAllowed = 'move';
			dataTransfer.setData('text/plain', header);
			document.body.style.cursor = 'grabbing';
		}
	};

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
	};

	const handleDrop = (event: DragEvent, index: number) => {
		event.preventDefault();
		if (draggingIndex !== index) {
			const headers = [...$taskActiveHeaders];
			headers.splice(draggingIndex, 1);
			headers.splice(index, 0, draggingHeader);
			taskActiveHeaders.set(headers);
		}
		resetDragState();
	};

	const handleDragEnd = () => {
		resetDragState();
	};

	const resetDragState = () => {
		dragging = false;
		draggingIndex = -1;
		draggingHeader = '';
		document.body.style.cursor = 'auto';
	};

	const removeColumn = (index: number) => {
		const headers = [...$taskActiveHeaders];
		const removedHeader = headers[index];
		headers.splice(index, 1);
		taskActiveHeaders.set(headers);
		dropdownOpenIndex = null; // Close the dropdown after removing a column

		// Update the taskSelectedHeaders store
		const selectedHeaders = [...$taskSelectedHeaders];
		const headerIndex = selectedHeaders.indexOf(removedHeader);
		if (headerIndex > -1) {
			selectedHeaders.splice(headerIndex, 1);
			taskSelectedHeaders.set(selectedHeaders);
		}
	};

	const toggleDropdown = (index: number) => {
		dropdownOpenIndex = dropdownOpenIndex === index ? null : index;
	};
</script>



<Table
	hoverable={true}
	noborder
	class="z-0 mt-6 min-w-full divide-y divide-gray-200 py-4 dark:divide-gray-600"
>
	<TableHead class="bg-gray-50 dark:bg-gray-700">
		{#each $taskActiveHeaders as header, index}
			<th
				draggable="true"
				on:dragstart={(event) => handleDragStart(event, header, index)}
				on:dragover={handleDragOver}
				on:drop={(event) => handleDrop(event, index)}
				on:dragend={handleDragEnd}
				class="group relative cursor-grab transition duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600"
				transition:slide={{ axis: 'x', duration: 600, delay: 100 }}
			>
				<div class="flex items-center justify-between px-2">
					<TableHeadCell class="whitespace-nowrap p-4 font-normal">
						<div class="flex items-center justify-between">
							<span class="text-xs font-bold group-hover:text-green-500">{header}</span>
							{#if $taskSortCriteria.some((criteria) => criteria.column === header)}
								{#if $taskSortCriteria.find((criteria) => criteria.column === header)?.ascending}
									<ChevronUpOutline class="ml-1 size-6 text-green-500" />
								{:else}
									<ChevronDownOutline class="ml-1 size-6 text-orange-500" />
								{/if}
							{/if}
						</div>
					</TableHeadCell>
					<div class="relative">
						<button on:click={() => toggleDropdown(index)}>
							<ChevronDownOutline class="ml-2 cursor-pointer text-gray-400" />
						</button>

						{#if dropdownOpenIndex === index}
							<div
								transition:slide={{ axis: 'y', duration: 300 }}
								class="absolute right-0 top-10 z-50 min-w-36 rounded border border-white bg-gray-800 px-2 py-1"
							>
								<button
									on:click={() => removeColumn(index)}
									class="flex items-center gap-2 text-xs font-normal text-white"
								>
									<TrashBinOutline class="size-4" color="red" /> Remove column
								</button>
							</div>
						{/if}
					</div>
				</div>
			</th>
		{/each}
	</TableHead>
	<TableBody tableBodyClass="divide-y">
		{#each $paginatedTasks as task (task.id)}
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

<div class="mt-4 flex justify-between">
	<Button
		color="green"
		on:click={() => ($currentPage = Math.max(1, $currentPage - 1))}
		disabled={$currentPage === 1}
	>
		Previous
	</Button>
	<span>Page {$currentPage} of {$totalPages}</span>
	<Button
		color="green"
		on:click={() => ($currentPage = Math.min($totalPages, $currentPage + 1))}
		disabled={$currentPage === $totalPages}
	>
		Next
	</Button>
</div>
