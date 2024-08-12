<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase_content } from '../../../supabase';
  import { User } from 'lucide-svelte';

  export let selectedTaskId: string;

  interface SupabaseLog {
    timestamp: string;
    activity: string;
    last_synced_at: string;
    sync_status: string;
  }

  interface UserLog extends SupabaseLog {
    timeConsumed: string;
  }

  let userLogs: UserLog[] = [];
  let isLoading = true;
  let dataError: string | null = null;

  async function fetchUserLogs() {
    try {
      const { data, error } = await supabase_content
        .from('user_logs')
        .select('timestamp, activity, last_synced_at, sync_status')
        .eq('task_id', selectedTaskId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        dataError = 'No timeline available for this task.';
      } else {
        userLogs = data.map((log: SupabaseLog) => ({
          ...log,
          timeConsumed: calculateTimeConsumed(log.timestamp, log.last_synced_at)
        }));
      }
    } catch (error) {
      dataError = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Fetch error:', error);
    } finally {
      isLoading = false;
    }
  }

  function calculateTimeConsumed(timestamp: string, lastSyncedAt: string): string {
    const timeConsumed = new Date(lastSyncedAt).getTime() - new Date(timestamp).getTime();
    const seconds = Math.abs(Math.floor(timeConsumed / 1000));
    
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  }

  onMount(fetchUserLogs);
</script>

<div class="timeline-container space-y-6 p-6 bg-white rounded-lg shadow">
  {#if dataError}
    <div class="error-message text-red-500" role="alert">{dataError}</div>
  {:else if isLoading}
    <div class="loading-container text-gray-500">Loading...</div>
  {:else}
    {#each userLogs as log}
      <div class="flex items-start">
        <div class="flex-shrink-0 w-20 text-sm text-gray-500">
          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div class="flex-grow">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User class="w-6 h-6 text-blue-500" />
            </div>
            <div class="flex-grow">
              <p class="text-base font-medium text-gray-900">{log.activity}</p>
              <p class="text-sm text-gray-500">{log.sync_status}</p>
              <p class="text-sm text-gray-500">Time consumed: {log.timeConsumed}</p>
            </div>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>