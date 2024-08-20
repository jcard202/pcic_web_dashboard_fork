<script>
	import Notifications from '../utils/dashboard/NotificationList.svelte';
	import AppsMenu from '../utils/widgets/AppsMenu.svelte';
	import UserMenu from '../utils/widgets/UserMenu.svelte';
	import {
		DarkMode,
		Dropdown,
		DropdownItem,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Navbar,
		Search
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import '../../app.pcss';

	export let fluid = true;
	export let drawerHidden = false;
	export let list = false;
	export let signOut;
	export let data;

	// Define the routes you want to display
	let routes = [
		{ name: 'Dashboard', icon: 'ChartPieOutline', href: '/dashboard' },
		{ name: 'Users', icon: 'UserSettingsSolid', href: '/crud/users' },
		{ name: 'Tasks', icon: 'FileWordSolid', href: '/crud/tasks' },
	];

	let searchQuery = '';
	let filteredRoutes = routes;

	function handleSearch(event) {
		searchQuery = event.target.value.toLowerCase();
		filteredRoutes = routes.filter((route) => route.name.toLowerCase().includes(searchQuery));
	}
</script>

<Navbar {fluid} class="text-black" color="default" let:NavContainer>
	<NavContainer class="mb-px mt-px px-1" {fluid}>
		<NavHamburger
			onClick={() => (drawerHidden = !drawerHidden)}
			class="m-0 me-3 md:block lg:hidden"
		/>
		<NavBrand href="/" class={list ? 'w-40' : 'lg:w-60'}>
			<img
				src="/images/Philippine_Crop_Insurance_Corporation_(PCIC).svg"
				class="me-2.5 h-6 sm:h-8"
				alt="PCIC Logo"
			/>
			<span
				class="ml-px self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl"
			>
				PCIC Portal
			</span>
		</NavBrand>
		<div class="relative hidden lg:block lg:ps-3">
			{#if list}
				<NavUl class="ml-2" activeUrl="/" activeClass="text-primary-600 dark:text-primary-500">
					<NavLi href="/">Home</NavLi>
					<NavLi href="#top">Messages</NavLi>
					<NavLi href="#top">Profile</NavLi>
					<NavLi href="#top">Settings</NavLi>
					<NavLi class="cursor-pointer">
						Dropdown
						<ChevronDownOutline class="ms-0 inline" />
					</NavLi>
					<Dropdown class="z-20 w-44">
						<DropdownItem href="#top">Item 1</DropdownItem>
						<DropdownItem href="#top">Item 2</DropdownItem>
						<DropdownItem href="#top">Item 3</DropdownItem>
					</Dropdown>
				</NavUl>
			{:else}
				<form>
					<Search size="md" class="mt-1 w-96 border focus:outline-none" on:input={handleSearch} />
					{#if searchQuery}
						<ul
							class="absolute mt-2 max-h-60 w-96 overflow-y-auto rounded border bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
						>
							{#each filteredRoutes as route}
								<li class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
									<a href={route.href} class="flex items-center space-x-2">
										<span>{route.name}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</form>
			{/if}
		</div>
		<div class="ms-auto flex items-center text-gray-500 dark:text-gray-400 sm:order-2">
			<DarkMode />
			<UserMenu {data} {signOut} />
		</div>
	</NavContainer>
</Navbar>
