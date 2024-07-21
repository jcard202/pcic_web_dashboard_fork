<script lang="ts">
	import jsPDF from 'jspdf';
	import autoTable from 'jspdf-autotable';
	import type { PageData } from './$types';

	export let data: PageData;

	const { users } = data;

	function generatePDF() {
		const doc = new jsPDF();

		autoTable(doc, {
			head: [
				[
					'Inspector Name',
					'Mobile Number',
					'Total Dispatch',
					'Total Ongoing',
					'Total Completed',
					'Backlogs'
				]
			],
			body: users.map((user) => [
				user.inspector_name,
				user.mobile_number || 'N/A',
				user.total_dispatch,
				user.total_ongoing,
				user.total_completed,
				'N/A'
			])
		});

		doc.save('Standard_Report.pdf');
	}
</script>

<section aria-label="Inspector Information">
	<h2>Inspector Information</h2>
	<button on:click={generatePDF}>Generate PDF</button>
	<div class="table-responsive">
		<table class="inspector-table">
			<caption>List of inspectors and their performance metrics</caption>
			<thead>
				<tr>
					<th scope="col">Inspector Name</th>
					<th scope="col">Mobile Number</th>
					<th scope="col">Total Dispatch</th>
					<th scope="col">Total Ongoing</th>
					<th scope="col">Total Completed</th>
					<th scope="col">Backlogs</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr>
						<th scope="row">{user.inspector_name}</th>
						<td>{user.mobile_number || 'N/A'}</td>

						<td>{user.total_dispatch}</td>
						<td>{user.total_ongoing}</td>
						<td>{user.total_completed}</td>
						<td>0</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6">No users found</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<form method="POST">
	<button class="logout-button" type="submit">Logout</button>
</form>
