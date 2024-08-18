<script lang="ts">
    import { onMount } from 'svelte';
    import TaskTimeline from './TaskTimeline.svelte';
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
        Button,
        Checkbox,
        Modal
    } from 'flowbite-svelte';
    import { supabase_content } from '../../../supabase';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    import * as XLSX from 'xlsx';
    import { FilePdfOutline, TableColumnOutline } from 'flowbite-svelte-icons';

    let showActivity = false;
    let selectedUserId: string | null = null;
    let inspectors: any[] = [];
    let isLoading = true;
    let dataError: string | null = null;

    // Dropdown states
    let selectedMonth = new Date().getMonth(); // Default to the current month
    let selectedDay = new Date().getDate(); // Default to today's date
    let selectedWeek = getCurrentWeekNumber(new Date()); // Default to the current week

    let monthOptions = Array.from({ length: 12 }, (_, i) => i); // Array for 12 months
    let dayOptions = Array.from({ length: 31 }, (_, i) => i + 1); // Array for 31 days
    let weekOptions: any[] = []; // Dynamically populated based on selected date

    let showColumnModal = false;
    let taskActiveHeaders = [
        'Inspector Name', 'Mobile Number', 'Online', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total Dispatch', 'Total Completed', 'Backlogs'
    ];

    let taskSelectedHeaders = [...taskActiveHeaders];

    function getCurrentWeekNumber(date: Date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const diff = (date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
        const oneWeek = 604800000;
        return Math.floor(diff / oneWeek) + 1;
    }

    function getStartAndEndOfWeek(week: number, month: number, year: number) {
        const start = new Date(year, month, (week - 1) * 7 + 1);
        const end = new Date(year, month, (week - 1) * 7 + 7);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    function updateWeekOptions() {
        const selectedDate = new Date(new Date().getFullYear(), selectedMonth, selectedDay);
        selectedWeek = getCurrentWeekNumber(selectedDate);
        const totalWeeksInMonth = getCurrentWeekNumber(new Date(new Date().getFullYear(), selectedMonth + 1, 0)); // Get number of weeks in the month
        weekOptions = Array.from({ length: totalWeeksInMonth }, (_, i) => i + 1);
    }

    async function fetchInspectors() {
        isLoading = true;
        try {
            const { data: users, error: usersError } = await supabase_content
                .from('users')
                .select(`
                    id, 
                    inspector_name, 
                    mobile_number, 
                    is_online, 
                    email,
                    regions (
                        region_name
                    )
                `)
                .eq('role', 'Agent');

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
            const { start: startOfWeek, end: endOfWeek } = getStartAndEndOfWeek(selectedWeek, selectedMonth, today.getFullYear());

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
                    backlogs,
                    email: user.email,
                    region: user.regions?.region_name ?? 'N/A',
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

    function handleMonthChange(event: Event) {
        selectedMonth = parseInt((event.target as HTMLSelectElement).value);
        updateWeekOptions(); // Update week options based on selected month and day
        fetchInspectors();
    }

    function handleDayChange(event: Event) {
        selectedDay = parseInt((event.target as HTMLSelectElement).value);
        updateWeekOptions(); // Update week options based on selected month and day
        fetchInspectors();
    }

    function handleWeekChange(event: Event) {
        selectedWeek = parseInt((event.target as HTMLSelectElement).value);
        const { start: startOfWeek } = getStartAndEndOfWeek(selectedWeek, selectedMonth, new Date().getFullYear());
        selectedDay = startOfWeek.getDate(); // Adjust the selected day to the first day of the week
        fetchInspectors();
    }

    // Toggles header selection
    const toggleHeader = (header: string) => {
        taskSelectedHeaders = taskSelectedHeaders.includes(header)
            ? taskSelectedHeaders.filter((h) => h !== header)
            : [...taskSelectedHeaders, header];
    };

    // Updates the active columns based on selected headers
    const updateColumns = () => {
        taskActiveHeaders = [...taskSelectedHeaders];
        showColumnModal = false;
    };

    const mapInspectorData = (inspector: any, headers: string[]) => {
    const mappedData = headers.reduce((acc, header) => {
        switch (header) {
            case "Inspector Name":
                acc[header] = inspector.name ?? 'N/A';
                break;
            case "Mobile Number":
                acc[header] = inspector.mobile ?? 'N/A';
                break;
            case "Online":
                acc[header] = inspector.online ? 'Yes' : 'No';
                break;
            case "Mon":
                acc[header] = inspector.Mon ?? 0;
                break;
            case "Tue":
                acc[header] = inspector.Tue ?? 0;
                break;
            case "Wed":
                acc[header] = inspector.Wed ?? 0;
                break;
            case "Thu":
                acc[header] = inspector.Thu ?? 0;
                break;
            case "Fri":
                acc[header] = inspector.Fri ?? 0;
                break;
            case "Sat":
                acc[header] = inspector.Sat ?? 0;
                break;
            case "Sun":
                acc[header] = inspector.Sun ?? 0;
                break;
            case "Total Dispatch":
                acc[header] = inspector.totalDispatch ?? 0;
                break;
            case "Total Completed":
                acc[header] = inspector.completed ?? 0;
                break;
            case "Backlogs":
                acc[header] = inspector.backlogs ?? 0;
                break;
            case "Email":
                acc[header] = inspector.email ?? 'N/A';
                break;
            case "Region":
                acc[header] = inspector.region ?? 'N/A';
                break;
            default:
                acc[header] = 'N/A';
        }
        return acc;
    }, {} as { [key: string]: any });

    return mappedData;
};


    const generatePDF = () => {
    const doc = new jsPDF({
        orientation: 'landscape', // Change to landscape mode to fit more columns
        unit: 'pt',
        format: 'A4'
    });
    
    const headers = taskActiveHeaders;
    const body = inspectors.map(inspector => headers.map(header => mapInspectorData(inspector, headers)[header]));

    doc.setFontSize(18);
    doc.text("Inspectors Weekly Tasks", doc.internal.pageSize.width / 2, 25, {
        align: 'center'
    });

    autoTable(doc, {
        head: [headers],
        body,
        startY: 45,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185], // Table header background color
            textColor: [255, 255, 255],
            fontSize: 10, // Adjusted font size for headers
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8, // Adjusted font size for body text
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Adjust column widths dynamically
            1: { cellWidth: 'auto' },
            // You can define other columns here similarly if needed
        },
        styles: {
            overflow: 'linebreak',
            cellWidth: 'wrap',
        },
        margin: { top: 20 },
        didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 1) {
                data.cell.styles.cellWidth = 'auto'; // Allow dynamic width for some columns
            }
        },
        tableWidth: 'auto' // Auto adjust the table width to fit the content
    });

    doc.save("inspectors_report.pdf");
};



