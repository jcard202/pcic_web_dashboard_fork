<script lang="ts">

    import { Breadcrumb, BreadcrumbItem, Button, Checkbox, Drawer, Heading, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toolbar, ToolbarButton } from 'flowbite-svelte';

    let activities = [
        { id: 1, task: "Assigned Task A", status: "Assigned", timestamp: "2024-07-18 08:30" },
        { id: 2, task: "Completed Task B", status: "Completed", timestamp: "2024-07-18 10:00" },
        { id: 3, task: "Started Task C", status: "Ongoing", timestamp: "2024-07-18 11:15" },
    ];
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    <div class="p-4">
        <Breadcrumb class="mb-5">
            <BreadcrumbItem home>Home</BreadcrumbItem>
            <BreadcrumbItem href="/crud/logs">Logs</BreadcrumbItem>
            <BreadcrumbItem>Activity</BreadcrumbItem>
        </Breadcrumb>
        <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Inspector Activities
        </Heading>

        <Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
            <Input placeholder="Search activities" class="me-6 w-80 border xl:w-96" />
            <div slot="end" class="space-x-2">
                <Button class="whitespace-nowrap">Export Logs</Button>
            </div>
        </Toolbar>

        <Table>
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
                        <TableBodyCell class="ps-4">{activity.status}</TableBodyCell>
                        <TableBodyCell class="ps-4">{activity.timestamp}</TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
</main>

<style>
    main {
        padding: 16px;
    }
</style>
