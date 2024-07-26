<script>
	import { Card } from 'flowbite-svelte';
	import ButtonContainer from './ButtonContainer.svelte';
	import HeaderContainer from './HeaderContainer.svelte';
	import HeaderTwoContainer from './HeaderTwoContainer.svelte';

	const I = {
		HeaderContainer,
		HeaderTwoContainer,
		ButtonContainer
	};
</script>

<main class="p-4">
	<div class="mt-px space-y-4">
		<Card size="xl" class="max-w-full shadow-sm ">
			<slot {...I} />
		</Card>
	</div>
</main>
