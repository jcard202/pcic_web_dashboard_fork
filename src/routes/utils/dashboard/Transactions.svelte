<script lang="ts">
	// ---------------------------------------- IMPORTs ---------------------------------------------------- //

	import LastRange from '../widgets/LastRange.svelte';
	import {
		Button,
		Card,
		Checkbox,
		Dropdown,
		Heading,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import {
		CalendarMonthOutline,
		ChevronDownOutline,
		ChevronRightOutline
	} from 'flowbite-svelte-icons';
	import StatusBadge from './StatusBadge.svelte';

	import { goto } from '$app/navigation';

	// ---------------------------------------- EXPORTs ---------------------------------------------------- //

	export let dark: boolean = false;

	// ----------------------------------------- LOGIC ----------------------------------------------------- //

	const headers = [
		'Inspector Name',
		'Mobile Number',
		'Online',
		'Mon',
		'Tue',
		'Wed',
		'Thu',
		'Fri',
		'Sat',
		'Sun',
		'Total Dispatch',
		'Total Completed',
		'Backlogs'
	];

	/**
	 * mar-note:
	 * 		this are the sample data for the table that will later on will be map for the actual data in the supabase
	 * 		the first element in the array is the id that will be passed in the function handleRowClick which represents the id of the row
	 */
	const data: [
		string,
		string,
		string,
		boolean,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number,
		number
	][] = [
		['123', 'John Doe', '123-456-7890', true, 5, 4, 3, 4, 5, 2, 0, 23, 21, 2],
		['124', 'Jane Smith', '987-654-3210', false, 3, 3, 4, 2, 5, 5, 1, 23, 18, 5],
		['125', 'Alice Johnson', '555-123-4567', true, 4, 4, 4, 4, 3, 2, 1, 20, 19, 1],
		['126', 'Bob Brown', '444-567-8901', false, 2, 2, 3, 3, 4, 5, 2, 15, 10, 5],
		['127', 'Charlie Davis', '333-456-7890', true, 5, 5, 4, 4, 4, 3, 0, 30, 28, 2],
		['128', 'Diana Evans', '222-345-6789', true, 3, 3, 3, 3, 3, 3, 3, 25, 22, 3],
		['129', 'Evan Green', '111-234-5678', false, 1, 2, 2, 2, 3, 4, 5, 10, 5, 5],
		['130', 'Fiona Harris', '999-123-4567', true, 4, 4, 4, 5, 5, 5, 1, 35, 33, 2],
		['131', 'George Wilson', '888-567-8901', false, 3, 2, 2, 1, 4, 4, 3, 18, 15, 3],
		['132', 'Hannah Clark', '777-456-7890', true, 5, 5, 5, 5, 5, 5, 0, 40, 38, 2],
		['133', 'Ian King', '666-345-6789', false, 4, 4, 3, 2, 2, 1, 1, 22, 20, 2],
		['134', 'Judy Lee', '555-234-5678', true, 2, 3, 3, 4, 4, 3, 2, 28, 25, 3],
		['135', 'Kevin Young', '444-123-4567', true, 5, 4, 4, 3, 2, 2, 1, 27, 24, 3],
		['136', 'Laura Perez', '333-567-8901', false, 3, 3, 3, 2, 2, 2, 3, 21, 18, 3],
		['137', 'Mike Robinson', '222-456-7890', true, 4, 4, 4, 4, 4, 4, 0, 32, 30, 2],
		['138', 'Nina Scott', '111-345-6789', false, 1, 1, 1, 2, 3, 4, 5, 12, 7, 5],
		['139', 'Oscar Adams', '999-234-5678', true, 3, 3, 4, 4, 4, 5, 1, 29, 27, 2],
		['140', 'Paula Turner', '888-123-4567', true, 5, 5, 5, 5, 5, 5, 0, 45, 42, 3],
		['141', 'Quinn Edwards', '777-567-8901', false, 2, 2, 2, 2, 2, 2, 2, 17, 14, 3],
		['142', 'Rachel Foster', '666-456-7890', true, 4, 3, 3, 3, 4, 4, 3, 26, 23, 3],
		['143', 'Sam Gilbert', '555-345-6789', false, 5, 4, 3, 4, 4, 3, 2, 24, 22, 2],
		['144', 'Tina Hill', '444-234-5678', true, 3, 2, 2, 2, 3, 4, 4, 19, 17, 2],
		['145', 'Uma Knight', '333-123-4567', false, 4, 4, 4, 4, 4, 4, 4, 28, 25, 3],
		['146', 'Victor Lee', '222-567-8901', true, 5, 5, 5, 4, 4, 3, 1, 34, 32, 2],
		['147', 'Wendy Martin', '111-456-7890', false, 3, 3, 3, 3, 3, 3, 3, 23, 20, 3],
		['148', 'Xavier Nelson', '999-345-6789', true, 4, 3, 2, 3, 4, 5, 2, 31, 29, 2],
		['149', 'Yara Owens', '888-234-5678', false, 2, 2, 3, 3, 3, 3, 3, 20, 17, 3],
		['150', 'Zachary Perry', '777-123-4567', true, 5, 5, 4, 4, 5, 5, 0, 38, 36, 2]
	];

	/**
	 * mar-note
	 * 		@param index: string - the id of the row
	 * 		this function is used to handle the click event of the row.
	 * 		you can use this function to navigate to another page or to another section of the page
	 * 		by using the goto function from the $app/navigation.
	 *
	 * 		the usage for actual passing of the id is the commented one
	 * 		and the goto with # index is for testing only.
	 */
	function handleRowClick(index: string) {
		// goto(`/inspector/${index}`);
		goto(`#${index}`);
	}
</script>

<Card size="xl" class="max-w-none shadow-sm">
	<div class="items-center justify-between lg:flex">
		<div class="mb-4 mt-px lg:mb-0">
			<Heading tag="h3" class="-ml-0.25 mb-2 text-xl font-semibold dark:text-white">
				This Week's Tasks
			</Heading>
			<span class="text-base font-normal text-gray-500 dark:text-gray-400">
				This is a list of this week's tasks
			</span>
		</div>
		<div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0">
			<div class="flex items-center">
				<Button color="alternative" class="w-fit whitespace-nowrap px-4 py-2">
					Filter by status
					<ChevronDownOutline size="lg" />
				</Button>
				<Dropdown class="w-44 space-y-3 p-3 text-sm" placement="bottom-start">
					<li><Checkbox checked>For Dispatch (97)</Checkbox></li>
					<li><Checkbox class="accent-primary-600">In progress (56)</Checkbox></li>
					<li><Checkbox class="accent-primary-600">Completed (56)</Checkbox></li>
				</Dropdown>
			</div>
			<div class="flex items-center space-x-4">
				<Input placeholder="From" class="w-full">
					<CalendarMonthOutline slot="left" size="md" />
				</Input>
				<Input placeholder="To" class="w-full">
					<CalendarMonthOutline slot="left" size="md" />
				</Input>
			</div>
		</div>
	</div>
	<Table
		hoverable={true}
		noborder
		striped
		class="mt-6 min-w-full divide-y divide-gray-200 dark:divide-gray-600"
	>
		<TableHead class="bg-gray-50 dark:bg-gray-700">
			{#each headers as header}
				<TableHeadCell class="whitespace-nowrap p-4 font-normal">{header}</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each data as [id, name, mobile, online, mon, tue, wed, thu, fri, sat, sun, totalDispatch, totalCompleted, backlogs]}
				<TableBodyRow on:click={() => handleRowClick(id)} class="cursor-pointer">
					<TableBodyCell class="px-4 font-normal">{name}</TableBodyCell>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400">
						{mobile}
					</TableBodyCell>
					<TableBodyCell class="px-4">
						<StatusBadge state={online ? 'online' : 'offline'} {dark} />
					</TableBodyCell>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{mon}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{tue}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{wed}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{thu}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{fri}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{sat}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{sun}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{totalDispatch}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{totalCompleted}</TableBodyCell
					>
					<TableBodyCell class="px-4 font-normal text-gray-500 dark:text-gray-400"
						>{backlogs}</TableBodyCell
					>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
	<div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6">
		<LastRange />

		<a
			href="#top"
			class="inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700 sm:text-sm"
		>
			Tasks report <ChevronRightOutline size="lg" />
		</a>
	</div>
</Card>