const generateExcel = () => {
    const headers = taskActiveHeaders;
    const body = inspectors.map(inspector => mapInspectorData(inspector, headers));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(body, { header: headers });
    // Adjust column widths
    const columnWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    worksheet['!cols'] = columnWidths;

    // Create workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inspectors Weekly Tasks");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "inspectors_report.xlsx");
};


    onMount(() => {
        updateWeekOptions(); // Initialize week options
        fetchInspectors();
    });

    const headers = [
        'Inspector Name',
        'Mobile Number',
        'Online',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun',
        'Total Dispatch',
        'Total Completed',
        'Backlogs',
        'Email',
        'Region'
    ];
</script>

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    {#if showActivity && selectedUserId}
        <TaskTimeline userId={selectedUserId} on:back={goBack} />
    {:else}
        <div class="p-4">
            <Breadcrumb class="mb-5">
                <BreadcrumbItem home href="/sidebar">Home</BreadcrumbItem>
                <BreadcrumbItem href="/sidebar/crud/logs">Logs</BreadcrumbItem>
                <BreadcrumbItem>Weekly Tasks</BreadcrumbItem>
            </Breadcrumb>

            <Heading tag="h1" class="text-xl font-semibold mb-7 text-gray-900 dark:text-white sm:text-2xl">
                Inspectors Weekly Tasks
            </Heading>

            <div class="mb-4 flex space-x-4">
                <div>
                    <label for="monthSelect" class="mr-2 text-gray-300">Select Month:</label>
                    <select id="monthSelect" on:change={handleMonthChange} bind:value={selectedMonth}
                            class="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {#each monthOptions as month}
                            <option value={month} selected={month === selectedMonth}>
                                {new Date(0, month).toLocaleString('default', { month: 'long' })}
                            </option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label for="daySelect" class="mr-2 text-gray-300">Select Day:</label>
                    <select id="daySelect" on:change={handleDayChange} bind:value={selectedDay}
                            class="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {#each dayOptions as day}
                            <option value={day} selected={day === selectedDay}>{day}</option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label for="weekSelect" class="mr-2 text-gray-300">Select Week:</label>
                    <select id="weekSelect" on:change={handleWeekChange} bind:value={selectedWeek}
                            class="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {#each weekOptions as week}
                            <option value={week} selected={week === selectedWeek}>Week {week}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="flex justify-end space-x-4 mb-4">
                <Button
                    on:click={() => (showColumnModal = true)}
                    color="light"
                    size="xs"
                    class="flex items-center gap-2"
                >
                    <FilePdfOutline /> Customize Columns
                </Button>
                <Button
                    class="flex items-center gap-2 text-xs"
                    color="light"
                    size="xs"
                    on:click={generatePDF}><FilePdfOutline /> Download PDF</Button>
                <Button
                    class="flex items-center gap-2 text-xs"
                    color="light"
                    size="xs"
                    on:click={generateExcel}><TableColumnOutline /> Download Excel</Button>
            </div>

            {#if dataError}
                <p class="text-red-500">{dataError}</p>
            {:else if isLoading}
                <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <img src="/images/pcic-spinner.gif" alt="Loading..." class="h-1/2 w-1/3"/>
                </div>
            {:else}
                <Table hoverable={true}>
                    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                        {#each taskActiveHeaders as header}
                            <TableHeadCell class="whitespace-nowrap p-4 font-normal text-center">{header}</TableHeadCell>
                        {/each}
                    </TableHead>
                    <TableBody>
                        {#each inspectors as inspector}
                            <TableBodyRow on:click={() => handleRowClick(inspector.id)} class="cursor-pointer">
                                {#each taskActiveHeaders as header}
                                    <TableBodyCell class="ps-4 text-center">{mapInspectorData(inspector, taskActiveHeaders)[header]}</TableBodyCell>
                                {/each}
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            {/if}
        </div>
    {/if}
</main>

<Modal bind:open={showColumnModal} size="lg" autoclose={false}>
    <div class="py-4">
        <h2 class="mb-4 text-2xl font-bold text-gray-500 dark:text-gray-400">Customize Columns</h2>

        <div class="grid grid-cols-3 gap-2">
            {#each headers as header}
                <Checkbox
                    checked={taskSelectedHeaders.includes(header)}
                    on:change={() => toggleHeader(header)}
                >
                    {header}
                </Checkbox>
            {/each}
        </div>

        <div class="flex justify-end">
            <Button class="mt-4" size="xs" color="alternative" on:click={updateColumns}>
                Update Columns
            </Button>
        </div>
    </div>
</Modal>

<style>
    main {
        padding: 16px;
    }
</style>
