<script lang="ts">
	export let currentPage: number;
	export let totalPages: number;

	$: showPrevious = currentPage > 1;
	$: showNext = currentPage < totalPages;

	function previous() {
		if (showPrevious) {
			currentPage--;
		}
	}

	function next() {
		if (showNext) {
			currentPage++;
		}
	}
</script>

<div class="mx-4 mt-4 flex items-center justify-between">
	<button
		class="rounded-md px-5 py-2 text-sm font-medium {showPrevious
			? 'bg-blue-600 text-white'
			: 'bg-blue-600 text-white opacity-50'}"
		on:click={previous}
		disabled={!showPrevious}
	>
		Previous
	</button>

	<span class="text-gray-400">
		Page {currentPage} of {totalPages}
	</span>

	<button
		class="rounded-md px-5 py-2 text-sm font-medium {showNext
			? 'bg-blue-600 text-white'
			: 'bg-blue-600 text-white opacity-50'}"
		on:click={next}
		disabled={!showNext}
	>
		Next
	</button>
</div>
