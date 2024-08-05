<script lang="ts">
    import {
        Button,
        Card,
        Checkbox,
        Dropdown,
        Heading,
        Input,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Toolbar,
        Breadcrumb,
        BreadcrumbItem
    } from 'flowbite-svelte';
    import { ChevronDownOutline, ChevronLeftOutline } from 'flowbite-svelte-icons';
    import { ArrowDownOutline, ArrowUpOutline } from 'flowbite-svelte-icons';
    import StatusBadge from './StatusBadge.svelte';
    import PaginationComponent from './Pagination.svelte';
    import { onMount } from 'svelte';
    import { supabase_content } from '../../../supabase';

    export let dark: boolean = false;

    // State variables
    let showActivity = false;
    let selectedUserId: string | null = null;
    let inspectors: any[] = [];
    let activities: any[] = [];
    let isLoading = true;
    let dataError: string | null = null;

    // Fetch inspector data
    async function fetchInspectors() {
        isLoading = true;
        try {
            const { data: users, error: usersError } = await supabase_content
                .from('users')
                .select('id, inspector_name, mobile_number, is_online');

            if (usersError) {
                dataError = usersError.message;
                console.error('Error fetching users:', usersError);
                isLoading = false;
                return;
            }

            const { data: tasks, error: tasksError } = await supabase_content
                .from('tasks')
                .select('id, assignee, status, created_at');

            if (tasksError) {
                dataError = tasksError.message;
                console.error('Error fetching tasks:', tasksError);
                isLoading = false;
                return;
            }

            // Get the current date
            const today = new Date();
            const currentDayOfWeek = today.getDay();

            // Calculate the start of the week (Sunday)
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - currentDayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);

            // Calculate the end of the week (Saturday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            // Process and combine the data
            inspectors = users.map((user) => {
                const userTasks = tasks.filter((task) => task.assignee === user.id);
                const totalDispatch = userTasks.length;
                const completed = userTasks.filter((task) => task.status === 'completed').length;
                const backlogs = userTasks.filter((task) => task.status === 'ongoing').length;

                // Calculate completed tasks for each day of the week
                const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const tasksByDay = weekDays.map((day, index) => {
                    const dayStart = new Date(startOfWeek);
                    dayStart.setDate(startOfWeek.getDate() + index);
                    const dayEnd = new Date(dayStart);
                    dayEnd.setHours(23, 59, 59, 999);

                    return userTasks.filter((task) => {
                        const taskDate = new Date(task.created_at);
                        return taskDate >= dayStart && taskDate <= dayEnd && task.status === 'completed';
                    }).length;
                });

                return {
                    id: user.id,
                    name: user.inspector_name,
                    mobile: user.mobile_number,
                    online: user.is_online,
                    ...tasksByDay.reduce((acc, count, index) => ({ ...acc, [weekDays[index]]: count }), {}),
                    totalDispatch,
                    completed,
                    backlogs
                };
            });

        } catch (error) {
            dataError = (error as Error).message;
            console.error('Error:', error);
        }
        isLoading = false;
    }

    // Fetch activities for a specific inspector
    async function fetchActivities(userId: string) {
        isLoading = true;
        try {
            const { data, error } = await supabase_content
                .from('tasks')
                .select('task_number, status, created_at')
                .eq('assignee', userId)
                .order('created_at', { ascending: false });

            if (error) {
                dataError = error.message;
                console.error('Error fetching activities:', error);
                isLoading = false;
                return;
            }

            activities = data.map((task, index) => ({
                id: index + 1,
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

    // Handle inspector row click
    function handleRowClick(userId: string) {
        selectedUserId = userId;
        fetchActivities(userId);
        showActivity = true;
    }

    // Go back to inspector list
    function goBack() {
        showActivity = false;
        selectedUserId = null;
        activities = [];
    }

    // Get status color
    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-green-600';
            case 'ongoing': return 'text-blue-600';
            case 'pending': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    }

    // Fetch inspectors on mount
    onMount(() => {
        fetchInspectors();
    });

    // Table headers for inspectors
    const headers = [
        'Inspector Name',
        'Mobile Number',
        'Online',
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Total Dispatch',
        'Total Completed',
        'Backlogs'
    ];
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    {#if showActivity}
        <div class="p-4">
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
                            <TableBodyRow class="text-base">
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
    {:else}
        <div class="p-4">
            <Breadcrumb class="mb-5">
                <BreadcrumbItem home href="/sidebar">Home</BreadcrumbItem>
                <BreadcrumbItem href="/sidebar/crud/logs">Logs</BreadcrumbItem>
                <BreadcrumbItem>Activity</BreadcrumbItem>
            </Breadcrumb>
            
            <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                Inspectors
            </Heading>

            {#if dataError}
                <p class="text-red-500">{dataError}</p>
            {:else if isLoading}
                <p>Loading...</p>
            {:else}
                <Table hoverable={true}>
                    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                        {#each headers as header}
                            <TableHeadCell class="whitespace-nowrap p-4 font-normal text-center">{header}</TableHeadCell>
                        {/each}
                    </TableHead>
                    <TableBody>
                        {#each inspectors as inspector}
                            <TableBodyRow on:click={() => handleRowClick(inspector.id)} class="cursor-pointer">
                                <TableBodyCell class="ps-4 text-center">{inspector.name}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.mobile}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">
                                    <StatusBadge state={inspector.online ? 'online' : 'offline'} {dark} />
                                </TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Sun}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Mon}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Tue}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Wed}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Thu}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Fri}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.Sat}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.totalDispatch}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.completed}</TableBodyCell>
                                <TableBodyCell class="ps-4 text-center">{inspector.backlogs}</TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {/if}
        </div>
    {/if}
</main>

<style>
    main {
        padding: 16px;
    }
    .text-center {
        text-align: center;
    }
</style>
