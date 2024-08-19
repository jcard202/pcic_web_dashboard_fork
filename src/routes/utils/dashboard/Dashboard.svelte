<script lang="ts">
	import type { PageData } from '../../(sidebar)/$types';
	import { onMount } from 'svelte';
	import Transactions from './Transactions.svelte';

	export let data: PageData;
	console.log(data); // mar-note: for just a usage of the data variable

	let dark = false;

	function handler(ev: Event) {
		if ('detail' in ev) {
			dark = !!ev.detail;
		}
	}

	onMount(() => {
		document.addEventListener('dark', handler);
		return () => document.removeEventListener('dark', handler);
	});
</script>

<div class="mt-px space-y-4 ">
	<Transactions data={data} />
</div>
