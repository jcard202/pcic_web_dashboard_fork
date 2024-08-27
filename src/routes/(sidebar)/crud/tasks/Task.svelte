<script lang="ts">
	import { Button, CloseButton, Heading, Input, Label, Modal, Select, Textarea } from 'flowbite-svelte';
	import { CheckCircleOutline, CloseOutline, ExclamationCircleOutline, QuestionCircleOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	export let hidden: boolean = true; // modal control
	export let users:any[] = [];
	export let selected_task:any = {};
	export let upsertTask:any = null;
	export let markAsComplete:any = null;
	export let clearForm:any = null;
	export let formView:any;
	let filteredUsers:any[] = [...users];

	let task_name:string;
	let service_group:string;
	let priority:string;
	let status:string = 'for dispatch';
	let ppir_form:any;

	let open:boolean = false;

	let completeWarning:boolean = true;
	let viewForm = false;

	onMount(()=>{
		if(selected_task){
			selected_user =  users.find(user => user.id == selected_task.users.id)
			task_name = selected_task.task_number;
			service_group = selected_task.service_group;
			status = selected_task.status;
			priority = selected_task.priority;
			ppir_form = selected_task.ppir_forms;
		}

		console.log(formView);
	});


	let selected_user:any = {};

	const filterUsers = (event:any) => {
		const query = event.target.value.toLowerCase();
		filteredUsers = users.filter(user => user.inspector_name.toLowerCase().includes(query));
	};
	const handleUserChange = (user:any) => {
		 selected_user = user;
	};
	const handlePOChange = (event:any) => {
		 service_group = event.target.value
	};
	const handlePrioChange = (event:any) => {
		 priority = event.target.value
	};


	const handleTaskNameChange = (event:any) => {
		task_name = event.target.value;
	}

	const getPOFromIndex = (index:number) => {
		switch(index){
			case 4:
				return 'PO4A';
			case 5:
				return 'PO4B';
			default:
				if(index < 4){
					return 'PO' + index
				}else{
					return 'PO' + (index-1)
				}
		}
	}

	const getRegionFromPO = (index: number) => {
		switch(index){
			case 4:
				return '04A';
			case 5:
				return '04B';
			default:
				if(index < 4){
					return index;
				}else{
					return index-1;
				}
		}
	}

	const getTypeFromPO = (PO:string) =>{
		switch(PO){
			case 'PO4A':
				return 'Region 04A PPIR';
			case 'PO4B':
				return 'Region 04B PPIR';
			default:
				if(!PO){
					return null;
				}
				if(PO.split('O')[1].length > 1){
					return 'Region ' + PO.split('O')[1] +' PPIR';
				}else{
					return 'Region 0' + PO.split('O')[1] +' PPIR';
				}
		}
	}

</script>

<Heading tag="h5" class="mb-6 text-sm font-semibold uppercase">{selected_task ? 'Update Task' : 'Add New Task'}</Heading>
<CloseButton
	on:click={() => (hidden = true)}
	class="absolute right-2.5 top-2.5 text-gray-400 hover:text-black dark:text-white"
/>

<form action="#">
	<div class="space-y-4">
		<Label class="space-y-2">
			<span>Name</span>
			<Input
				name="title"
				class="border font-normal outline-none"
				placeholder="Type task name"
				value={task_name}
				on:change={handleTaskNameChange}
				required
			/>
		</Label>

		
		<Label class="space-y-2">
			<span>Service Group</span>
			<Select class="border-gray-300 font-normal outline-none" on:change={handlePOChange} required>
				<option value={null} selected>Select Type</option>
				{#each Array.from({ length: 17 }, (_, i) => i) as num}
					{#if service_group == getPOFromIndex(num+1)}
						<option selected value="{getPOFromIndex(num+1)}">Region {getRegionFromPO(num+1)}</option>
					{:else}
						<option value="{getPOFromIndex(num+1)}">Region {getRegionFromPO(num+1)}</option>
					{/if}
				{/each}
			</Select>
		</Label>
		

		<Label class="space-y-2">
			<span>Service Type</span>
			<Input name="group" class="border font-normal outline-none" readonly placeholder="None"
				value={service_group ? getTypeFromPO(service_group) : ''}
			required />
		</Label>
<!-- 
		<Label class="space-y-2">
			<span>Description</span>
			<Textarea
				rows="4"
				placeholder="Enter event description here"
				class="border-gray-300 font-normal outline-none"
			></Textarea>
		</Label> -->

		<Label class="space-y-2">
			<span>Priority</span>
			<Select class="border-gray-300 font-normal outline-none" on:change={handlePrioChange} required>
				<option value={null} selected>Set Priority</option>
				{#each ['Low', 'Medium', 'High'] as prio}
					{#if priority == prio}
						<option selected value="{prio}">{prio}</option>
					{:else}
						<option value="{prio}">{prio}</option>
					{/if}
				{/each}
			</Select>
		</Label>

		<Label class="space-y-2">
			<span>Assignee</span>
			<Input
				name="assignee"
				class="border font-normal outline-none"
				placeholder="Assigned user"
				readonly
				value={(selected_user) ? selected_user.inspector_name : ''}
				on:input={filterUsers}
				required
			/>
			<div class="w-full px-2"> 
				<div class="w-full h-[2px] opacity-40 dark:bg-white bg-black px-5"></div>
			</div>
			<Input
				name="title"
				class="border font-normal outline-none"
				placeholder="Search users..."
				on:input={filterUsers}
			/>
			<div class= 'w-full h-48 bg-black/[0.05] rounded-lg overflow-y-scroll p-2'>
				{#each filteredUsers as user}
					<Button on:click={()=>handleUserChange(user)} class="w-full mb-2">{user.inspector_name}</Button>
				{/each}
			</div>
		</Label>

		{#if selected_task}
			<Label class="space-y-2">
				<span>PPIR Form</span>
				<Button color='green' on:click={()=>{
					open=true;
					viewForm = true;
				}}  class="w-full mb-2">View Form</Button>
				<Button on:click={()=>{
					open=true;
					viewForm = false;
					completeWarning = false;
				}} color='red' class="w-full mb-2">Clear Form</Button>
			</Label>

			<!-- {#if selected_task.status != 'completed'} -->
				<Label class="space-y-2">
					<span>Status</span>
					<Button on:click={()=>{
						if(selected_task.status == 'completed'){
							return;
						}
						open = true;
						viewForm = false;
						completeWarning = true;
					}} color={selected_task.status =='completed' ? 'green': 'blue'} class="w-full mb-2">{selected_task.status =='completed' ? 'Completed': 'Mark as Complete'}</Button>
				</Label>
			<!-- {/if} -->
		{/if}

		<div class="flex w-full justify-center space-x-4 pb-4">
			<Button on:click = {async()=>{
				if(task_name.trim() == '' && task_name.length > 0){
					task_name = '';
					return;
				}
				const success = await upsertTask({
					id : selected_task?.id,
					task_number: task_name,
					service_group: service_group,
					service_type: getTypeFromPO(service_group),
					priority: priority,
					assignee: selected_user.id,
					status: status,
					task_type: 'ppir',
				})

				if(success){
					hidden = true;
				}
				
				
			}} type="submit" class="w-full">{selected_task ? 'Update Task' : 'Add Task'}</Button>
			<Button color="alternative" class="w-full" on:click={() => (hidden = true)}>
				<CloseOutline />
				Cancel
			</Button>
		</div>
	</div>
</form>

<Modal bind:open size="sm">
	{#if !viewForm}
		{#if completeWarning}
			<QuestionCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-blue-600" />
		{:else}
			<ExclamationCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />
		{/if}

		<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
			{ completeWarning ? 
				"Are you sure you want to mark this task as completed?":
				"Are you sure you want reset the assignee's form?"
			}
		</h3>

		<div class="flex items-center justify-center">
			<Button color={completeWarning ? "blue" : "red"} class="mr-2" on:click={ async()=>{
				if(completeWarning){
					const success = await markAsComplete(selected_task.id)
					if(success){
						selected_task.status = 'completed';
					}
				}else{
					clearForm(selected_task.id);
				}
				open = false;
				hidden = true;
			}}>Yes, I'm sure</Button>
			<Button color="alternative" on:click={() => (open = false)}>No, cancel</Button>
		</div>
	{:else}
		<object  data={formView} width="100%" height="600px"  title="form"></object>
		<div class="flex items-center justify-center">
			<Button color="alternative" on:click={() => (open = false)}>Close</Button>
		</div>
	{/if}
</Modal>
