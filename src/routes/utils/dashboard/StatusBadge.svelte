<script lang="ts">
	import { Badge } from 'flowbite-svelte';
	import type { BadgeProps } from 'flowbite-svelte/Badge.svelte';

	export let state: keyof typeof states;
	export let dark: boolean = false;

	const states = {
		completed: 'Completed',
		cancelled: 'Canceled',
		fordispatch: 'For Dispatch',
		inprogress: 'In progress',
		online: 'Online',
		offline: 'Offline'
	};

	const colors: Record<string, BadgeProps['color']> = {
		completed: 'green',
		cancelled: 'red',
		fordispatch: 'yellow',
		inprogress: 'purple',
		online: 'green',
		offline: 'yellow'
	};
</script>

<Badge color={colors[state] ?? 'dark'} border={dark}>{states[state] ?? 'Unknown'}</Badge>
