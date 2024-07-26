<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons';
	import { fade, slide } from 'svelte/transition';
	import { regionActiveHeaders, regionSortCriteria } from '../regionStore';
	export let sortedRegions;
</script>

<Table
	hoverable={true}
	noborder
	class="z-0 mt-6 min-w-full divide-y divide-gray-200 py-4 dark:divide-gray-600"
>
	<TableHead class="bg-gray-50 dark:bg-gray-700">
		{#each $regionActiveHeaders as header}
			<th transition:slide={{ axis: 'x', duration: 600, delay: 100 }}>
				<TableHeadCell class="whitespace-nowrap p-4 font-normal">
					<div class="flex items-center justify-between">
						<span>{header}</span>
						{#if $regionSortCriteria.some((criteria) => criteria.column === header)}
							{#if $regionSortCriteria.find((criteria) => criteria.column === header)?.ascending}
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
		{#each sortedRegions as region (region['Region ID'])}
			<TableBodyRow class="font-normal">
				{#each $regionActiveHeaders as header}
					<td transition:fade={{ duration: 600, delay: 100 }}>
						<TableBodyCell>
							{region[header] ?? 'N/A'}
						</TableBodyCell>
					</td>
				{/each}
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>
