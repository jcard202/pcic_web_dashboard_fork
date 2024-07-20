<script lang="ts">
    import { Breadcrumb, BreadcrumbItem, Button, Checkbox, Drawer, Heading, Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toolbar, ToolbarButton } from 'flowbite-svelte';
    
    let timeIndications = [
        { id: 1, task: "Task A", event: "Start", timestamp: "2024-07-18 08:00" },
        { id: 2, task: "Task A", event: "Ongoing", timestamp: "2024-07-18 08:30" },
        { id: 3, task: "Task A", event: "Completion", timestamp: "2024-07-18 10:00" },
        { id: 4, task: "Task B", event: "Last Known Location", timestamp: "2024-07-18 09:45" },
    ];
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    <div class="p-4">
        <Breadcrumb class="mb-5">
            <BreadcrumbItem home>Home</BreadcrumbItem>
            <BreadcrumbItem href="/crud/logs">Logs</BreadcrumbItem>
            <BreadcrumbItem>Time Indications</BreadcrumbItem>
        </Breadcrumb>
        <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Task Time Indications
        </Heading>

        <Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
            <Input placeholder="Search time indications" class="me-6 w-80 border xl:w-96" />
            <div slot="end" class="space-x-2">
                <Button class="whitespace-nowrap">Export Logs</Button>
            </div>
        </Toolbar>

        <Table>
            <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                <TableHeadCell class="w-4 p-4">#</TableHeadCell>
                <TableHeadCell class="ps-4 font-normal">Task</TableHeadCell>
                <TableHeadCell class="ps-4 font-normal">Event</TableHeadCell>
                <TableHeadCell class="ps-4 font-normal">Timestamp</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each timeIndications as indication}
                    <TableBodyRow class="text-base">
                        <TableBodyCell class="w-4 p-4">{indication.id}</TableBodyCell>
                        <TableBodyCell class="ps-4">{indication.task}</TableBodyCell>
                        <TableBodyCell class="ps-4">{indication.event}</TableBodyCell>
                        <TableBodyCell class="ps-4">{indication.timestamp}</TableBodyCell>
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
