<script lang="ts">
	import { onMount } from 'svelte';
	import { imagesPath } from '../../utils/variables';
	import { Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from 'flowbite-svelte';

	export let name: string = ''; // "Neil Sims",
	export let avatar: string = ''; // "neil-sims.png",
	export let email: string = ''; // "neil.sims@flowbite.com",
	export let signOut: any;
	export let data;
	$: ({ supabase } = data);

	onMount(async () => {
		const userId = (await supabase.auth.getUser()).data.user.id;
		console.log(userId);
		const { data, error } = await supabase
			.from('users')
			.select(
				`
                    *
                `
			)
			.eq('auth_user_id', userId)
			.single();
		if (error) {
			console.log(error);
			return;
		}
		name = data.inspector_name;
		email = data.email;
		avatar = data.photo_url;
	});
</script>

<button class="ms-3 rounded-full ring-gray-400 focus:ring-4 dark:ring-gray-600">
	<Avatar size="sm" src={avatar} tabindex="0" />
</button>
<Dropdown placement="bottom-end">
	<DropdownHeader>
		<!-- <span class="block text-sm">{name}</span> -->
		<span class="block truncate text-sm font-medium">{email}</span>
	</DropdownHeader>
	<!-- <DropdownItem>Dashboard</DropdownItem> -->
	<!-- <DropdownItem>Settings</DropdownItem> -->
	<!-- <DropdownItem>Earnings</DropdownItem> -->
	<!-- <DropdownDivider /> -->
	<DropdownItem on:click={signOut}>Sign out</DropdownItem>
</Dropdown>

<!--
@component
[Go to docs](https://pcic_web_application.vercel.app/)
## Props
@prop export let id: number = 0;
@prop export let name: string = '';
@prop export let avatar: string = '';
@prop export let email: string = '';
@prop export let biography: string = '';
@prop export let position: string = '';
@prop export let country: string = '';
@prop export let status: string = '';
-->
