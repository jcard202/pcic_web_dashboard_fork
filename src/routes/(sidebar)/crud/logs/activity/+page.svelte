<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { 
        Breadcrumb, 
        BreadcrumbItem, 
        Button, 
        Heading, 
        Input, 
        Table, 
        TableBody, 
        TableBodyCell, 
        TableBodyRow, 
        TableHead, 
        TableHeadCell, 
        Toolbar 
    } from 'flowbite-svelte';

    interface Activity {
        task_number: string;
        status: string;
        created_at: string;
    }

    type PageDataWithActivities = PageData & {
        activities: Activity[];
    };

    export let data: PageDataWithActivities;

    $: activities = data.activities ? data.activities.map((task, index) => ({
        id: index + 1,
        task: `Task ${task.task_number}`,
        status: task.status,
        timestamp: new Date(task.created_at).toLocaleString()
    })) : [];

    function goBack() {
        goto('/sidebar/crud/logs'); // Adjust this path if needed
    }

    function getStatusColor(status: string) {
        switch(status.toLowerCase()) {
            case 'completed': return 'text-green-600';
            case 'ongoing': return 'text-blue-600';
            case 'pending': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    }
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    <div class="p-4">
        <Breadcrumb class="mb-5">
            <BreadcrumbItem home href="/sidebar">Home</BreadcrumbItem>
            <BreadcrumbItem href="/sidebar/crud/logs">Logs</BreadcrumbItem>
            <BreadcrumbItem>Activity</BreadcrumbItem>
        </Breadcrumb>
        
        <Button on:click={goBack} class="mb-4">Back to Inspectors</Button>
        
        <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Inspector Activities
        </Heading>

        <Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
           <Input placeholder="Search activities" class="me-6 w-80 border xl:w-96" />
            <div slot="end" class="space-x-2">
                <Button class="whitespace-nowrap">Export Logs</Button>
            </div>
        </Toolbar>

        {#if data.error}
            <p class="text-red-500">{data.error}</p>
        {:else if activities.length === 0}
            <p class="text-gray-500">No activities found for this inspector.</p>
        {:else}
            <Table hoverable={true}>
                <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                    <TableHeadCell class="w-4 p-4">#</TableHeadCell>
                    <TableHeadCell class="ps-4 font-normal">Task</TableHeadCell>
                    <TableHeadCell class="ps-4 font-normal">Status</TableHeadCell>
                    <TableHeadCell class="ps-4 font-normal">Timestamp</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each activities as activity}
                        <TableBodyRow class="text-base">
                            <TableBodyCell class="w-4 p-4">{activity.id}</TableBodyCell>
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
    </div>
</main>

<style>
    main {
        padding: 16px;
    }
</style>
