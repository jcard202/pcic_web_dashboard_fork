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

<div class="mt-4 flex items-center justify-between rounded-b-lg bg-gray-800 py-3">
	<button
		class="text-md rounded-md px-5 py-2 font-medium {showPrevious
			? 'bg-gray-700 text-white'
			: 'bg-gray-700 text-gray-500'}"
		on:click={previous}
		disabled={!showPrevious}
	>
		Previous
	</button>

	<span class="text-gray-400">
		Page {currentPage} of {totalPages}
	</span>

	<button
		class="text-md rounded-md px-5 py-2 font-medium {showNext
			? 'bg-blue-600 text-white'
			: 'bg-gray-700 text-gray-500'}"
		on:click={next}
		disabled={!showNext}
	>
		Next
	</button>
</div>
