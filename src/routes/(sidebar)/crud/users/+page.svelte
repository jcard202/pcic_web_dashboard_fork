<script lang="ts">
    import { onMount } from 'svelte';
    import {
        Avatar,
        Breadcrumb,
        BreadcrumbItem,
        Button,
        Checkbox,
        Heading,
        Input,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Toolbar,
        ToolbarButton,
    } from 'flowbite-svelte';
    import {
        CogSolid,
        DotsVerticalOutline,
        DownloadSolid,
        EditOutline,
        ExclamationCircleSolid,
        PlusOutline,
        TrashBinSolid
    } from 'flowbite-svelte-icons';
    import { imagesPath } from '../../../utils/variables';

    import User from './User.svelte';
    import Delete from './Delete.svelte';
    import Toast from '../../../utils/widgets/Toast.svelte';
    import MetaTag from '../../../utils/MetaTag.svelte';

    let openUser: boolean = false;
    let openDelete: boolean = false;
    let userToDelete: string = '';

    let current_user: any = {};
    let users: any[] = [];
    let isLoading = true;
    const path: string = '/crud/users';
    const description: string = 'CRUD users example - PCIC Web Dashboard';
    const title: string = 'PCIC Web Dashboard - CRUD Users';
    const subtitle: string = 'CRUD Users';
    export let data;
    $: ({supabase} = data)
    
    let toastProps: { show: boolean; message: string; type: 'success' | 'error' } = {
        show: false,
        message: '',
        type: 'success'
    };

    onMount( async () => {
        current_user = (await supabase.auth.getUser()).data.user;
        console.log('Component mounted');
        fetchUsers();
    });

    async function fetchUsers() {
        try {
            // console.log(await supabase_content.auth.getSession())
            console.log('Fetching users...');
            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    regions (
                        region_name
                    )
                `).neq('auth_user_id', current_user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            console.log('Fetched users data:', data);
            users = data;
            
            if (users.length === 0) {
                console.log('No users found in the database.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Error fetching users', 'error');
        } finally {
            isLoading = false;
        }
    }

    function handleUserAdded(event: CustomEvent) {
        users = [event.detail, ...users];
        showToast('User added successfully', 'success');
    }

    function handleUserUpdated(event: CustomEvent) {
        const updatedUser = event.detail;
        users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
        showToast('User updated successfully', 'success');
    }

    function handleUserDeleted(event: CustomEvent) {
        const deletedUserId = event.detail;
        users = users.filter(user => user.id !== deletedUserId);
        showToast('User deleted successfully', 'success');
    }

    function showToast(message: string, type: 'success' | 'error') {
        toastProps = { show: true, message, type };
        setTimeout(() => {
            toastProps = { ...toastProps, show: false };
        }, 3000);
    }

    function getStatusColor(is_online: boolean) {
        return is_online ? 'green' : 'gray';
    }

    function getStatusText(is_online: boolean) {
        return is_online ? 'Online' : 'Offline';
    }
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
    <Toast {...toastProps} />
    
    <div class="p-4">
        <Breadcrumb class="mb-5">
            <BreadcrumbItem home>Home</BreadcrumbItem>
            <BreadcrumbItem href="/crud/users">Users</BreadcrumbItem>
            <BreadcrumbItem>List</BreadcrumbItem>
        </Breadcrumb>
        <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            All Agents
        </Heading>

        <Toolbar embedded class="w-full py-4 text-gray-500 dark:text-gray-400">
            <Input placeholder="Search for users" class="me-4 w-80 border xl:w-96" />
            <div class="border-l border-gray-100 pl-2 dark:border-gray-700">
                <ToolbarButton
                    color="dark"
                    class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
                >
                    <CogSolid size="lg" />
                </ToolbarButton>
                <ToolbarButton
                    color="dark"
                    class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
                >
                    <TrashBinSolid size="lg" />
                </ToolbarButton>
                <ToolbarButton
                    color="dark"
                    class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
                >
                    <ExclamationCircleSolid size="lg" />
                </ToolbarButton>
                <ToolbarButton
                    color="dark"
                    class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
                >
                    <DotsVerticalOutline size="lg" />
                </ToolbarButton>
            </div>

            <div slot="end" class="flex items-center space-x-2">
                <Button
                    size="sm"
                    class="gap-2 whitespace-nowrap px-3"
                    on:click={() => ((current_user = {}), (openUser = true))}
                >
                    <PlusOutline size="sm" />Add user
                </Button>
                <Button size="sm" color="alternative" class="gap-2 px-3">
                    <DownloadSolid size="md" class="-ml-1" />Export
                </Button>
            </div>
        </Toolbar>
    </div>
    {#if isLoading}
        <p>Loading...</p>
    {:else if users.length === 0}
        <p>No users found. Add some users to see them here.</p>
    {:else}
        <Table>
            <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                <TableHeadCell class="w-4 p-4"><Checkbox /></TableHeadCell>
                {#each ['Name', 'Status', 'Date Added', 'Role', 'Region', 'Actions'] as title}
                    <TableHeadCell class="p-4 font-medium">{title}</TableHeadCell>
                {/each}
            </TableHead>
            <TableBody>
                {#each users as user}
                    <TableBodyRow class="text-base">
                        <TableBodyCell class="w-4 p-4"><Checkbox /></TableBodyCell>
                        <TableBodyCell class="mr-12 flex items-center space-x-6 whitespace-nowrap p-4">
                            <Avatar src={imagesPath(user.avatar, 'users')} />
                            <div class="text-sm font-normal text-gray-500 dark:text-gray-400">
                                <div class="text-base font-semibold text-gray-900 dark:text-white">{user.inspector_name}</div>
                                <div class="text-sm font-normal text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                        </TableBodyCell>
                        <TableBodyCell class="p-4">
                            <span class="flex items-center">
                                <span class={`h-2.5 w-2.5 rounded-full bg-${getStatusColor(user.is_online)}-500 mr-2`}></span>
                                <span class={`text-sm font-medium text-${getStatusColor(user.is_online)}-500`}>
                                    {getStatusText(user.is_online)}
                                </span>
                            </span>
                        </TableBodyCell>
                        <TableBodyCell class="p-4">
                            {new Date(user.created_at).toLocaleDateString()}
                        </TableBodyCell>
                        <TableBodyCell class="p-4">{user.role}</TableBodyCell>
                        <TableBodyCell class="p-4">{user.regions?.region_name || 'N/A'}</TableBodyCell>
                        <TableBodyCell class="space-x-2 p-4">
                            <Button
                                size="sm"
                                class="gap-2 px-3"
                                on:click={() => ((current_user = user), (openUser = true))}
                            >
                                <EditOutline size="sm" /> Edit user
                            </Button>
                            <Button
                                color="red"
                                size="sm"
                                class="gap-2 px-3"
                                on:click={() => {
                                    userToDelete = user.id;
                                    openDelete = true;
                                }}
                            >
                                <TrashBinSolid size="sm" /> Delete user
                            </Button>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
</main>

<!-- Modals -->
<User bind:open={openUser} data={current_user} on:userAdded={handleUserAdded} on:userUpdated={handleUserUpdated} />
<Delete bind:open={openDelete} userId={userToDelete} on:userDeleted={handleUserDeleted} />