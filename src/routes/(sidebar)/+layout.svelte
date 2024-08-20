<script>
	import '../../app.pcss';
	import Navbar from './Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	import { goto } from '$app/navigation';
	let drawerHidden = false;

	export let data;

	$: ({ supabase } = data);

	const signOut = async () => {
		try {
			await supabase.auth.signOut();
		} catch (e) {
			console.log(e);
			return;
		}
		goto('/authentication/sign-in');
	};
</script>

<header
	class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
>
	<Navbar {data} {signOut} bind:drawerHidden />
</header>
<div class="overflow-hidden lg:flex">
	<Sidebar bind:drawerHidden />
	<div class="relative h-[100vh] w-full overflow-y-scroll pt-[70px] lg:ml-64">
		<slot />
	</div>
</div>
