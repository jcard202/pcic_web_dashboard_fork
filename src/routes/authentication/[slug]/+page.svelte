<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	export let form;

</script>

<svelte:component this={data.content} form={form} />
