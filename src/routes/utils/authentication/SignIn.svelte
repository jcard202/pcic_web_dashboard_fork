<script lang="ts">
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
		<!-- Card -->
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
				<!--
				Mar: Commented for now, because it is not needed. 
				{#if createAccount}
					<div class="text-sm font-medium text-gray-500 dark:text-gray-400">
						Not registered? <A href={registerLink}>{createAccountTitle}</A>
					</div>
				{/if}
				 -->
			</form>
		</Card>
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
