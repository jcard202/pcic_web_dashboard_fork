<script>
	import { Heading } from 'flowbite-svelte';
</script>

<div class="mb-4 mt-px px-4 lg:mb-0">
	<Heading tag="h3" class="mb-2  text-xl font-semibold dark:text-white">
		<slot name="headingContent" />
	</Heading>
	<span class=" text-base font-normal text-gray-500 dark:text-gray-400">
		<slot name="headingDescription" />
	</span>
</div>
