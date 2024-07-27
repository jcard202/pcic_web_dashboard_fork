<script lang="ts">
	import { Avatar, Card } from 'flowbite-svelte';
	import { EnvelopeOutline, MobilePhoneOutline } from 'flowbite-svelte-icons';
	import type { PageData } from './$types';

	export let data: PageData;

	// Treat the fetched data as a promise for demonstration
	const { userProfileData } = data;
</script>

<main class="p-4">
	<div class="mt-px space-y-4">
		<Card size="xl" class="max-w-full shadow-sm ">
			<div class="flex flex-col items-center justify-center gap-4">
				{#if userProfileData.photo_url}
					<Avatar
						dot={{
							placement: 'top-right',
							color: `${userProfileData.is_online ? 'green' : 'red'}`
						}}
						size="xl"
						class="ring-green-400 dark:ring-green-400"
						src={userProfileData.photo_url}
					/>
				{:else}
					<Avatar>{userProfileData.inspector_name}</Avatar>
				{/if}
				<div class="flex flex-col gap-2 text-center">
					<p class=" text-3xl font-bold text-green-500">{userProfileData.inspector_name}</p>
					<p class="text-xs font-bold">{userProfileData.role}</p>
				</div>
				<!-- Footer -->

				<div class="flex items-center">
					<!-- <div class="flex items-center gap-1">
						<MapPinAltOutline size="md" />
						<span class="text-md font-medium">{userProfileData.regional_id}</span>
					</div>
					<div class="flex items-center gap-1">
						<EnvelopeOutline size="md" />
						<span class="text-md font-medium">Joined on {userProfileData.created_at}</span>
					</div> -->
				</div>
				<!-- Footer -->
			</div>
		</Card>
		<div class="">
			<!-- Contact information here -->
			<Card title="Social accounts">
				<div class="flex flex-col gap-4">
					<h2 class="border-b border-gray-400 py-2 text-lg font-medium dark:border-gray-400">
						Contact Information
					</h2>
					<div class="flex items-center gap-1">
						<EnvelopeOutline size="md" />
						<span class="text-md font-medium">Email: {userProfileData.email}</span>
					</div>
					{#if userProfileData.mobile_number}
						<!-- content here -->
						<div class="flex items-center gap-1">
							<MobilePhoneOutline size="md" />
							<span class="text-md font-medium">Mobile Number: {userProfileData.mobile_number}</span
							>
						</div>
					{/if}
				</div>
			</Card>
		</div>
	</div>
</main>
