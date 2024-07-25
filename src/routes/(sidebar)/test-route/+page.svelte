<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	interface UserWithTaskCounts {
		id: string;
		role: string;
		email: string;
		photo_url: string;
		inspector_name: string;
		mobile_number: string | null;
		is_online: boolean;
		auth_user_id: string | null;
		created_at: string;
		updated_at: string;
		region_id: string | null;
		region_name: string | null;
		is_deleted: boolean;
		sync_status: string;
		last_synced_at: string | null;
		local_id: string;
		is_dirty: boolean;
		for_dispatch_count: number;
		ongoing_count: number;
		completed_count: number;
		total_tasks: number;
	}

	$: users = data.users as UserWithTaskCounts[];

	$: {
		console.log('Users data in component:', users);
	}

	let selectedColumns: Set<keyof UserWithTaskCounts> = new Set([
		'inspector_name',
		'region_name',
		'for_dispatch_count',
		'ongoing_count',
		'completed_count',
		'total_tasks'
	]);

	let tempSelectedColumns: Set<keyof UserWithTaskCounts>;

	const allColumns: (keyof UserWithTaskCounts)[] = [
		'inspector_name',
		'region_name',
		'for_dispatch_count',
		'ongoing_count',
		'completed_count',
		'total_tasks',
		'role',
		'email',
		'mobile_number',
		'is_online',
		'created_at',
		'updated_at',
		'sync_status'
	];

	let showModal = false;

	function openModal() {
		tempSelectedColumns = new Set(selectedColumns);
		showModal = true;
	}

	function toggleColumn(column: keyof UserWithTaskCounts) {
		if (tempSelectedColumns.has(column)) {
			tempSelectedColumns.delete(column);
		} else {
			tempSelectedColumns.add(column);
		}
		tempSelectedColumns = new Set(tempSelectedColumns); // trigger reactivity
	}

	function updateColumns() {
		selectedColumns = new Set(tempSelectedColumns);
		showModal = false;
	}

	function cancelUpdate() {
		showModal = false;
	}

	function getDisplayValue(user: UserWithTaskCounts, column: keyof UserWithTaskCounts): string {
		const value = user[column];
		if (typeof value === 'number') {
			return value.toString();
		}
		return value?.toString() || 'N/A';
	}
</script>

<h1>User Task Summary</h1>

<button on:click={openModal}>Choose Columns</button>

{#if showModal}
	<div class="modal">
		<div class="modal-content">
			<h2>Select Columns</h2>
			{#each allColumns as column}
				<label>
					<input
						type="checkbox"
						checked={tempSelectedColumns.has(column)}
						on:change={() => toggleColumn(column)}
					/>
					{column}
				</label>
			{/each}
			<div class="button-group">
				<button on:click={updateColumns}>Update</button>
				<button on:click={cancelUpdate}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<table>
	<thead>
		<tr>
			{#each allColumns as column}
				{#if selectedColumns.has(column)}
					<th>{column}</th>
				{/if}
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each users as user (user.id)}
			<tr>
				{#each allColumns as column}
					{#if selectedColumns.has(column)}
						<td>{getDisplayValue(user, column)}</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/* ... styles remain the same ... */
</style>
