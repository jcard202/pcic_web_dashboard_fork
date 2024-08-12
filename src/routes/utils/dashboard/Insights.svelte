<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase_content } from '../../../supabase';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
  
	let taskId: string;
  
	$: taskId = $page.params.taskId; // Get taskId from the route parameter
  
	let userLogs: any[] = [];
	let isLoading = true;
	let dataError: string | null = null;
  
	async function fetchUserLogs() {
	  try {
		const { data, error } = await supabase_content
		  .from('user_logs')
		  .select('timestamp, activity, last_synced_at, sync_status')
		  .eq('task_id', taskId)
		  .order('timestamp', { ascending: true });
  
		if (error) {
		  dataError = error.message;
		  console.error('Error fetching user logs:', error);
		  isLoading = false;
		  return;
		}
  
		userLogs = data.map(log => {
		  const timeSpent = new Date(log.timestamp).getTime() - new Date(log.last_synced_at).getTime();
		  const timeSpentInMinutes = Math.round(timeSpent / 60000);
		  const timeSpentDisplay = timeSpentInMinutes > 0 
			? `${timeSpentInMinutes} minutes` 
			: `${Math.round(timeSpent / 1000)} seconds`;
  
		  return {
			...log,
			timeSpentDisplay,
		  };
		});
  
		isLoading = false;
	  } catch (error) {
		dataError = (error as Error).message;
		console.error('Error:', error);
		isLoading = false;
	  }
	}
  
	onMount(() => {
	  fetchUserLogs();
	});
  
	function goBackToTasks() {
	  goto('/tasks');
	}
  </script>
  
  <div class="p-4">
	<button on:click={goBackToTasks} class="mb-4">Back to Tasks</button>
  
	{#if dataError}
	  <p class="text-red-500">{dataError}</p>
	{:else if isLoading}
	  <p>Loading...</p>
	{:else if userLogs.length === 0}
	  <p class="text-gray-500">No logs found for this task.</p>
	{:else}
	  {#each userLogs as log}
		<div class="timeline-item">
		  <div class="timeline-time">
			{log.timeSpentDisplay}
		  </div>
		  <div class="timeline-content">
			<h3>{log.activity}</h3>
			<p class="text-gray-600">{new Date(log.timestamp).toLocaleString()}</p>
			<small class="text-gray-500">{log.sync_status}</small>
		  </div>
		</div>
	  {/each}
	{/if}
  </div>
  
  <style>
	.timeline-item {
	  display: flex;
	  align-items: flex-start;
	  margin-bottom: 20px;
	}
  
	.timeline-time {
	  width: 80px;
	  text-align: right;
	  margin-right: 20px;
	  color: #4CAF50; /* Customize this color */
	}
  
	.timeline-content {
	  background: #f9f9f9;
	  padding: 15px;
	  border-radius: 8px;
	  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
	  flex-grow: 1;
	}
  
	.timeline-content h3 {
	  margin: 0 0 5px;
	  font-size: 16px;
	  font-weight: bold;
	}
  
	.timeline-content p {
	  margin: 0 0 5px;
	  color: #333;
	}
  
	.timeline-content small {
	  color: #666;
	}
  </style>
  