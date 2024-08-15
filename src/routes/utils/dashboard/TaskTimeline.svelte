<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase_content } from '../../../supabase';
  import { User } from 'lucide-svelte';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import mapboxgl from 'mapbox-gl';

  export let selectedTaskId: string;

  interface SupabaseLog {
    timestamp: string;
    activity: string;
    last_synced_at: string;
    sync_status: string;
    longlat: string | null;
  }

  let userLogs: SupabaseLog[] = [];
  let isLoading = true;
  let dataError: string | null = null;
  let map: mapboxgl.Map | null = null;
  let marker: mapboxgl.Marker | null = null;

  mapboxgl.accessToken = 'pk.eyJ1IjoicXVhbmJ5ZGV2cyIsImEiOiJjbHplNmtybm4wbHZsMmlva3pkbDY2bG1yIn0.I-82-7hu310FPXYvKTIMMQ';

  async function fetchUserLogs() {
    try {
      const { data, error } = await supabase_content
        .from('user_logs')
        .select('timestamp, activity, last_synced_at, sync_status, longlat')
        .eq('task_id', selectedTaskId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        dataError = 'No timeline available for this task.';
      } else {
        userLogs = data;
      }
    } catch (error) {
      dataError = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Fetch error:', error);
    } finally {
      isLoading = false;
    }
  }

  function initializeMap() {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0], // Default center
      zoom: 2,
    });
  }

  function updateMapLocation(longlat: string) {
    if (!map) return;

    const [lat, lng] = longlat.split(',').map(Number);

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error("Invalid latitude or longitude values:", { lat, lng });
      return;
    }

    if (!marker) {
      marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      marker.setLngLat([lng, lat]);
    }

    map.setCenter([lng, lat]);
    map.setZoom(15);
  }

  onMount(() => {
    fetchUserLogs();
    initializeMap();
  });
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
  <div class="flex flex-col md:flex-row max-w-6xl mx-auto p-4 space-y-6 md:space-y-0 md:space-x-6">
    <div class="w-full md:w-2/3 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      {#if dataError}
        <p class="text-red-500 dark:text-red-400">{dataError}</p>
      {:else if isLoading}
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
      {:else}
        {#each userLogs as log}
          <div class="flex items-start py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="w-24 text-sm text-gray-500 dark:text-gray-400">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div class="flex-grow">
              <div class="flex items-center space-x-3">
                <button
                  type="button"
                  class="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-700 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-600"
                  on:click={() => log.longlat && updateMapLocation(log.longlat)}
                  on:keydown={(event) => event.key === 'Enter' && log.longlat && updateMapLocation(log.longlat)}
                  aria-label="Show location on map"
                >
                  <User class="w-6 h-6 text-blue-500 dark:text-blue-300" />
                </button>
                <div>
                  <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{log.activity}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{log.sync_status}</p>
                  {#if log.longlat}
                    <p class="text-sm text-gray-500 dark:text-gray-400">Location: {log.longlat}</p>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div id="map" class="w-full md:w-1/3 h-96 rounded-lg shadow-md"></div>
  </div>
</main>
