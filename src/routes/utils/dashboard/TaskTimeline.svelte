<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase_content } from '../../../supabase';
  import { User, AlertCircle } from 'lucide-svelte';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import mapboxgl from 'mapbox-gl';

  export let userId: string;

  interface SupabaseLog {
    timestamp: string;
    activity: string;
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
        .select('timestamp, activity, sync_status, longlat')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        dataError = 'No timeline available for this user.';
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
    if (userLogs.length > 0) {
      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [0, 0],
        zoom: 2,
      });
    }
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
    fetchUserLogs().then(() => {
      if (userLogs.length > 0) {
        initializeMap();
      }
    });
  });
</script>

<div class="flex h-screen bg-gray-900 text-white">
  {#if isLoading}
    <div class="w-full flex items-center justify-center">
      <img src="/images/pcic-spinner.gif" alt="Loading..." class="h-16 w-16"/>
    </div>
  {:else if dataError || userLogs.length === 0}
    <div class="w-full flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle size={48} class="text-yellow-400 mb-4" />
      <h2 class="text-2xl font-bold mb-2">No Timeline Data Available</h2>
      <p class="text-gray-400 max-w-md">
        We couldn't find any timeline data for this user. This could be because the user hasn't performed any logged activities yet.
      </p>
    </div>
  {:else}
    <div class="w-1/2 overflow-y-auto p-4">
      {#each userLogs as log}
        <div class="bg-gray-800 rounded-lg p-4 shadow mb-4 transition-all duration-300 hover:bg-gray-700">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm text-gray-400">
              {new Date(log.timestamp).toLocaleString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              })}
            </span>
            <button
              class="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors duration-300"
              on:click={() => log.longlat && updateMapLocation(log.longlat)}
            >
              <User size={16} />
            </button>
          </div>
          <h3 class="text-lg font-semibold mb-1">{log.activity}</h3>
          <p class="text-sm text-gray-400">{log.sync_status}</p>
          {#if log.longlat}
            <p class="text-sm text-gray-400">Location: {log.longlat}</p>
          {/if}
        </div>
      {/each}
      <div class="h-20"></div>
    </div>

    <div id="map" class="w-1/2 h-full"></div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #1a202c;
    color: white;
  }
</style>