<script lang="ts">
	import { Label, Input, DarkMode } from 'flowbite-svelte';
	import SignIn from '../utils/authentication/SignIn.svelte';
	import MetaTag from '../utils/MetaTag.svelte';
	import Toast from '../utils/widgets/Toast.svelte';
	import { goto } from '$app/navigation';
	let title = 'Sign in to Platform';
	let site = {
		name: 'PCIC Portal	',
		img: '/images/Philippine_Crop_Insurance_Corporation_(PCIC).svg',
		link: '/',
		imgAlt: 'PCIC Logo'
	};
	let rememberMe = true;
	let lostPassword = true;
	let createAccount = true;
	let lostPasswordLink = 'forgot-password';
	let loginTitle = 'Login to your account';
	let registerLink = 'sign-up';
	let createAccountTitle = 'Create account';

	const path: string = '/authentication/sign-in';
	const description: string = 'Sign in example - PCIC Web Dashboard';
	const metaTitle: string = 'PCIC Web Dashboard - Sign in';
	const subtitle: string = 'Sign in';

	let toastProps: { show: boolean; message: string; type: 'success' | 'error' } = {
		show: false,
		message: '',
		type: 'success'
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();
		try {
			const formData = new FormData(event.target as HTMLFormElement);
			const email = formData.get('email') as string;
			const password = formData.get('password') as string;

			const params = new URLSearchParams();
			params.append('email', email);
			params.append('password', password);

			const response = await fetch('?/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: params.toString()
			});
			if (!response.ok) {
				throw new Error('Failed to sign in');
			}
			const data = JSON.parse(JSON.parse((await response.json()).data)[0]);
			console.log(data);
			showToast(data.message, data.success ? 'success' : 'error');
			if (data.success) {
				setTimeout(() => {
					goto('/dashboard');
				}, 1500);
			}
		} catch (error) {
			console.error('Error signing in:', error);
		}
	};

	const showToast = (message: string, type: 'success' | 'error') => {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	};
</script>

<MetaTag {path} {description} title={metaTitle} {subtitle} />

<div class="relative min-h-screen">
	<div class="absolute right-4 top-4 z-10">
		<DarkMode
			class="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
		/>
	</div>

	<SignIn
		{title}
		{site}
		{rememberMe}
		{lostPassword}
		{createAccount}
		{lostPasswordLink}
		{loginTitle}
		{registerLink}
		{createAccountTitle}
		{handleSubmit}
	>
		<div>
			<Label for="email" class="mb-2 dark:text-white">Your email</Label>
			<Input
				type="email"
				name="email"
				id="email"
				placeholder="name@company.com"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>
		<div>
			<Label for="password" class="mb-2 dark:text-white">Your password</Label>
			<Input
				type="password"
				name="password"
				id="password"
				placeholder="••••••••"
				required
				class="border outline-none dark:border-gray-600 dark:bg-gray-700"
			/>
		</div>
	</SignIn>
</div>

<Toast {...toastProps} />
