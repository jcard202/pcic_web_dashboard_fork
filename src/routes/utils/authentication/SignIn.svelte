<!-- <script lang="ts">
	import { A, Button, Card, Checkbox } from 'flowbite-svelte';
	export let title = 'Sign in to platform';
	export let site = {
		name: 'PCIC Portal',
		img: '/images/Philippine_Crop_Insurance_Corporation_(PCIC).svg',
		link: '/',
		imgAlt: 'PCIC Logo'
	};
	export let rememberMe = true;
	export let lostPassword = true;
	export let createAccount = true;
	export let lostPasswordLink = '';
	export let loginTitle = 'Login to your account';
	export let registerLink = '';
	export let createAccountTitle = 'Create account';

	export let mainClass = 'bg-gray-50 dark:bg-gray-900 w-full';
	export let mainDivClass =
		'flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900';
	export let siteLinkClass =
		'flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white';
	export let siteImgClass = 'mr-4 h-11';
	export let cardH1Class = 'text-2xl font-bold text-gray-900 dark:text-white';

	export let handleSubmit: any = null;
</script>

<main class={mainClass}>
	<div class={mainDivClass}>
		<a href={site.link} class={siteLinkClass}>
			<img src={site.img} class={siteImgClass} alt={site.imgAlt} />
			<span>{site.name}</span>
		</a>
		<Card class="w-full" size="md" border={false}>
			<h1 class={cardH1Class}>
				{title}
			</h1>
			<form method="POST" class="mt-8 space-y-6" on:submit={handleSubmit}>
				<slot />
				{#if rememberMe || lostPassword}
					<div class="flex items-start">
						{#if rememberMe}
							<Checkbox class="accent-primary-600" name="remember">Remember me</Checkbox>
						{/if}
						{#if lostPassword}
							<A href={lostPasswordLink} aClass="ml-auto text-sm">Lost Password?</A>
						{/if}
					</div>
				{/if}
				<Button type="submit" size="lg">{loginTitle}</Button>
				{#if createAccount}
					<div class="text-sm font-medium text-gray-500 dark:text-gray-400">
						<A href={registerLink}>{createAccountTitle}</A>
					</div>
				{/if}
			</form>
		</Card>
	</div>
</main> -->

<script lang="ts">
	import { A, Button, Card } from 'flowbite-svelte';
	export let title = 'Sign in to platform';
	export let site = {
		name: 'PCIC Portal',
		img: '/images/Philippine_Crop_Insurance_Corporation_(PCIC).svg',
		link: '/',
		imgAlt: 'PCIC Logo'
	};
	export let loginTitle = 'Login to your account';
	export let handleSubmit: any = null;
</script>

<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4 dark:from-gray-900 dark:to-gray-800"
>
	<div class="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
		<div class="flex flex-col md:flex-row">
			<div class="flex w-full flex-col items-center justify-center bg-green-600 p-8 md:w-1/2">
				<a href={site.link} class="mb-8 flex items-center justify-center">
					<img src={site.img} class="mr-3 h-16" alt={site.imgAlt} />
				</a>
				<h2 class="text-center text-3xl font-bold text-white">{site.name}</h2>
			</div>
			<div class="w-full p-8 md:w-1/2">
				<h1 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
					{title}
				</h1>
				<form method="POST" class="space-y-6" on:submit={handleSubmit}>
					<slot />
					<Button
						type="submit"
						class="w-full rounded-md bg-green-600 px-4 py-3 font-bold text-white transition duration-300 ease-in-out hover:bg-green-700"
						>{loginTitle}</Button
					>
				</form>
			</div>
		</div>
	</div>
</main>

<!--
@component
[Go to docs](https://pcic_web_application.vercel.app/)
## Props
@prop export let title = 'Sign in to platform';
@prop export let site = {
		name: 'Flowbite',
		img: '/images/Philippine_Crop_Insurance_Corporation_(PCIC).svg',
		link: '/',
		imgAlt: 'PCIC Logo'
	};
@prop export let rememberMe = true;
@prop export let lostPassword = true;
@prop export let createAccount = true;
@prop export let lostPasswordLink = '';
@prop export let loginTitle = 'Login to your account';
@prop export let registerLink = '';
@prop export let createAccountTitle = 'Create account';
@prop export let mainClass = 'bg-gray-50 dark:bg-gray-900 w-full';
@prop export let mainDivClass =
		'flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900';
@prop export let siteLinkClass =
		'flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white';
@prop export let siteImgClass = 'mr-4 h-11';
@prop export let cardH1Class = 'text-2xl font-bold text-gray-900 dark:text-white';
-->
