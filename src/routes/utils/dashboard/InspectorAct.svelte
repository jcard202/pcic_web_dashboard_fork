<script lang="ts">
    import {
      Button,
      Table,
      TableBody,
      TableBodyCell,
      TableBodyRow,
      TableHead,
      TableHeadCell,
      Toolbar,
      Input,
      Heading,
    } from 'flowbite-svelte';
    import { supabase_content } from '../../../supabase';
    import { onMount } from 'svelte';
    import TaskTimeline from './TaskTimeline.svelte'; // Import the TaskTimeline component
  
    export let userId: string | null = null;
  
    let activities: any[] = [];
    let selectedTaskId: string | null = null; // Track the UUID of the selected task
    let isLoading = true;
    let dataError: string | null = null;
  
    async function fetchActivities() {
      if (!userId) return;
  
      isLoading = true;
      try {
        const { data, error } = await supabase_content
          .from('tasks')
          .select('id, task_number, status, created_at') // Ensure 'id' is selected
          .eq('assignee', userId) // Use userId to filter tasks
          .order('created_at', { ascending: false });
  
        if (error) {
          dataError = error.message;
          console.error('Error fetching activities:', error);
          isLoading = false;
          return;
        }
  
        activities = data.map(task => ({
          id: task.id, // Store the UUID
          task: `Task ${task.task_number}`,
          status: task.status,
          timestamp: new Date(task.created_at).toLocaleString()
        }));
      } catch (error) {
        dataError = (error as Error).message;
        console.error('Error:', error);
      }
      isLoading = false;
    }
  
    function getStatusColor(status: string) {
      switch (status.toLowerCase()) {
        case 'completed': return 'text-green-600';
        case 'ongoing': return 'text-blue-600';
        case 'pending': return 'text-yellow-600';
        default: return 'text-gray-600';
      }
    }
  
    function handleRowClick(taskId: string) {
      selectedTaskId = taskId; // Use the UUID to set the selected task ID
    }
    
    onMount(() => {
      fetchActivities();
    });
  </script>
  
  <div class="p-4">
    {#if selectedTaskId}
      <!-- Show the task timeline if a task is selected -->
      <TaskTimeline {selectedTaskId} />
      <Button on:click={() => (selectedTaskId = null)} class="mt-4">Back to Tasks</Button>
    {:else}
      <!-- Show the task list if no task is selected -->
      <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
        Inspector Activities
      </Heading>
  
      <Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
        <Input placeholder="Search activities" class="me-6 w-80 border xl:w-96" />
        <div slot="end" class="space-x-2">
          <Button class="whitespace-nowrap">Export Logs</Button>
        </div>
      </Toolbar>
  
      {#if dataError}
        <p class="text-red-500">{dataError}</p>
      {:else if isLoading}
        <p>Loading...</p>
      {:else if activities.length === 0}
        <p class="text-gray-500">No activities found for this inspector.</p>
      {:else}
        <Table hoverable={true}>
          <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
            <TableHeadCell class="ps-4 font-normal">Task</TableHeadCell>
            <TableHeadCell class="ps-4 font-normal">Status</TableHeadCell>
            <TableHeadCell class="ps-4 font-normal">Timestamp</TableHeadCell>
          </TableHead>
          <TableBody>
            {#each activities as activity}
              <TableBodyRow class="text-base cursor-pointer" on:click={() => handleRowClick(activity.id)}>
                <TableBodyCell class="ps-4">{activity.task}</TableBodyCell>
                <TableBodyCell class="ps-4">
                  <span class={getStatusColor(activity.status)}>
                    {activity.status}
                  </span>
                </TableBodyCell>
                <TableBodyCell class="ps-4">{activity.timestamp}</TableBodyCell>
              </TableBodyRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    {/if}
  </div>
  