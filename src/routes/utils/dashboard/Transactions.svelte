<script lang="ts">
    import { onMount } from 'svelte';
    import InspectorAct from './InspectorAct.svelte';
    import {
        Breadcrumb,
        BreadcrumbItem,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Heading,
    } from 'flowbite-svelte';
    import { supabase_content } from '../../../supabase';

    let showActivity = false;
    let selectedUserId: string | null = null;
    let inspectors: any[] = [];
    let isLoading = true;
    let dataError: string | null = null;

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

            const today = new Date();
            const currentDayOfWeek = today.getDay();

            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - currentDayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            inspectors = users.map((user) => {
                const userTasks = tasks.filter((task) => task.assignee === user.id);
                const totalDispatch = userTasks.length;
                const completed = userTasks.filter((task) => task.status === 'completed').length;
                const backlogs = userTasks.filter((task) => task.status === 'ongoing').length;

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

    function handleRowClick(userId: string) {
        selectedUserId = userId;
        showActivity = true;
    }

    function goBack() {
        showActivity = false;
        selectedUserId = null;
    }

    onMount(() => {
        fetchInspectors();
    });

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
    {#if showActivity && selectedUserId}
        <InspectorAct userId={selectedUserId} {goBack} />
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
                                    <span class={inspector.online ? 'text-green-600' : 'text-gray-600'}>
                                        {inspector.online ? 'Online' : 'Offline'}
                                    </span>
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
</style>
