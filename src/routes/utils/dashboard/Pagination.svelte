<!-- 
 mar-note: this is the Pagination component that is used in the .svelte files that are in the src/routes/utils/dashboard folder
  -->

<script lang="ts">
	import { Pagination } from 'flowbite-svelte';
	import { ArrowLeftOutline, ArrowRightOutline } from 'flowbite-svelte-icons';

	export let currentPage: number;
	export let totalPages: number;
	export let pageSize: number;
	export let totalItems: number;

	$: startItem = (currentPage - 1) * pageSize + 1;
	$: endItem = Math.min(currentPage * pageSize, totalItems);

	function previous() {
		if (currentPage > 1) {
			currentPage--;
		}
	}

	function next() {
		if (currentPage < totalPages) {
			currentPage++;
		}
	}
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<div class="text-sm text-gray-700 dark:text-gray-400">
		Showing <span class="font-semibold text-gray-900 dark:text-white">{startItem}</span>
		to
		<span class="font-semibold text-gray-900 dark:text-white">{endItem}</span>
		of
		<span class="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
		Entries
	</div>
	<Pagination table>
		<button
			slot="prev"
			class="flex items-center gap-2 text-white"
			on:click={previous}
			type="button"
			aria-label="Previous"
		>
			<ArrowLeftOutline class="me-2 h-3.5 w-3.5" />
			Prev
		</button>
		<button
			slot="next"
			class="flex items-center gap-2 text-white"
			on:click={next}
			type="button"
			aria-label="Next"
		>
			Next
			<ArrowRightOutline class="ms-2 h-6 w-6" />
		</button>
	</Pagination>
</div>
